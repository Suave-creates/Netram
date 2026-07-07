from __future__ import annotations

import re
import shutil
import subprocess
from html import escape
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote


ROOT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = ROOT_DIR.parent
CHILD_PARTS_DIR = PROJECT_DIR / "Child Parts"


TYPE_DEFINITIONS = [
    {
        "type": "nose_bridge",
        "label": "Nose bridges",
        "slot": "nose_bridge",
        "buildStatus": "active",
    },
    {
        "type": "temple",
        "label": "Temples",
        "slot": "temple",
        "buildStatus": "next",
    },
    {
        "type": "temple_tip",
        "label": "Acetate tips",
        "slot": "temple_tip",
        "buildStatus": "queued",
    },
    {
        "type": "nosearm",
        "label": "Nosearms",
        "slot": "nosearm",
        "buildStatus": "manual_seed",
    },
    {
        "type": "nose_pad",
        "label": "Nose pads",
        "slot": "nose_pad",
        "buildStatus": "manual_seed",
    },
]

TYPE_BY_ID = {item["type"]: item for item in TYPE_DEFINITIONS}
MODULE_ORDER = [item["type"] for item in TYPE_DEFINITIONS]

SCAN_SOURCES = {
    "nose_bridge": [
        ("Main collection", CHILD_PARTS_DIR / "Nose Bridge", "main"),
        ("Length 16mm-23mm", CHILD_PARTS_DIR / "Nose Bridge" / "Length " / "16mm-23mm", "length-16mm-23mm"),
        ("SS-26", CHILD_PARTS_DIR / "Nose Bridge" / "SS-26", "ss-26"),
    ],
    "temple": [
        ("Main collection", CHILD_PARTS_DIR / "Temple", "main"),
        ("SS-26", CHILD_PARTS_DIR / "Temple" / "SS-26", "ss-26"),
    ],
    "temple_tip": [
        ("SS26 bend tips", CHILD_PARTS_DIR / "Tip" / "SS26-Bend Tips", "ss26-bend-tips"),
    ],
}

NOSE_PAD_VARIANTS = [
    ("Infinity logo - translucent", {"logo": "infinity", "colour": "translucent"}),
    ("Infinity logo - black", {"logo": "infinity", "colour": "black"}),
    ("Infinity logo - grey", {"logo": "infinity", "colour": "grey"}),
    ("Plain - translucent", {"logo": "none", "colour": "translucent"}),
    ("Plain - black", {"logo": "none", "colour": "black"}),
    ("Plain - grey", {"logo": "none", "colour": "grey"}),
]

NOSE_PAD_COLOR_FIT = {
    "translucent": {
        "colorHex": "#d9efef",
        "opacity": 0.58,
    },
    "black": {
        "colorHex": "#202124",
        "opacity": 0.96,
    },
    "grey": {
        "colorHex": "#8b9094",
        "opacity": 0.9,
    },
}

NOSEARM_VARIANTS = [
    ("Long nosearm", {"lengthClass": "long"}),
    ("Short nosearm", {"lengthClass": "short"}),
]

NOSE_BRIDGE_FIT_OVERRIDES = {
    "VC S13110 NB": {
        "bridgeDetailWidthMm": 17.94,
        "profileDepthMm": 2.13,
        "source": "VC S19003 drawing cue",
        "confidence": "drawing_cue",
    },
    "VC S5158 NB": {
        "bridgeDetailWidthMm": 15.27,
        "profileDepthMm": 2.0,
        "source": "VC S19000 drawing cue",
        "confidence": "drawing_cue",
    },
}

