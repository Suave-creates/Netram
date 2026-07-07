import json
import struct
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as file:
        header = file.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG file")
    return struct.unpack(">II", header[16:24])


class SourceOrientationTest(unittest.TestCase):
    model_ids = ["VC S19000", "VC S19001", "VC S19002", "VC S19003", "VC S19004", "VC S19005"]

    def test_all_available_model_source_assets_are_landscape(self):
        for model_id in self.model_ids:
            with self.subTest(model_id=model_id):
                width, height = png_dimensions(ROOT / "static" / "assets" / f"{model_id.replace(' ', '_')}.png")
                self.assertGreater(width, height)

    def test_vc_s19003_source_asset_is_landscape(self):
        width, height = png_dimensions(ROOT / "static" / "assets" / "VC_S19003.png")

        self.assertGreater(width, height)

    def test_seed_memory_points_fit_landscape_asset(self):
        width, height = png_dimensions(ROOT / "static" / "assets" / "VC_S19003.png")
        memory = json.loads((ROOT / "memory" / "VC S19003.labels.json").read_text(encoding="utf-8"))

        for label in memory["labels"]:
            for point in label["points"]:
                self.assertGreaterEqual(point["x"], 0, label["id"])
                self.assertLessEqual(point["x"], width, label["id"])
                self.assertGreaterEqual(point["y"], 0, label["id"])
                self.assertLessEqual(point["y"], height, label["id"])

    def test_all_seed_memory_points_fit_their_source_assets(self):
        for model_id in self.model_ids:
            with self.subTest(model_id=model_id):
                width, height = png_dimensions(ROOT / "static" / "assets" / f"{model_id.replace(' ', '_')}.png")
                memory = json.loads((ROOT / "memory" / f"{model_id}.labels.json").read_text(encoding="utf-8"))

                for label in memory["labels"]:
                    for point in label["points"]:
                        self.assertGreaterEqual(point["x"], 0, label["id"])
                        self.assertLessEqual(point["x"], width, label["id"])
                        self.assertGreaterEqual(point["y"], 0, label["id"])
                        self.assertLessEqual(point["y"], height, label["id"])
