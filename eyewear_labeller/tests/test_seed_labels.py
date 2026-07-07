import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MEMORY_PATH = ROOT / "memory" / "VC S19003.labels.json"
MODEL_IDS = ["VC S19000", "VC S19001", "VC S19002", "VC S19003", "VC S19004", "VC S19005"]
SEEDED_MODEL_IDS = ["VC S19000", "VC S19001", "VC S19002", "VC S19004", "VC S19005"]


def load_memory():
    return json.loads(MEMORY_PATH.read_text(encoding="utf-8"))


def bounds(label):
    xs = [point["x"] for point in label["points"]]
    ys = [point["y"] for point in label["points"]]
    return min(xs), min(ys), max(xs), max(ys)


class SeedLabelMappingTest(unittest.TestCase):
    def test_all_available_models_have_seed_label_memory(self):
        required_components = {
            "rim",
            "nose_bridge",
            "nose_pad",
            "temple",
            "temple_tip",
            "hinge_joint",
            "rim_lock",
            "lens_former",
            "end_piece",
        }
        learned_components = required_components | {
            "browbar",
            "wire_core",
        }

        for model_id in SEEDED_MODEL_IDS:
            with self.subTest(model_id=model_id):
                path = ROOT / "memory" / f"{model_id}.labels.json"
                self.assertTrue(path.exists(), model_id)
                memory = json.loads(path.read_text(encoding="utf-8"))
                components = {label["component"] for label in memory["labels"]}
                views = {label["view"] for label in memory["labels"]}

                self.assertEqual(memory["modelId"], model_id)
                self.assertGreaterEqual(len(memory["labels"]), 24)
                self.assertGreaterEqual(len(memory["groups"]), 5)
                self.assertTrue(required_components.issubset(components))
                self.assertTrue(components.issubset(learned_components))
                self.assertIn("front-main", views)
                self.assertIn("front-detail", views)
                self.assertIn("top", views)
                self.assertIn("side-left", views)
                self.assertIn("side-right", views)

    def test_seeded_front_view_side_mapping_is_wearer_oriented_for_all_models(self):
        for model_id in SEEDED_MODEL_IDS:
            with self.subTest(model_id=model_id):
                memory = json.loads((ROOT / "memory" / f"{model_id}.labels.json").read_text(encoding="utf-8"))
                right = next(item for item in memory["labels"] if item["id"] == "label-front-main-right-rim")
                left = next(item for item in memory["labels"] if item["id"] == "label-front-main-left-rim")

                self.assertIn("wearer right", right["notes"].lower())
                self.assertIn("wearer left", left["notes"].lower())
                self.assertLess(bounds(right)[2], bounds(left)[0])

    def test_front_view_visual_left_is_wearer_right_rim(self):
        memory = load_memory()
        label = next(item for item in memory["labels"] if item["id"] == "label-front-main-right-rim")
        x1, y1, x2, y2 = bounds(label)

        self.assertEqual(label["component"], "rim")
        self.assertEqual(label["view"], "front-main")
        self.assertIn("wearer right", label["notes"].lower())
        self.assertLess(x2, 760)
        self.assertGreater(x1, 240)
        self.assertGreater(y2, 350)

    def test_front_view_visual_right_is_wearer_left_rim(self):
        memory = load_memory()
        label = next(item for item in memory["labels"] if item["id"] == "label-front-main-left-rim")
        x1, y1, x2, y2 = bounds(label)

        self.assertEqual(label["component"], "rim")
        self.assertEqual(label["view"], "front-main")
        self.assertIn("wearer left", label["notes"].lower())
        self.assertGreaterEqual(x1, 750)
        self.assertLess(x2, 1240)
        self.assertGreater(y2, 350)

    def test_nose_bridge_has_front_and_detail_boxes_from_text_cues(self):
        memory = load_memory()
        labels = [item for item in memory["labels"] if item["component"] == "nose_bridge"]
        views = {item["view"] for item in labels}
        notes = " ".join(item["notes"] for item in labels).lower()

        self.assertGreaterEqual(len(labels), 4)
        self.assertIn("front-main", views)
        self.assertIn("front-detail", views)
        self.assertIn("detail", views)
        self.assertIn("vc s13110", notes)
        self.assertIn("dbl", notes)

    def test_front_bridge_box_sits_between_rims_without_covering_rim_centers(self):
        memory = load_memory()
        bridge = next(item for item in memory["labels"] if item["id"] == "label-front-main-nose-bridge")
        x1, y1, x2, y2 = bounds(bridge)

        self.assertGreaterEqual(x1, 640)
        self.assertLessEqual(x2, 790)
        self.assertGreaterEqual(y1, 145)
        self.assertLessEqual(y2, 270)

    def test_side_view_upper_temple_and_tip_are_left_labels(self):
        memory = load_memory()
        temple = next(item for item in memory["labels"] if item["id"] == "label-side-left-temple")
        tip = next(item for item in memory["labels"] if item["id"] == "label-side-left-temple-tip")

        self.assertEqual(temple["view"], "side-left")
        self.assertEqual(tip["view"], "side-left")
        self.assertEqual(temple["groupId"], "group-temple-upper")
        self.assertIn("left side-view", temple["notes"].lower())
        self.assertIn("left side-view", tip["notes"].lower())
        self.assertLess(bounds(temple)[3], 850)
        self.assertLess(bounds(tip)[3], 850)

    def test_side_view_lower_temple_is_right_label(self):
        memory = load_memory()
        temple = next(item for item in memory["labels"] if item["id"] == "label-side-right-temple")

        self.assertEqual(temple["view"], "side-right")
        self.assertEqual(temple["groupId"], "group-temple-lower")
        self.assertIn("right side-view", temple["notes"].lower())
        self.assertGreater(bounds(temple)[1], 900)
