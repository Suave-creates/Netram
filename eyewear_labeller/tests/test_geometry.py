import unittest

from eyewear_labeller.geometry import rotate_memory_counterclockwise, rotate_point_counterclockwise


class GeometryRotationTest(unittest.TestCase):
    def test_rotate_point_counterclockwise_uses_original_width(self):
        self.assertEqual(
            rotate_point_counterclockwise({"x": 1488, "y": 315}, 1871),
            {"x": 315, "y": 383},
        )

    def test_rotate_memory_counterclockwise_updates_every_label_point(self):
        memory = {
            "modelId": "VC S19003",
            "labels": [
                {
                    "id": "label-1",
                    "type": "rect",
                    "component": "rim",
                    "view": "front-main",
                    "points": [{"x": 10, "y": 20}, {"x": 30, "y": 40}],
                    "groupId": None,
                    "notes": "",
                }
            ],
            "groups": [],
            "updatedAt": "2026-06-20T00:00:00.000Z",
        }

        rotated = rotate_memory_counterclockwise(memory, 100)

        self.assertEqual(rotated["labels"][0]["points"], [{"x": 20, "y": 90}, {"x": 40, "y": 70}])
        self.assertEqual(rotated["modelId"], "VC S19003")
