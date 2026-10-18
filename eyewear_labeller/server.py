from __future__ import annotations

import argparse
import json
import mimetypes
import os
import tempfile
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse

from eyewear_labeller import child_parts
from eyewear_labeller import lenskart_matcher


ROOT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = ROOT_DIR.parent
STATIC_DIR = ROOT_DIR / "static"
MEMORY_DIR = ROOT_DIR / "memory"
PDF_DIR = PROJECT_DIR / "files_PDF"
CAD_DIR = PROJECT_DIR / "files_CAD"
DEFAULT_MODEL_ID = "VC S19003"
SUPPORTED_3D_MODEL_IDS = {"VC S19000", "VC S19001", "VC S19002", "VC S19003", "VC S19004", "VC S19005"}
PHYSICS_MEMORY_PATH = MEMORY_DIR / "eyewear-physics-maths.md"
DEFAULT_MATCHER_API_BASE = "http://127.0.0.1:8010"
DEFAULT_MATCHER_INDEX_PATH = "/tmp/merch_matcher_index/portfolio_index.pkl"
CONFIGURATOR_SUFFIX = ".configurator.json"
FRONT_VIEW_EXPORT = {"width": 1400, "height": 900, "frameWidthRatio": 0.72}
MATCHER_DIMENSIONS_BY_MODEL = {
    "VC S19000": {"a_size": 60, "b_size": 53, "dbl": 14},
    "VC S19001": {"a_size": 60, "b_size": 52, "dbl": 14},
    "VC S19002": {"a_size": 59, "b_size": 46.8, "dbl": 11},
    "VC S19003": {"a_size": 58, "b_size": 42.4, "dbl": 15.6},
    "VC S19004": {"a_size": 57, "b_size": 48.7, "dbl": 16},
    "VC S19005": {"a_size": 59, "b_size": 52.1, "dbl": 15},
}
LANDING_PAGES = (
    {
        "id": "labeller",
        "badge": "Draw",
        "title": "Labeller",
        "description": "Component labels and grouped parts",
        "urlKey": "labellerUrl",
        "primary": True,
    },
    {
        "id": "configurator",
        "badge": "Build",
        "title": "Configurator",
        "description": "3D frame parts, finish, lens, and specs",
        "urlKey": "configuratorUrl",
    },
    {
        "id": "lenskart",
        "badge": "Match",
        "title": "Lenskart matcher",
        "description": "Vincent Chase sample matching workflow",
        "urlKey": "lenskartMatcherUrl",
    },
    {
        "id": "return-prediction",
        "badge": "Predict",
        "title": "Return prediction",
        "description": "30-day return-risk scoring from frame dimensions",
        "urlKey": "returnPredictionUrl",
    },
)


COMPONENTS = {
    "rim",
    "nose_bridge",
    "nose_pad",
    "browbar",
    "temple",
    "temple_tip",
    "end_piece",
    "hinge_joint",
    "rim_lock",
    "lens_former",
    "wire_core",
    "dimension_reference",
    "view_label",
    "other",
}

LABEL_TYPES = {"rect", "polygon"}


def memory_path(model_id: str) -> Path:
    validate_model_id(model_id)
    return MEMORY_DIR / f"{model_id}.labels.json"


def split_configurator_save_id(save_id: str) -> tuple[str, int]:
    if not isinstance(save_id, str):
        raise ValueError("Configurator save id must be a string")
    model_id, separator, suffix = save_id.rpartition("-")
    if not separator or not suffix.isdigit():
        raise ValueError(f"Unsupported configurator save: {save_id}")
    validate_model_id(model_id)
    return model_id, int(suffix)


def configurator_save_name(model_id: str, index: int | None = None) -> str:
    validate_model_id(model_id)
    if index is None:
        index = next_configurator_save_index(model_id)
    return f"{model_id}-{index:02d}"


def configurator_path(save_id: str) -> Path:
    split_configurator_save_id(save_id)
    return MEMORY_DIR / f"{save_id}{CONFIGURATOR_SUFFIX}"


def saved_configurator_records(model_id: str | None = None) -> list[dict]:
    if model_id is not None:
        validate_model_id(model_id)
    records = []
    for path in MEMORY_DIR.glob(f"*{CONFIGURATOR_SUFFIX}"):
        save_id = path.name.removesuffix(CONFIGURATOR_SUFFIX)
        try:
            base_model_id, index = split_configurator_save_id(save_id)
        except ValueError:
            continue
        if model_id is not None and base_model_id != model_id:
            continue
        records.append(
            {
                "id": save_id,
                "title": save_id,
                "type": "configurator",
                "baseModelId": base_model_id,
                "index": index,
                "path": path,
            }
        )
    return sorted(records, key=lambda item: (item["baseModelId"], item["index"]))


