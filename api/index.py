from __future__ import annotations

import mimetypes
import sys
from pathlib import Path
from urllib.parse import unquote

from fastapi import Body, FastAPI
from fastapi.responses import FileResponse, JSONResponse, Response


PROJECT_DIR = Path(__file__).resolve().parents[1]
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from eyewear_labeller import child_parts, lenskart_matcher  # noqa: E402
from eyewear_labeller.server import (  # noqa: E402
    CAD_DIR,
    DEFAULT_MODEL_ID,
    PDF_DIR,
    PHYSICS_MEMORY_PATH,
    STATIC_DIR,
    child_parts_payload,
    lenskart_matcher_payload,
    load_memory,
    matcher_payload,
    project_payload,
    validate_model_id,
)


app = FastAPI(title="Natalia")


def json_error(message: str, status_code: int) -> JSONResponse:
    return JSONResponse({"error": message}, status_code=status_code)


def serve_file(path: Path, content_type: str | None = None) -> Response:
    if not path.exists() or not path.is_file():
        return json_error("Not found", 404)
    media_type = content_type or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return FileResponse(path, media_type=media_type)


def serve_static(relative_path: str) -> Response:
    base_dir = STATIC_DIR.resolve()
    candidate = (base_dir / unquote(relative_path)).resolve()
    try:
        candidate.relative_to(base_dir)
    except ValueError:
        return json_error("Forbidden", 403)
    return serve_file(candidate)


@app.get("/index.html")
@app.get("/labeller")
@app.get("/labeller.html")
def labeller() -> Response:
    return serve_file(STATIC_DIR / "index.html")


@app.get("/")
@app.get("/menu")
@app.get("/menu.html")
def menu() -> Response:
    return serve_file(STATIC_DIR / "menu.html")


@app.get("/matcher")
@app.get("/matcher.html")
def matcher() -> Response:
    return serve_file(STATIC_DIR / "matcher.html")


@app.get("/lenskart-matcher")
@app.get("/lenskart-matcher.html")
def lenskart_matcher_page() -> Response:
    return serve_file(STATIC_DIR / "lenskart-matcher.html")


@app.get("/return-prediction")
@app.get("/return-prediction.html")
def return_prediction_page() -> Response:
    return serve_file(STATIC_DIR / "return-prediction.html")


@app.get("/configurator")
@app.get("/configurator.html")
def configurator() -> Response:
    return serve_file(STATIC_DIR / "configurator.html")


@app.get("/parts")
@app.get("/parts.html")
def parts() -> Response:
    return serve_file(STATIC_DIR / "parts.html")


@app.get("/static/{relative_path:path}")
def static_asset(relative_path: str) -> Response:
    return serve_static(relative_path)


@app.get("/lenskart-cache/{relative_path:path}")
def lenskart_cache_asset(relative_path: str) -> Response:
    base_dir = lenskart_matcher.CACHE_ROOT.resolve()
    candidate = (base_dir / unquote(relative_path)).resolve()
    try:
        candidate.relative_to(base_dir)
    except ValueError:
        return json_error("Forbidden", 403)
    return serve_file(candidate)


@app.get("/api/project")
def api_project(model: str = DEFAULT_MODEL_ID) -> Response:
    try:
        return JSONResponse(project_payload(model))
    except ValueError as error:
        return json_error(str(error), 400)


@app.get("/api/matcher/project")
def api_matcher_project(model: str = DEFAULT_MODEL_ID) -> Response:
    try:
        return JSONResponse(matcher_payload(model))
    except ValueError as error:
        return json_error(str(error), 400)


@app.get("/api/lenskart-matcher/project")
def api_lenskart_matcher_project(model: str = DEFAULT_MODEL_ID) -> Response:
    try:
        return JSONResponse(lenskart_matcher_payload(model))
    except ValueError as error:
        return json_error(str(error), 400)


@app.get("/api/child-parts")
def api_child_parts(type: str | None = None) -> Response:  # noqa: A002
    try:
        return JSONResponse(child_parts_payload(type))
    except ValueError as error:
        return json_error(str(error), 400)


@app.get("/api/memory/{model_id:path}")
def api_memory(model_id: str) -> Response:
    try:
        return JSONResponse(load_memory(unquote(model_id)))
    except ValueError as error:
        return json_error(str(error), 400)


@app.post("/api/memory/{model_id:path}")
def api_memory_write(model_id: str) -> Response:
    return json_error(
        "Memory writes require persistent storage and are disabled on this Vercel deployment.",
        405,
    )


@app.post("/api/lenskart-matcher/match")
def api_lenskart_matcher_match(payload: dict = Body(...)) -> Response:
    try:
        return JSONResponse(lenskart_matcher.match_front_view_data_url(payload))
    except (KeyError, ValueError) as error:
        return json_error(str(error), 400)
    except RuntimeError as error:
        return json_error(str(error), 503)


@app.get("/api/physics")
def api_physics() -> Response:
    return serve_file(PHYSICS_MEMORY_PATH, "text/markdown; charset=utf-8")


@app.get("/source/pdf/{filename:path}")
def source_pdf(filename: str) -> Response:
    if not filename.endswith(".pdf"):
        return json_error("Not found", 404)
    model_id = unquote(filename.removesuffix(".pdf"))
    try:
        validate_model_id(model_id)
    except ValueError as error:
        return json_error(str(error), 400)
    return serve_file(PDF_DIR / f"{model_id}.pdf", "application/pdf")


@app.get("/source/cad/{filename:path}")
def source_cad(filename: str) -> Response:
    if not filename.endswith(".dwg"):
        return json_error("Not found", 404)
    model_id = unquote(filename.removesuffix(".dwg"))
    try:
        validate_model_id(model_id)
    except ValueError as error:
        return json_error(str(error), 400)
    return serve_file(CAD_DIR / f"{model_id}.dwg", "application/acad")


@app.get("/source/child-part")
def source_child_part(partId: str = "", asset: str = "") -> Response:  # noqa: N803
    try:
        if asset == "svg":
            return Response(
                child_parts.render_child_part_svg(partId),
                media_type="image/svg+xml; charset=utf-8",
            )
        path, content_type = child_parts.resolve_child_part_asset(partId, asset)
        return serve_file(path, content_type)
    except ValueError as error:
        return json_error(str(error), 400)
    except RuntimeError as error:
        return json_error(str(error), 503)
