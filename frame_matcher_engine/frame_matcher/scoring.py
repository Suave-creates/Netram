from __future__ import annotations

from .config import MatcherConfig


def dimension_score(query_value, candidate_value, tolerance_mm: float) -> float:
    if query_value is None or candidate_value is None:
        return 50.0  # neutral until exact dimensions are available
    delta = abs(float(query_value) - float(candidate_value))
    return max(0.0, min(100.0, 100.0 * (1.0 - delta / tolerance_mm)))


def proportion_score(query_dims: dict, cand_dims: dict, cfg: MatcherConfig) -> dict:
    a = dimension_score(query_dims.get("a_size"), cand_dims.get("a_size"), cfg.a_tolerance_mm)
    b = dimension_score(query_dims.get("b_size"), cand_dims.get("b_size"), cfg.b_tolerance_mm)
    d = dimension_score(query_dims.get("dbl"), cand_dims.get("dbl"), cfg.dbl_tolerance_mm)
    return {"a_score": a, "b_score": b, "dbl_score": d, "proportion_score": (a + b + d) / 3.0}


def final_score(geometry_score: float, proportion_score: float, cfg: MatcherConfig) -> float:
    return cfg.geometry_weight * geometry_score + cfg.proportion_weight * proportion_score