TEMPLE_FIT_OVERRIDES = {
    "VC E11891 Temple": {
        "templeLengthMm": 132.7,
        "frontHeightMm": 5.8,
        "midHeightMm": 3.1,
        "rearHeightMm": 1.3,
        "source": "VC E11891 Temple PDF/DWG",
        "confidence": "drawing_cue",
    },
    "VC E12395 Temple": {
        "templeLengthMm": 130.0,
        "frontHeightMm": 4.6,
        "midHeightMm": 3.1,
        "rearHeightMm": 1.3,
        "source": "VC E12395 Temple PDF/DWG",
        "confidence": "drawing_cue",
    },
    "T1": {
        "templeLengthMm": 147.6,
        "source": "T1 PDF text",
        "confidence": "drawing_cue",
    },
    "T2": {
        "templeLengthMm": 145.0,
        "source": "T2 PDF text",
        "confidence": "drawing_cue",
    },
    "T3": {
        "templeLengthMm": 135.0,
        "source": "T3 PDF text",
        "confidence": "drawing_cue",
    },
    "T4": {
        "templeLengthMm": 145.0,
        "source": "T4 PDF text",
        "confidence": "drawing_cue",
    },
    "T5": {
        "templeLengthMm": 136.1,
        "source": "T5 PDF text",
        "confidence": "drawing_cue",
    },
}

TEMPLE_TIP_FIT_OVERRIDES = {
    "TT1-Bend": {
        "tipLengthMm": 75.0,
        "bendRadiusMm": 30.0,
        "tipAngleDeg": 35.0,
        "source": "TT1-Bend DWG/PDF cue",
        "confidence": "drawing_cue",
    },
    "TT2-Bend": {
        "tipLengthMm": 70.0,
        "bendRadiusMm": 25.839,
        "tipAngleDeg": 83.0,
        "source": "TT2-Bend DWG cue",
        "confidence": "drawing_cue",
    },
    "TT3-Bend": {
        "tipLengthMm": 70.0,
        "bendRadiusMm": 30.0,
        "tipAngleDeg": 42.0,
        "source": "TT3-Bend DWG/PDF cue",
        "confidence": "drawing_cue",
    },
    "TT4-Bend": {
        "tipLengthMm": 75.0,
        "bendRadiusMm": 30.0,
        "tipAngleDeg": 83.0,
        "source": "TT4-Bend DWG/PDF cue",
        "confidence": "drawing_cue",
    },
}


def library_payload(part_type: str | None = None) -> dict:
    selected_type = part_type or MODULE_ORDER[0]
    validate_part_type(selected_type)
    parts = list_child_parts(selected_type)
    return {
        "moduleOrder": MODULE_ORDER,
        "selectedType": selected_type,
        "types": [type_payload(item) for item in TYPE_DEFINITIONS],
        "summary": summarize_parts(parts),
        "parts": parts,
    }


def type_payload(definition: dict) -> dict:
    parts = list_child_parts(definition["type"])
    return {
        **definition,
        "count": len(parts),
        "summary": summarize_parts(parts),
    }


def list_child_parts(part_type: str) -> list[dict]:
    validate_part_type(part_type)
    if part_type in SCAN_SOURCES:
        return sorted(scan_file_parts(part_type), key=lambda part: (part["sourceGroup"], part["name"]))
    if part_type == "nose_pad":
        return [
            manual_part(part_type, name, attributes)
            for name, attributes in NOSE_PAD_VARIANTS
        ]
    if part_type == "nosearm":
        return [
            manual_part(part_type, name, attributes)
            for name, attributes in NOSEARM_VARIANTS
        ]
    return []


def scan_file_parts(part_type: str) -> list[dict]:
    parts = []
    for source_group, source_dir, source_slug in SCAN_SOURCES[part_type]:
        if not source_dir.exists():
            continue
        by_name: dict[str, dict[str, Path]] = {}
        for path in source_dir.iterdir():
            if not path.is_file():
                continue
            suffix = path.suffix.lower()
            if suffix not in {".dwg", ".pdf"}:
                continue
            by_name.setdefault(path.stem, {})[suffix.removeprefix(".")] = path
        for name, assets in by_name.items():
            parts.append(file_part(part_type, name, source_group, source_slug, assets))
    return parts


