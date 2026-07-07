from __future__ import annotations

from pathlib import Path
import requests
import cv2
import numpy as np


def download_image(url: str, out_path: str | Path, timeout: int = 20) -> Path:
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    r = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    out_path.write_bytes(r.content)
    return out_path


def read_image(path: str | Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"Could not read image: {path}")
    return img


def mask_from_binary_image(path: str | Path) -> np.ndarray:
    """Read user-provided lens opening mask. White = lens opening, black = rest."""
    img = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Could not read mask: {path}")
    _, mask = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)
    return mask


def approximate_lens_mask_from_front_image(path: str | Path) -> np.ndarray:
    """Fallback CV segmentation for portfolio front images when explicit masks are unavailable.

    This is intentionally conservative. For production, explicit masks or a trained segmentation model
    should replace this function.
    """
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not read image: {path}")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(gray, 40, 120)
    kernel = np.ones((5, 5), np.uint8)
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    h, w = gray.shape
    candidates = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        x, y, cw, ch = cv2.boundingRect(cnt)
        if area < 0.005 * h * w or area > 0.45 * h * w:
            continue
        if cw < 0.08 * w or ch < 0.08 * h:
            continue
        candidates.append((area, x, y, cw, ch, cnt))
    candidates = sorted(candidates, key=lambda x: x[0], reverse=True)[:2]
    mask = np.zeros_like(gray)
    for *_rest, cnt in candidates:
        cv2.drawContours(mask, [cnt], -1, 255, thickness=-1)
    return mask
