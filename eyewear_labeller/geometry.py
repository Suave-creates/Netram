from __future__ import annotations

from copy import deepcopy


def rotate_point_counterclockwise(point: dict, original_width: int | float) -> dict:
    return {
        "x": point["y"],
        "y": original_width - point["x"],
    }


def rotate_memory_counterclockwise(memory: dict, original_width: int | float) -> dict:
    rotated = deepcopy(memory)
    for label in rotated.get("labels", []):
        label["points"] = [
            rotate_point_counterclockwise(point, original_width)
            for point in label.get("points", [])
        ]
    return rotated
