from __future__ import annotations

from pathlib import Path
import json
import pickle
import numpy as np
from sklearn.neighbors import NearestNeighbors

from .config import MatcherConfig
from .portfolio import load_portfolio_excel
from .image_ops import download_image, approximate_lens_mask_from_front_image, mask_from_binary_image
from .descriptors import extract_all_descriptors, geometry_score
from .scoring import proportion_score, final_score
from .visualization import create_contour_overlay


def _feature_vector(desc: dict) -> np.ndarray:
    return np.concatenate([desc["fourier"], desc["hu"], desc["curvature"]]).astype(np.float32)


def build_index(excel_path: str, out_dir: str, category: str | None = None, max_rows: int | None = None) -> dict:
    cfg = MatcherConfig()
    out = Path(out_dir)
    (out / "images").mkdir(parents=True, exist_ok=True)
    (out / "masks").mkdir(exist_ok=True)
    df = load_portfolio_excel(excel_path, category=category)
    if max_rows:
        df = df.head(max_rows)

    records, vectors = [], []
    failures = []
    for _, row in df.iterrows():
        pid = str(row["product_id"])
        try:
            img_path = out / "images" / f"{pid}.jpg"
            if not img_path.exists():
                download_image(row["image_front"], img_path)
            mask = approximate_lens_mask_from_front_image(img_path)
            mask_path = out / "masks" / f"{pid}.png"
            import cv2
            cv2.imwrite(str(mask_path), mask)
            desc = extract_all_descriptors(mask, cfg.contour_points, cfg.fourier_coeffs)
            vec = _feature_vector(desc)
            records.append({
                "product_id": pid,
                "model": row.get("model"),
                "category": row.get("category"),
                "shape_family": row.get("shape_family"),
                "a_size": row.get("a_size"),
                "b_size": row.get("b_size"),
                "dbl": row.get("dbl"),
                "image_front": row.get("image_front"),
                "product_url": row.get("product_url"),
                "mask_path": str(mask_path),
                "descriptor": desc,
            })
            vectors.append(vec)
        except Exception as e:
            failures.append({"product_id": pid, "error": str(e)})

    if not records:
        raise RuntimeError("No portfolio records could be indexed")
    vectors = np.vstack(vectors)
    nn = NearestNeighbors(n_neighbors=min(cfg.candidate_pool, len(records)), metric="euclidean")
    nn.fit(vectors)
    payload = {"config": cfg, "records": records, "vectors": vectors, "nn": nn, "failures": failures}
    with open(out / "portfolio_index.pkl", "wb") as f:
        pickle.dump(payload, f)
    with open(out / "index_summary.json", "w") as f:
        json.dump({"indexed": len(records), "failed": len(failures), "failures": failures[:20]}, f, indent=2)
    return {"indexed": len(records), "failed": len(failures), "out_dir": str(out)}


def load_index(index_path: str):
    with open(index_path, "rb") as f:
        return pickle.load(f)


def match_mask(index_path: str, mask_path: str, query_dims: dict, top_k: int = 10, generate_overlay: bool = False, overlay_dir: str | None = None) -> list[dict]:
    payload = load_index(index_path)
    cfg = payload["config"]
    mask = mask_from_binary_image(mask_path)
    q_desc = extract_all_descriptors(mask, cfg.contour_points, cfg.fourier_coeffs)
    q_vec = _feature_vector(q_desc).reshape(1, -1)
    n = min(max(top_k, cfg.candidate_pool), len(payload["records"]))
    dists, idxs = payload["nn"].kneighbors(q_vec, n_neighbors=n)
    results = []
    for idx in idxs[0]:
        rec = payload["records"][int(idx)]
        geo = geometry_score(q_desc, rec["descriptor"])
        prop = proportion_score(query_dims, rec, cfg)
        score = final_score(geo["geometry_score"], prop["proportion_score"], cfg)
        overlay_path = None
        if generate_overlay:
            base_dir = Path(overlay_dir) if overlay_dir else Path(index_path).parent / "overlays"
            overlay_path = create_contour_overlay(q_desc, rec["descriptor"], base_dir / f"query_vs_{rec['product_id']}.png")
        results.append({
            "product_id": rec["product_id"],
            "model": rec.get("model"),
            "category": rec.get("category"),
            "shape_family": rec.get("shape_family"),
            "similarity": round(score, 2),
            **{k: round(v, 2) for k, v in geo.items() if k.endswith("score")},
            **{k: round(v, 2) for k, v in prop.items()},
            "image_front": rec.get("image_front"),
            "product_url": rec.get("product_url"),
            "overlay_image": overlay_path,
        })
    return sorted(results, key=lambda x: x["similarity"], reverse=True)[:top_k]