def file_part(part_type: str, name: str, source_group: str, source_slug: str, assets: dict[str, Path]) -> dict:
    part_id = part_id_for(part_type, source_slug, name)
    has_dwg = "dwg" in assets
    has_pdf = "pdf" in assets
    readiness = readiness_for(has_dwg=has_dwg, has_pdf=has_pdf)
    return {
        **base_part(part_type, part_id, name),
        "sourceGroup": source_group,
        "readiness": readiness,
        "assets": {
            "dwgUrl": child_part_source_url(part_id, "dwg") if has_dwg else None,
            "pdfUrl": child_part_source_url(part_id, "pdf") if has_pdf else None,
            "svgUrl": child_part_source_url(part_id, "svg") if has_dwg else None,
            "previewUrl": child_part_source_url(part_id, "preview") if part_type == "nose_bridge" and (has_dwg or has_pdf) else None,
        },
        "configurator": configurator_payload(part_type, name, readiness, assets),
        "geometry": {
            "cad2d": has_dwg,
            "drawingPdf": has_pdf,
            "geometry3d": False,
        },
        "missing": missing_fields(readiness),
    }


def manual_part(part_type: str, name: str, attributes: dict) -> dict:
    source_slug = "manual"
    part_id = part_id_for(part_type, source_slug, name)
    return {
        **base_part(part_type, part_id, name),
        "sourceGroup": "Manual seed",
        "readiness": "manual_only",
        "attributes": attributes,
        "assets": {
            "dwgUrl": None,
            "pdfUrl": None,
            "svgUrl": None,
        },
        "configurator": configurator_payload(part_type, name, "manual_only"),
        "geometry": {
            "cad2d": False,
            "drawingPdf": False,
            "geometry3d": False,
        },
        "missing": missing_fields("manual_only"),
    }


def base_part(part_type: str, part_id: str, name: str) -> dict:
    definition = TYPE_BY_ID[part_type]
    return {
        "id": part_id,
        "type": part_type,
        "typeLabel": definition["label"],
        "slot": definition["slot"],
        "name": name,
        "version": "v1",
        "material": {
            "properties": None,
            "metallurgy": {
                "alloyGrade": None,
                "temper": None,
                "platingCoating": None,
                "density": None,
                "heatTreatment": None,
                "finishAffectingStrength": None,
            },
        },
        "dimensions": {},
        "colourFinish": {},
        "attachmentPoints": [],
        "compatibilityRules": [],
        "manufacturingConstraints": [],
    }


def configurator_payload(part_type: str, name: str, readiness: str, assets: dict[str, Path] | None = None) -> dict:
    can_preview = (
        part_type == "nose_bridge" and readiness in {"usable_2d", "cad_only", "pdf_only"}
    ) or (
        part_type in {"temple", "temple_tip"} and readiness in {"usable_2d", "cad_only"}
    ) or part_type in {"nosearm", "nose_pad"}
    return {
        "compatibleSlots": [TYPE_BY_ID[part_type]["slot"]],
        "canPreviewOnFrame": can_preview,
        "fit": fit_payload(part_type, name, assets),
    }


def fit_payload(part_type: str, name: str, assets: dict[str, Path] | None = None) -> dict:
    if part_type == "nose_bridge":
        pdf_fit = nose_bridge_fit_from_pdf(assets.get("pdf") if assets else None)
        override = NOSE_BRIDGE_FIT_OVERRIDES.get(name)
        if override or pdf_fit:
            fit = {**(override or {}), **pdf_fit}
            if "bridgeDetailWidthMm" in fit:
                fit["centerline2dMm"] = bridge_centerline_from_fit(
                    fit["bridgeDetailWidthMm"],
                    fit.get("profileDepthMm"),
                )
            return fit

        filename_width = bridge_width_from_filename(name)
        return {
            "bridgeDetailWidthMm": filename_width,
            "profileDepthMm": None,
            "source": "filename" if filename_width is not None else "frame default",
            "confidence": "estimated" if filename_width is not None else "fallback",
            **({"centerline2dMm": bridge_centerline_from_fit(filename_width, None)} if filename_width is not None else {}),
        }

    if part_type == "temple":
        override = TEMPLE_FIT_OVERRIDES.get(name)
        if override:
            return override
        return temple_fit_from_pdf(assets.get("pdf") if assets else None)

    if part_type == "temple_tip":
        return TEMPLE_TIP_FIT_OVERRIDES.get(name, {})

    if part_type == "nose_pad":
        return nose_pad_fit_from_name(name)

    if part_type == "nosearm":
        return nosearm_fit_from_name(name)

    return {}