def next_configurator_save_index(model_id: str) -> int:
    records = saved_configurator_records(model_id)
    if not records:
        return 1
    return max(record["index"] for record in records) + 1


def configurator_model_options() -> list[dict]:
    options = []
    for model_id in available_models():
        options.append({"id": model_id, "title": model_id, "type": "model", "baseModelId": model_id})
        options.extend(
            {key: value for key, value in record.items() if key != "path"}
            for record in saved_configurator_records(model_id)
        )
    return options


def resolve_project_selection(selection_id: str) -> tuple[str, str, str | None]:
    try:
        return validate_model_id(selection_id), selection_id, None
    except ValueError as base_error:
        try:
            model_id, _index = split_configurator_save_id(selection_id)
        except ValueError:
            raise base_error
        if not configurator_path(selection_id).exists():
            raise ValueError(f"Unsupported configurator save: {selection_id}") from base_error
        return model_id, selection_id, selection_id


def asset_name(model_id: str) -> str:
    return f"{model_id.replace(' ', '_')}.png"


def asset_version(model_id: str) -> int:
    path = STATIC_DIR / "assets" / asset_name(model_id)
    return int(path.stat().st_mtime) if path.exists() else 0


def available_models() -> list[str]:
    pdf_models = {path.stem for path in PDF_DIR.glob("VC S*.pdf")}
    cad_models = {path.stem for path in CAD_DIR.glob("VC S*.dwg")}
    return sorted(pdf_models & cad_models)


def validate_model_id(model_id: str) -> str:
    if model_id not in available_models():
        raise ValueError(f"Unsupported model: {model_id}")
    return model_id


def validate_point(point: object) -> dict:
    if not isinstance(point, dict):
        raise ValueError("Label point must be an object")
    if not isinstance(point.get("x"), (int, float)) or not isinstance(point.get("y"), (int, float)):
        raise ValueError("Label point must include numeric x and y")
    return {"x": point["x"], "y": point["y"]}


def validate_label(label: object) -> dict:
    if not isinstance(label, dict):
        raise ValueError("Label must be an object")

    label_id = label.get("id")
    label_type = label.get("type")
    component = label.get("component")
    view = label.get("view")
    points = label.get("points")

    if not isinstance(label_id, str) or not label_id:
        raise ValueError("Label must include a non-empty id")
    if label_type not in LABEL_TYPES:
        raise ValueError(f"Label {label_id} has unsupported type")
    if component not in COMPONENTS:
        raise ValueError(f"Label {label_id} has unsupported component")
    if not isinstance(view, str) or not view:
        raise ValueError(f"Label {label_id} must include a view")
    if not isinstance(points, list) or len(points) < 2:
        raise ValueError(f"Label {label_id} must include at least two points")

    return {
        "id": label_id,
        "type": label_type,
        "component": component,
        "view": view,
        "points": [validate_point(point) for point in points],
        "groupId": label.get("groupId") if isinstance(label.get("groupId"), str) else None,
        "notes": label.get("notes") if isinstance(label.get("notes"), str) else "",
    }


def validate_group(group: object) -> dict:
    if not isinstance(group, dict):
        raise ValueError("Group must be an object")

    group_id = group.get("id")
    component = group.get("component")
    label_ids = group.get("labelIds", [])

    if not isinstance(group_id, str) or not group_id:
        raise ValueError("Group must include a non-empty id")
    if component not in COMPONENTS:
        raise ValueError(f"Group {group_id} has unsupported component")
    if not isinstance(label_ids, list) or any(not isinstance(label_id, str) for label_id in label_ids):
        raise ValueError(f"Group {group_id} labelIds must be strings")

    return {
        "id": group_id,
        "component": component,
        "name": group.get("name") if isinstance(group.get("name"), str) else component,
        "labelIds": label_ids,
        "notes": group.get("notes") if isinstance(group.get("notes"), str) else "",
    }


