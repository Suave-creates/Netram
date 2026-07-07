from __future__ import annotations

from pathlib import Path
import cv2
import numpy as np

from .image_ops import mask_from_binary_image
from .descriptors import extract_all_descriptors


def _points_to_canvas(points: np.ndarray, size: int = 700, padding: int = 70) -> np.ndarray:
    pts = points.copy().astype(np.float32)
    min_xy = pts.min(axis=0)
    max_xy = pts.max(axis=0)
    span = np.maximum(max_xy - min_xy, 1e-6)
    scale = (size - 2 * padding) / max(span)
    pts = (pts - min_xy) * scale + padding
    pts[:, 1] = size - pts[:, 1]
    return pts.astype(np.int32)


def create_contour_overlay(
    query_desc: dict,
    candidate_desc: dict,
    out_path: str | Path,
    size: int = 700,
) -> str:
    """Create optional overlay PNG.

    Convention:
    - Query/new frame contour: green
    - Candidate/portfolio contour: red
    - Overlap/near-overlap: visually appears yellowish
    """
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas = np.full((size, size, 3), 255, dtype=np.uint8)

    q = _points_to_canvas(query_desc["points"], size=size)
    c = _points_to_canvas(candidate_desc["points"], size=size)

    cv2.polylines(canvas, [c.reshape(-1, 1, 2)], isClosed=True, color=(0, 0, 255), thickness=4)
    cv2.polylines(canvas, [q.reshape(-1, 1, 2)], isClosed=True, color=(0, 180, 0), thickness=3)

    cv2.putText(canvas, "New design", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 150, 0), 2)
    cv2.putText(canvas, "Portfolio PID", (30, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 220), 2)
    cv2.imwrite(str(out_path), canvas)
    return str(out_path)