def nosearm_fit_from_name(name: str) -> dict:
    normalized = name.lower()
    is_short = "short" in normalized
    length_class = "short" if is_short else "long"
    return {
        "lengthClass": length_class,
        "armReachMm": 4.4 if is_short else 7.8,
        "armDropMm": 4.8 if is_short else 6.6,
        "tubeRadiusMm": 0.38 if is_short else 0.42,
        "source": "manual variant",
        "confidence": "manual_variant",
    }


def nose_pad_fit_from_name(name: str) -> dict:
    normalized = name.lower()
    colour = "black" if "black" in normalized else "grey" if "grey" in normalized or "gray" in normalized else "translucent"
    logo = "none" if normalized.startswith("plain") or "without" in normalized else "infinity"
    return {
        "colour": colour,
        "logo": logo,
        "source": "manual variant",
        "confidence": "manual_variant",
        **NOSE_PAD_COLOR_FIT[colour],
    }


def temple_fit_from_pdf(path: Path | None) -> dict:
    length = temple_length_from_pdf(path)
    if length is None:
        return {}
    return {
        "templeLengthMm": length,
        "source": "PDF text",
        "confidence": "drawing_cue",
    }


def nose_bridge_fit_from_pdf(path: Path | None) -> dict:
    if path is None:
        return {}
    values = pdf_numeric_values(path)
    width = first_bridge_width(values)
    if width is None:
        return {}
    profile_depth = first_profile_depth(values, width)
    fit = {
        "bridgeDetailWidthMm": round(width, 2),
        "source": "PDF text",
        "confidence": "drawing_cue",
    }
    if profile_depth is not None:
        fit["profileDepthMm"] = round(profile_depth, 2)
    fit["centerline2dMm"] = bridge_centerline_from_fit(
        fit["bridgeDetailWidthMm"],
        fit.get("profileDepthMm"),
    )
    return fit


def first_bridge_width(values: tuple[float, ...]) -> float | None:
    return next((value for value in values if 14 <= value <= 26), None)


def first_profile_depth(values: tuple[float, ...], width: float) -> float | None:
    for value in values[:8]:
        if abs(value - width) < 0.001:
            continue
        if 1.2 <= value <= 4.5:
            return value
    return None


def bridge_centerline_from_fit(width: float, profile_depth: float | None) -> list[list[float]]:
    depth = profile_depth if profile_depth is not None else min(max(width * 0.12, 1.6), 2.4)
    half_width = width / 2
    return [
        [round(-half_width, 3), 0],
        [round(-width * 0.36, 3), round(depth * 0.5, 3)],
        [round(-width * 0.18, 3), round(depth * 0.84, 3)],
        [0, round(depth, 3)],
        [round(width * 0.18, 3), round(depth * 0.84, 3)],
        [round(width * 0.36, 3), round(depth * 0.5, 3)],
        [round(half_width, 3), 0],
    ]


def temple_length_from_pdf(path: Path | None) -> float | None:
    if path is None:
        return None
    for value in pdf_numeric_values(path):
        if 120 <= value <= 170:
            return value
    return None


@lru_cache(maxsize=256)
def pdf_numeric_values(path: Path) -> tuple[float, ...]:
    converter = shutil.which("pdftotext")
    if converter is None:
        return ()
    result = subprocess.run(
        [converter, str(path), "-"],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=10,
    )
    if result.returncode != 0:
        return ()
    text = result.stdout.decode("utf-8", errors="replace")
    return tuple(float(match.group(0).replace(",", ".")) for match in re.finditer(r"\d+(?:[.,]\d+)?", text))


