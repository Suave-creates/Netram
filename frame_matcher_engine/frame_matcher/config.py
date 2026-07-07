from dataclasses import dataclass

@dataclass(frozen=True)
class MatcherConfig:
    # User-approved Version 1 logic: shape family is a filter/explanation, not score.
    geometry_weight: float = 0.80
    proportion_weight: float = 0.20
    top_k: int = 10
    candidate_pool: int = 50
    contour_points: int = 360
    fourier_coeffs: int = 32
    # Tolerances used to convert dimensional deltas to scores.
    a_tolerance_mm: float = 4.0
    b_tolerance_mm: float = 4.0
    dbl_tolerance_mm: float = 4.0