def validate_memory(model_id: str, payload: object) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Memory payload must be an object")
    if payload.get("modelId") != model_id:
        raise ValueError("Memory modelId does not match request")

    labels = payload.get("labels")
    groups = payload.get("groups")
    if not isinstance(labels, list):
        raise ValueError("Memory labels must be a list")
    if not isinstance(groups, list):
        raise ValueError("Memory groups must be a list")

    validated_labels = [validate_label(label) for label in labels]
    validated_groups = [validate_group(group) for group in groups]
    label_ids = {label["id"] for label in validated_labels}
    group_ids = {group["id"] for group in validated_groups}

    for label in validated_labels:
        if label["groupId"] is not None and label["groupId"] not in group_ids:
            raise ValueError(f"Label {label['id']} references a missing group")
    for group in validated_groups:
        missing = [label_id for label_id in group["labelIds"] if label_id not in label_ids]
        if missing:
            raise ValueError(f"Group {group['id']} references missing labels")

    return {
        "modelId": model_id,
        "labels": validated_labels,
        "groups": validated_groups,
        "updatedAt": payload.get("updatedAt") if isinstance(payload.get("updatedAt"), str) else "",
    }


def load_memory(model_id: str) -> dict:
    path = memory_path(model_id)
    if not path.exists():
        return {"modelId": model_id, "labels": [], "groups": [], "updatedAt": ""}
    with path.open("r", encoding="utf-8") as file:
        payload = json.load(file)
    return validate_memory(model_id, payload)


def save_memory(model_id: str, payload: dict) -> dict:
    validated = validate_memory(model_id, payload)
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    path = memory_path(model_id)

    with tempfile.NamedTemporaryFile("w", delete=False, dir=MEMORY_DIR, encoding="utf-8") as tmp:
        json.dump(validated, tmp, indent=2, sort_keys=True)
        tmp.write("\n")
        tmp_name = tmp.name

    os.replace(tmp_name, path)
    return validated


def validate_string_map(name: str, value: object) -> dict:
    if not isinstance(value, dict):
        raise ValueError(f"Configurator {name} must be an object")
    validated = {}
    for key, item in value.items():
        if not isinstance(key, str) or not isinstance(item, str):
            raise ValueError(f"Configurator {name} must contain string keys and values")
        validated[key] = item
    return validated


def validate_numeric_map(name: str, value: object) -> dict:
    if not isinstance(value, dict):
        raise ValueError(f"Configurator {name} must be an object")
    validated = {}
    for key, item in value.items():
        if not isinstance(key, str) or not isinstance(item, (int, float)):
            raise ValueError(f"Configurator {name} must contain string keys and numeric values")
        validated[key] = item
    return validated


def validate_configurator(model_id: str, payload: object, saved_as: str | None = None) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("Configurator payload must be an object")
    if payload.get("modelId") != model_id:
        raise ValueError("Configurator modelId does not match request")
    if saved_as is not None:
        saved_model_id, _index = split_configurator_save_id(saved_as)
        if saved_model_id != model_id:
            raise ValueError("Configurator savedAs does not match request")

    material_id = payload.get("materialId")
    lens_id = payload.get("lensId")
    polarized = payload.get("polarized")
    if not isinstance(material_id, str) or not material_id:
        raise ValueError("Configurator materialId must be a non-empty string")
    if not isinstance(lens_id, str) or not lens_id:
        raise ValueError("Configurator lensId must be a non-empty string")
    if not isinstance(polarized, bool):
        raise ValueError("Configurator polarized must be a boolean")

    return {
        "modelId": model_id,
        "savedAs": saved_as if saved_as is not None else configurator_save_name(model_id),
        "selectedPartIdsByType": validate_string_map(
            "selectedPartIdsByType",
            payload.get("selectedPartIdsByType"),
        ),
        "materialId": material_id,
        "lensId": lens_id,
        "polarized": polarized,
        "specs": validate_numeric_map("specs", payload.get("specs")),
        "frameParameters": validate_numeric_map("frameParameters", payload.get("frameParameters")),
        "materialAnswers": validate_string_map("materialAnswers", payload.get("materialAnswers") or {}),
        "updatedAt": payload.get("updatedAt") if isinstance(payload.get("updatedAt"), str) else "",
    }


def load_configurator(save_id: str) -> dict:
    model_id, _index = split_configurator_save_id(save_id)
    path = configurator_path(save_id)
    if not path.exists():
        return {
            "modelId": model_id,
            "savedAs": save_id,
            "exists": False,
        }
    with path.open("r", encoding="utf-8") as file:
        payload = json.load(file)
    return {**validate_configurator(model_id, payload, save_id), "exists": True}