def bridge_width_from_filename(name: str) -> float | None:
    match = re.search(r"\b(?:BWF|LB|VC)\s*[ES]?(\d+)\b", name.upper())
    if not match:
        return None
    candidate = int(match.group(1)[-2:])
    if 14 <= candidate <= 24:
        return candidate
    return None


def summarize_parts(parts: list[dict]) -> dict:
    return {
        "total": len(parts),
        "usable2d": sum(1 for part in parts if part["readiness"] == "usable_2d"),
        "dwgOnly": sum(1 for part in parts if part["readiness"] == "cad_only"),
        "pdfOnly": sum(1 for part in parts if part["readiness"] == "pdf_only"),
        "manualOnly": sum(1 for part in parts if part["readiness"] == "manual_only"),
    }


def resolve_child_part_asset(part_id: str, asset: str) -> tuple[Path, str]:
    if asset not in {"dwg", "pdf"}:
        raise ValueError(f"Unsupported child part asset: {asset}")
    part = child_part_by_id(part_id)
    url_key = f"{asset}Url"
    if not part["assets"].get(url_key):
        raise ValueError(f"Child part {part_id} has no {asset} asset")
    path = asset_path_for(part_id, asset)
    content_type = "application/pdf" if asset == "pdf" else "application/acad"
    return path, content_type


def render_child_part_svg(part_id: str) -> bytes:
    path = asset_path_for(part_id, "dwg")
    converter = shutil.which("dwg2svg")
    if converter is None:
        raise RuntimeError("dwg2svg is not available")
    result = subprocess.run(
        [converter, str(path)],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=30,
    )
    if result.returncode != 0 or not result.stdout:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(message or "DWG to SVG conversion failed")
    return result.stdout


def render_child_part_preview_svg(part_id: str) -> bytes:
    part = child_part_by_id(part_id)
    if part["type"] != "nose_bridge":
        return render_child_part_svg(part_id)
    if part["assets"].get("dwgUrl"):
        try:
            return render_normalized_dwg_preview_svg(part_id)
        except RuntimeError:
            pass
    return generated_nose_bridge_preview_svg(part).encode("utf-8")


def render_normalized_dwg_preview_svg(part_id: str) -> bytes:
    path = asset_path_for(part_id, "dwg")
    converter = shutil.which("dwg2svg")
    if converter is None:
        raise RuntimeError("dwg2svg is not available")
    result = subprocess.run(
        [converter, str(path)],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=30,
    )
    if result.returncode != 0 or not result.stdout:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(message or "DWG to SVG conversion failed")
    raw_svg = result.stdout.decode("utf-8", errors="replace")
    return normalize_svg_paths(raw_svg).encode("utf-8")


def normalize_svg_paths(raw_svg: str) -> str:
    path_data = re.findall(r"<path\b[^>]*\bd=\"([^\"]+)\"[^>]*/?>", raw_svg)
    paths: list[tuple[str, list[tuple[float, float]]]] = []
    for data in path_data:
        points = path_coordinate_points(data)
        if points:
            paths.append((data, points))
    if not paths:
        raise RuntimeError("No drawable paths found")
    local_paths = [
        (data, points)
        for data, points in paths
        if all(-100 <= point[0] <= 100 and -100 <= point[1] <= 100 for point in points)
    ]
    if len(local_paths) >= 3:
        paths = local_paths
    all_points = [point for _, points in paths for point in points]
    min_x = min(point[0] for point in all_points)
    max_x = max(point[0] for point in all_points)
    min_y = min(point[1] for point in all_points)
    max_y = max(point[1] for point in all_points)
    pad = max((max_x - min_x), (max_y - min_y), 1) * 0.06
    view_box = f"{min_x - pad:.3f} {min_y - pad:.3f} {(max_x - min_x) + pad * 2:.3f} {(max_y - min_y) + pad * 2:.3f}"
    lines = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" '
        f'viewBox="{view_box}" preserveAspectRatio="xMidYMid meet">',
        '<rect width="100%" height="100%" fill="#f7f9f8"/>',
    ]
    for data, _points in paths:
        lines.append(
            f'<path d="{escape(data, quote=True)}" '
            'fill="none" stroke="#202124" stroke-width="0.16" '
            'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
        )
    lines.append("</svg>")
    return "".join(lines)


