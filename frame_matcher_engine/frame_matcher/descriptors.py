from __future__ import annotations

import cv2
import numpy as np
from scipy.spatial.distance import directed_hausdorff


def largest_contour(mask: np.ndarray) -> np.ndarray:
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not contours:
        raise ValueError("No lens opening contour found in mask")
    return max(contours, key=cv2.contourArea).reshape(-1, 2).astype(np.float32)


def resample_contour(contour: np.ndarray, n: int = 360) -> np.ndarray:
    pts = contour.astype(np.float32)
    if len(pts) < 5:
        raise ValueError("Contour has too few points")
    closed = np.vstack([pts, pts[0]])
    seg = np.sqrt(((closed[1:] - closed[:-1]) ** 2).sum(axis=1))
    dist = np.concatenate([[0], np.cumsum(seg)])
    total = dist[-1]
    if total == 0:
        raise ValueError("Zero-length contour")
    sample = np.linspace(0, total, n, endpoint=False)
    x = np.interp(sample, dist, closed[:, 0])
    y = np.interp(sample, dist, closed[:, 1])
    out = np.vstack([x, y]).T
    return normalize_points(out)


def normalize_points(points: np.ndarray) -> np.ndarray:
    pts = points - points.mean(axis=0, keepdims=True)
    scale = np.sqrt((pts ** 2).sum(axis=1)).mean()
    if scale > 0:
        pts = pts / scale
    # stable start point: begin at left-most top-ish point
    idx = np.lexsort((pts[:, 1], pts[:, 0]))[0]
    pts = np.roll(pts, -idx, axis=0)
    return pts.astype(np.float32)


def fourier_descriptor(points: np.ndarray, coeffs: int = 32) -> np.ndarray:
    z = points[:, 0] + 1j * points[:, 1]
    f = np.fft.fft(z)
    # Remove translation; normalize scale with first harmonic energy.
    f[0] = 0
    mag = np.abs(f[1]) if np.abs(f[1]) > 1e-8 else 1.0
    f = f / mag
    descriptor = np.concatenate([np.real(f[1:coeffs+1]), np.imag(f[1:coeffs+1])])
    return descriptor.astype(np.float32)


def hu_moments(mask: np.ndarray) -> np.ndarray:
    m = cv2.moments(mask)
    hu = cv2.HuMoments(m).flatten()
    hu = -np.sign(hu) * np.log10(np.abs(hu) + 1e-12)
    return hu.astype(np.float32)


def curvature_signature(points: np.ndarray) -> np.ndarray:
    prev = np.roll(points, 1, axis=0)
    nxt = np.roll(points, -1, axis=0)
    v1 = points - prev
    v2 = nxt - points
    a1 = np.arctan2(v1[:, 1], v1[:, 0])
    a2 = np.arctan2(v2[:, 1], v2[:, 0])
    d = np.unwrap(a2 - a1)
    return d.astype(np.float32)


def extract_all_descriptors(mask: np.ndarray, contour_points: int = 360, fourier_coeffs: int = 32) -> dict:
    contour = largest_contour(mask)
    pts = resample_contour(contour, contour_points)
    return {
        "points": pts,
        "fourier": fourier_descriptor(pts, fourier_coeffs),
        "hu": hu_moments(mask),
        "curvature": curvature_signature(pts),
    }


def similarity_from_distance(distance: float, scale: float) -> float:
    return float(max(0.0, min(100.0, 100.0 * (1.0 - distance / scale))))


def geometry_score(a: dict, b: dict) -> dict:
    fd = np.linalg.norm(a["fourier"] - b["fourier"])
    hu = np.linalg.norm(a["hu"] - b["hu"])
    curv = np.linalg.norm(a["curvature"] - b["curvature"]) / len(a["curvature"])
    hd = max(directed_hausdorff(a["points"], b["points"])[0], directed_hausdorff(b["points"], a["points"])[0])
    scores = {
        "fourier_score": similarity_from_distance(fd, 8.0),
        "hu_score": similarity_from_distance(hu, 20.0),
        "curvature_score": similarity_from_distance(curv, 0.25),
        "hausdorff_score": similarity_from_distance(hd, 1.0),
    }
    scores["geometry_score"] = (
        0.25/0.80 * scores["fourier_score"] +
        0.15/0.80 * scores["hu_score"] +
        0.10/0.80 * scores["curvature_score"] +
        0.30/0.80 * scores["hausdorff_score"]
    )
    return scores