def load_latest_configurator(model_id: str) -> dict:
    validate_model_id(model_id)
    records = saved_configurator_records(model_id)
    if not records:
        return {
            "modelId": model_id,
            "savedAs": configurator_save_name(model_id),
            "exists": False,
        }
    return load_configurator(records[-1]["id"])


def save_configurator(model_id: str, payload: dict) -> dict:
    save_id = configurator_save_name(model_id)
    validated = validate_configurator(model_id, payload, save_id)
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    path = configurator_path(save_id)

    with tempfile.NamedTemporaryFile("w", delete=False, dir=MEMORY_DIR, encoding="utf-8") as tmp:
        json.dump(validated, tmp, indent=2, sort_keys=True)
        tmp.write("\n")
        tmp_name = tmp.name

    os.replace(tmp_name, path)
    return {**validated, "exists": True}


def project_payload(model_id: str = DEFAULT_MODEL_ID) -> dict:
    model_id, selected_model_id, selected_configurator_id = resolve_project_selection(model_id)
    encoded_model_id = quote(model_id)
    encoded_selected_configurator_id = quote(selected_configurator_id) if selected_configurator_id else None
    project = {
        "modelId": model_id,
        "selectedModelId": selected_model_id,
        "selectedConfiguratorId": selected_configurator_id,
        "title": f"Netram - {selected_model_id}",
        "models": configurator_model_options(),
        "supports3dModel": model_id in SUPPORTED_3D_MODEL_IDS,
        "labellerUrl": f"/labeller?model={encoded_model_id}",
        "matcherUrl": f"/matcher?model={encoded_model_id}",
        "lenskartMatcherUrl": f"/lenskart-matcher?model={encoded_model_id}",
        "returnPredictionUrl": f"/return-prediction?model={encoded_model_id}",
        "partsUrl": "/parts?type=nose_bridge",
        "configuratorUrl": f"/configurator?model={quote(selected_model_id)}",
        "configuratorSaveUrl": f"/api/configurator/{encoded_model_id}/save",
        "configuratorLoadUrl": (
            f"/api/configurator/{encoded_selected_configurator_id}/load"
            if encoded_selected_configurator_id
            else None
        ),
        "nextConfiguratorSaveName": configurator_save_name(model_id),
        "source": {
            "pdf": f"/source/pdf/{encoded_model_id}.pdf",
            "cad": f"/source/cad/{encoded_model_id}.dwg",
            "image": f"/static/assets/{asset_name(model_id)}?orientation=landscape&v={asset_version(model_id)}",
        },
        "components": sorted(COMPONENTS),
        "memoryUrl": f"/api/memory/{encoded_model_id}",
        "physicsMemoryUrl": "/api/physics",
    }
    project["menuPages"] = landing_pages(project)
    return project


def landing_pages(project: dict) -> list[dict]:
    pages = []
    for page in LANDING_PAGES:
        pages.append(
            {
                "id": page["id"],
                "badge": page["badge"],
                "title": page["title"],
                "description": page["description"],
                "href": project[page["urlKey"]],
                "primary": page.get("primary", False),
            }
        )
    return pages


def child_parts_payload(part_type: str | None = None) -> dict:
    return child_parts.library_payload(part_type)


def matcher_payload(model_id: str = DEFAULT_MODEL_ID) -> dict:
    project = project_payload(model_id)
    dimensions = MATCHER_DIMENSIONS_BY_MODEL.get(model_id, {"a_size": None, "b_size": None, "dbl": None})
    return {
        "modelId": project["modelId"],
        "title": f"{project['modelId']} frame matcher",
        "models": project["models"],
        "supports3dModel": project["supports3dModel"],
        "labellerUrl": project["labellerUrl"],
        "source": project["source"],
        "dimensions": dimensions,
        "engine": {
            "baseUrl": DEFAULT_MATCHER_API_BASE,
            "buildIndexUrl": f"{DEFAULT_MATCHER_API_BASE}/build-index",
            "matchUrl": f"{DEFAULT_MATCHER_API_BASE}/match",
            "defaultIndexPath": DEFAULT_MATCHER_INDEX_PATH,
            "acceptedInputs": [
                "index_path",
                "lens_mask",
                "a_size",
                "b_size",
                "dbl",
                "top_k",
                "generate_overlay",
            ],
        },
        "beautyRender": {
            "source": "3d-front-view",
            "fileName": f"{project['modelId'].replace(' ', '_')}_beauty_render.jpg",
            "displayOnly": True,
            **FRONT_VIEW_EXPORT,
        },
    }


