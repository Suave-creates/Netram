from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional
import re
import pandas as pd

REQUIRED_COLUMNS = ["product_id", "image_front", "parent_category", "frame_shape", "A size_3", "DBL_5"]
OPTIONAL_COLUMNS = ["model", "frame_material", "frame_type", "frame_size", "Frame Height_2", "Frame Width_1", "product_url"]

@dataclass
class PortfolioRow:
    product_id: str
    image_front: str
    parent_category: str
    frame_shape: Optional[str] = None
    model: Optional[str] = None
    a_size: Optional[float] = None
    b_size: Optional[float] = None
    dbl: Optional[float] = None
    frame_width: Optional[float] = None
    frame_height: Optional[float] = None
    product_url: Optional[str] = None


def _num(value):
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    m = re.search(r"[-+]?\d*\.?\d+", str(value))
    return float(m.group(0)) if m else None


def load_portfolio_excel(path: str | Path, category: str | None = None) -> pd.DataFrame:
    """Load Lenskart portfolio Excel and normalize the columns needed by the matcher."""
    df = pd.read_excel(path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    keep = [c for c in REQUIRED_COLUMNS + OPTIONAL_COLUMNS if c in df.columns]
    out = df[keep].copy()
    out = out.rename(columns={
        "product_id": "product_id",
        "image_front": "image_front",
        "parent_category": "category",
        "frame_shape": "shape_family",
        "model": "model",
        "A size_3": "a_size",
        "Frame Height_2": "b_size",
        "DBL_5": "dbl",
        "Frame Width_1": "frame_width",
        "product_url": "product_url",
    })
    for col in ["a_size", "b_size", "dbl", "frame_width"]:
        if col in out.columns:
            out[col] = out[col].map(_num)
    out["product_id"] = out["product_id"].astype(str)
    out = out[out["image_front"].notna() & (out["image_front"].astype(str).str.len() > 5)]
    if category:
        out = out[out["category"].astype(str).str.lower() == category.lower()]
    return out.reset_index(drop=True)