def path_coordinate_points(path_data: str) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for command, args in re.findall(r"([MLACQ])([^MLACQ]+)", path_data):
        pairs = [
            (float(match.group(1)), float(match.group(2)))
            for match in re.finditer(r"(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)", args)
        ]
        if command in {"M", "L"}:
            points.extend(pairs)
        elif pairs:
            points.append(pairs[-1])
    return points


def generated_nose_bridge_preview_svg(part: dict) -> str:
    fit = part.get("configurator", {}).get("fit", {})
    width = float(fit.get("bridgeDetailWidthMm") or 16)
    depth = float(fit.get("profileDepthMm") or min(max(width * 0.12, 1.6), 2.4))
    centerline = bridge_centerline_from_fit(width, depth)
    scale = 132 / max(width, 1)
    base_x = 90
    base_y = 58
    points = [
        (base_x + point[0] * scale, base_y - point[1] * scale)
        for point in centerline
    ]
    commands = " ".join(
        f"{'M' if index == 0 else 'L'} {x:.2f} {y:.2f}"
        for index, (x, y) in enumerate(points)
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" viewBox="0 0 180 96">'
        '<rect width="180" height="96" rx="10" fill="#f7f9f8"/>'
        f'<path d="{commands}" fill="none" stroke="#6b59b5" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'
        f'<path d="{commands}" fill="none" stroke="#eeeaff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>'
        f'<text x="90" y="84" text-anchor="middle" fill="#22302b" font-size="10" font-family="Arial" font-weight="700">{width:.2f} mm</text>'
        "</svg>"
    )


def asset_path_for(part_id: str, asset: str) -> Path:
    part = child_part_by_id(part_id)
    expected_suffix = f".{asset}"
    if asset == "svg":
        expected_suffix = ".dwg"
    for source_group, source_dir, source_slug in SCAN_SOURCES.get(part["type"], []):
        if not part_id.startswith(f"{part['type']}--{source_slug}--"):
            continue
        candidate = source_dir / f"{part['name']}{expected_suffix}"
        if candidate.exists():
            return candidate
    raise ValueError(f"Child part {part_id} has no {asset} asset")


def child_part_by_id(part_id: str) -> dict:
    for part_type in MODULE_ORDER:
        for part in list_child_parts(part_type):
            if part["id"] == part_id:
                return part
    raise ValueError(f"Unknown child part: {part_id}")


def validate_part_type(part_type: str) -> None:
    if part_type not in TYPE_BY_ID:
        raise ValueError(f"Unsupported child part type: {part_type}")


def child_part_source_url(part_id: str, asset: str) -> str:
    return f"/source/child-part?partId={quote(part_id)}&asset={quote(asset)}"


def part_id_for(part_type: str, source_slug: str, name: str) -> str:
    return f"{part_type}--{source_slug}--{slugify(name)}"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "part"


def readiness_for(*, has_dwg: bool, has_pdf: bool) -> str:
    if has_dwg and has_pdf:
        return "usable_2d"
    if has_dwg:
        return "cad_only"
    if has_pdf:
        return "pdf_only"
    return "manual_only"


def missing_fields(readiness: str) -> list[str]:
    missing = [
        "manual_metadata",
        "material_properties",
        "metallurgy",
        "dimensions",
        "colour_finish",
        "attachment_points",
        "compatibility_rules",
        "manufacturing_constraints",
        "3d_geometry",
    ]
    if readiness == "cad_only":
        return ["pdf_reference", *missing]
    if readiness == "pdf_only":
        return ["2d_cad_geometry", *missing]
    if readiness == "manual_only":
        return ["2d_cad_geometry", "pdf_reference", *missing]
    return missing