def lenskart_matcher_payload(model_id: str = DEFAULT_MODEL_ID) -> dict:
    project = project_payload(model_id)
    dimensions = MATCHER_DIMENSIONS_BY_MODEL.get(model_id, {"a_size": None, "b_size": None, "dbl": None})
    return {
        "modelId": project["modelId"],
        "title": f"{project['modelId']} Lenskart matcher",
        "models": project["models"],
        "supports3dModel": project["supports3dModel"],
        "labellerUrl": project["labellerUrl"],
        "localMatcherUrl": f"/matcher?model={quote(project['modelId'])}",
        "configuratorUrl": f"/configurator?model={quote(project['modelId'])}",
        "source": project["source"],
        "dimensions": {
            **dimensions,
            "shape": lenskart_matcher.TARGET_SHAPE,
            "frame_type": lenskart_matcher.TARGET_FRAME_TYPE,
            "material": lenskart_matcher.TARGET_MATERIAL,
        },
        "cache": lenskart_matcher.cache_status(),
        "matchUrl": "/api/lenskart-matcher/match",
        "beautyRender": {
            "source": "3d-front-view",
            "fileName": f"{project['modelId'].replace(' ', '_')}_lenskart_front.jpg",
            "displayOnly": False,
            **FRONT_VIEW_EXPORT,
        },
    }


class LabellerHandler(BaseHTTPRequestHandler):
    server_version = "EyewearLabeller/0.1"

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path in {"/", "/menu", "/menu.html"}:
            self.send_file(STATIC_DIR / "menu.html")
            return
        if parsed.path in {"/labeller", "/labeller.html", "/index.html"}:
            self.send_file(STATIC_DIR / "index.html")
            return
        if parsed.path in {"/matcher", "/matcher.html"}:
            self.send_file(STATIC_DIR / "matcher.html")
            return
        if parsed.path in {"/lenskart-matcher", "/lenskart-matcher.html"}:
            self.send_file(STATIC_DIR / "lenskart-matcher.html")
            return
        if parsed.path in {"/return-prediction", "/return-prediction.html"}:
            self.send_file(STATIC_DIR / "return-prediction.html")
            return
        if parsed.path in {"/configurator", "/configurator.html"}:
            self.send_file(STATIC_DIR / "configurator.html")
            return
        if parsed.path in {"/parts", "/parts.html"}:
            self.send_file(STATIC_DIR / "parts.html")
            return
        if parsed.path.startswith("/static/"):
            self.send_safe_file(STATIC_DIR, parsed.path.removeprefix("/static/"))
            return
        if parsed.path.startswith("/lenskart-cache/"):
            self.send_safe_file(lenskart_matcher.CACHE_ROOT, parsed.path.removeprefix("/lenskart-cache/"))
            return
        if parsed.path == "/api/project":
            query = parse_qs(parsed.query)
            model_id = query.get("model", [DEFAULT_MODEL_ID])[0]
            try:
                self.send_json(project_payload(model_id))
            except ValueError as error:
                self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        if parsed.path == "/api/matcher/project":
            query = parse_qs(parsed.query)
            model_id = query.get("model", [DEFAULT_MODEL_ID])[0]
            try:
                self.send_json(matcher_payload(model_id))
            except ValueError as error:
                self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        if parsed.path == "/api/lenskart-matcher/project":
            query = parse_qs(parsed.query)
            model_id = query.get("model", [DEFAULT_MODEL_ID])[0]
            try:
                self.send_json(lenskart_matcher_payload(model_id))
            except ValueError as error:
                self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        if parsed.path == "/api/child-parts":
            query = parse_qs(parsed.query)
            part_type = query.get("type", [None])[0]
            try:
                self.send_json(child_parts_payload(part_type))
            except ValueError as error:
                self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        if parsed.path.startswith("/api/memory/"):
            self.handle_get_memory(parsed.path)
            return
        if parsed.path.startswith("/api/configurator/") and parsed.path.endswith("/load"):
            self.handle_load_configurator(parsed.path)
            return
        if parsed.path.startswith("/api/configurator/") and parsed.path.endswith("/save"):
            self.handle_get_configurator(parsed.path)
            return
        if parsed.path == "/api/physics":
            self.send_text(PHYSICS_MEMORY_PATH)
            return
        if parsed.path.startswith("/source/pdf/") and parsed.path.endswith(".pdf"):
            self.handle_source_file(parsed.path, "pdf")
            return
        if parsed.path.startswith("/source/cad/") and parsed.path.endswith(".dwg"):
            self.handle_source_file(parsed.path, "dwg")
            return
        if parsed.path == "/source/child-part":
            self.handle_child_part_source(parsed.query)
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/memory/"):
            self.handle_post_memory(parsed.path)
            return
        if parsed.path.startswith("/api/configurator/") and parsed.path.endswith("/save"):
            self.handle_post_configurator(parsed.path)
            return
        if parsed.path == "/api/lenskart-matcher/match":
            self.handle_lenskart_matcher_match()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def handle_get_memory(self, path: str) -> None:
        try:
            model_id = unquote(path.removeprefix("/api/memory/"))
            self.send_json(load_memory(model_id))
        except ValueError as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)

    def handle_post_memory(self, path: str) -> None:
        try:
            model_id = unquote(path.removeprefix("/api/memory/"))
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            self.send_json(save_memory(model_id, payload))
        except (json.JSONDecodeError, ValueError) as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)

    def configurator_id_from_path(self, path: str, suffix: str) -> str:
        return unquote(path.removeprefix("/api/configurator/").removesuffix(suffix))

    def handle_get_configurator(self, path: str) -> None:
        try:
            self.send_json(load_latest_configurator(self.configurator_id_from_path(path, "/save")))
        except ValueError as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)

    def handle_load_configurator(self, path: str) -> None:
        try:
            self.send_json(load_configurator(self.configurator_id_from_path(path, "/load")))
        except ValueError as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)

    def handle_post_configurator(self, path: str) -> None:
        try:
            model_id = self.configurator_id_from_path(path, "/save")
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            self.send_json(save_configurator(model_id, payload))
        except (json.JSONDecodeError, ValueError) as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)

    def handle_lenskart_matcher_match(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            self.send_json(lenskart_matcher.match_front_view_data_url(payload))
        except json.JSONDecodeError as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
        except (KeyError, ValueError) as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
        except RuntimeError as error:
            self.send_json({"error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)

    def handle_source_file(self, path: str, file_type: str) -> None:
        base = "/source/pdf/" if file_type == "pdf" else "/source/cad/"
        suffix = ".pdf" if file_type == "pdf" else ".dwg"
        model_id = unquote(path.removeprefix(base).removesuffix(suffix))
        try:
            validate_model_id(model_id)
        except ValueError as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
            return
        source_dir = PDF_DIR if file_type == "pdf" else CAD_DIR
        self.send_file(source_dir / f"{model_id}{suffix}")

    def handle_child_part_source(self, query_string: str) -> None:
        query = parse_qs(query_string)
        part_id = query.get("partId", [""])[0]
        asset = query.get("asset", [""])[0]
        try:
            if asset == "preview":
                self.send_bytes(child_parts.render_child_part_preview_svg(part_id), "image/svg+xml; charset=utf-8")
                return
            if asset == "svg":
                self.send_bytes(child_parts.render_child_part_svg(part_id), "image/svg+xml; charset=utf-8")
                return
            path, content_type = child_parts.resolve_child_part_asset(part_id, asset)
            self.send_file(path, content_type)
        except ValueError as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
        except RuntimeError as error:
            self.send_json({"error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_text(self, path: Path) -> None:
        if not path.exists():
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return
        body = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/markdown; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_safe_file(self, base_dir: Path, relative_path: str) -> None:
        candidate = (base_dir / unquote(relative_path)).resolve()
        if not candidate.is_relative_to(base_dir.resolve()):
            self.send_error(HTTPStatus.FORBIDDEN, "Forbidden")
            return
        self.send_file(candidate)

    def send_file(self, path: Path, content_type: str | None = None) -> None:
        if not path.exists() or not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return
        body = path.read_bytes()
        content_type = content_type or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        self.send_bytes(body, content_type)

    def send_bytes(self, body: bytes, content_type: str) -> None:
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}")


def run(host: str, port: int) -> None:
    httpd = ThreadingHTTPServer((host, port), LabellerHandler)
    print(f"Serving Netram at http://{host}:{port}")
    httpd.serve_forever()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Netram.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8765, type=int)
    args = parser.parse_args()
    run(args.host, args.port)


if __name__ == "__main__":
    main()
