import unittest

from eyewear_labeller import child_parts


class ChildPartInventoryTest(unittest.TestCase):
    def test_library_order_starts_with_active_nose_bridges(self):
        payload = child_parts.library_payload()

        self.assertEqual(payload["moduleOrder"][0], "nose_bridge")
        self.assertEqual(payload["types"][0]["type"], "nose_bridge")
        self.assertEqual(payload["types"][0]["buildStatus"], "active")

    def test_nose_bridge_payload_includes_ss26_bridge_pair(self):
        payload = child_parts.library_payload("nose_bridge")
        bridge = next(part for part in payload["parts"] if part["name"] == "VC S13110 NB")

        self.assertEqual(bridge["id"], "nose_bridge--ss-26--vc-s13110-nb")
        self.assertEqual(bridge["type"], "nose_bridge")
        self.assertEqual(bridge["sourceGroup"], "SS-26")
        self.assertEqual(bridge["version"], "v1")
        self.assertEqual(bridge["readiness"], "usable_2d")
        self.assertTrue(bridge["assets"]["dwgUrl"].endswith("asset=dwg"))
        self.assertTrue(bridge["assets"]["pdfUrl"].endswith("asset=pdf"))
        self.assertTrue(bridge["assets"]["svgUrl"].endswith("asset=svg"))
        self.assertEqual(bridge["configurator"]["compatibleSlots"], ["nose_bridge"])
        self.assertEqual(bridge["configurator"]["fit"]["bridgeDetailWidthMm"], 17.94)
        self.assertEqual(bridge["configurator"]["fit"]["profileDepthMm"], 2.13)
        self.assertIn("manual_metadata", bridge["missing"])
        self.assertIn("3d_geometry", bridge["missing"])

    def test_filename_bridge_length_cues_feed_first_3d_fit_estimate(self):
        payload = child_parts.library_payload("nose_bridge")
        bridge = next(part for part in payload["parts"] if part["name"] == "BWF 2520 NB")

        self.assertEqual(bridge["configurator"]["fit"]["bridgeDetailWidthMm"], 19.62)
        self.assertEqual(bridge["configurator"]["fit"]["source"], "PDF text")

    def test_every_nose_bridge_pdf_contributes_extracted_fit_geometry(self):
        payload = child_parts.library_payload("nose_bridge")
        pdf_source_count = len(list((child_parts.CHILD_PARTS_DIR / "Nose Bridge").rglob("*.pdf")))
        pdf_parts = [part for part in payload["parts"] if part["assets"]["pdfUrl"]]

        self.assertEqual(len(pdf_parts), pdf_source_count)
        self.assertTrue(all(part["assets"]["previewUrl"].endswith("asset=preview") for part in pdf_parts))
        self.assertTrue(all(part["configurator"]["canPreviewOnFrame"] for part in pdf_parts))
        self.assertTrue(all(part["configurator"]["fit"]["bridgeDetailWidthMm"] for part in pdf_parts))
        self.assertTrue(all(part["configurator"]["fit"]["centerline2dMm"] for part in pdf_parts))

        ss26_bridge = next(part for part in pdf_parts if part["name"] == "VC S13112 NB")
        length_bridge = next(part for part in pdf_parts if part["name"] == "N13-VC S13112")

        self.assertEqual(ss26_bridge["sourceGroup"], "SS-26")
        self.assertAlmostEqual(ss26_bridge["configurator"]["fit"]["bridgeDetailWidthMm"], 23.32, places=2)
        self.assertAlmostEqual(length_bridge["configurator"]["fit"]["bridgeDetailWidthMm"], 23.31, places=2)
        self.assertEqual(ss26_bridge["configurator"]["fit"]["source"], "PDF text")

    def test_nose_bridge_preview_svg_is_normalized_for_drawer_cards(self):
        renderer = getattr(child_parts, "render_child_part_preview_svg", None)

        self.assertTrue(callable(renderer))
        svg = renderer("nose_bridge--ss-26--vc-s13110-nb") if callable(renderer) else b""
        text = svg.decode("utf-8", errors="replace")

        self.assertIn("<svg", text)
        self.assertIn("<path", text)
        self.assertNotIn("stroke-width:0.0px", text)
        self.assertNotIn('viewBox="2753.', text)
        view_box = text.split('viewBox="', 1)[1].split('"', 1)[0]
        _x, _y, width, height = [float(value) for value in view_box.split()]
        self.assertLess(width, 100)
        self.assertLess(height, 100)

    def test_temple_and_tip_payload_include_live_3d_fit_cues(self):
        temple_payload = child_parts.library_payload("temple")
        temple = next(part for part in temple_payload["parts"] if part["name"] == "VC E11891 Temple")
        self.assertTrue(temple["configurator"]["canPreviewOnFrame"])
        self.assertEqual(temple["configurator"]["fit"]["templeLengthMm"], 132.7)
        self.assertEqual(temple["configurator"]["fit"]["frontHeightMm"], 5.8)

        tip_payload = child_parts.library_payload("temple_tip")
        tip = next(part for part in tip_payload["parts"] if part["name"] == "TT2-Bend")
        self.assertTrue(tip["configurator"]["canPreviewOnFrame"])
        self.assertEqual(tip["configurator"]["fit"]["tipLengthMm"], 70)
        self.assertEqual(tip["configurator"]["fit"]["tipAngleDeg"], 83)

    def test_tt1_tip_payload_does_not_carry_s19004_frame_specific_overlap(self):
        tip_payload = child_parts.library_payload("temple_tip")
        tip = next(part for part in tip_payload["parts"] if part["name"] == "TT1-Bend")

        self.assertTrue(tip["configurator"]["canPreviewOnFrame"])
        self.assertEqual(tip["configurator"]["fit"]["tipLengthMm"], 75)
        self.assertEqual(tip["configurator"]["fit"]["tipAngleDeg"], 35)
        self.assertNotIn("visibleLengthMm", tip["configurator"]["fit"])
        self.assertNotIn("sleeveOverlapMm", tip["configurator"]["fit"])

    def test_nose_bridge_summary_counts_paired_and_dwg_only_parts(self):
        payload = child_parts.library_payload("nose_bridge")

        self.assertGreaterEqual(payload["summary"]["usable2d"], 28)
        self.assertGreater(payload["summary"]["dwgOnly"], 0)
        self.assertEqual(payload["summary"]["manualOnly"], 0)

    def test_manual_nose_pad_variants_are_available_for_later_module(self):
        payload = child_parts.library_payload("nose_pad")

        self.assertEqual(payload["types"][0]["type"], "nose_bridge")
        self.assertEqual([part["name"] for part in payload["parts"]], [
            "Infinity logo - translucent",
            "Infinity logo - black",
            "Infinity logo - grey",
            "Plain - translucent",
            "Plain - black",
            "Plain - grey",
        ])
        self.assertTrue(all(part["readiness"] == "manual_only" for part in payload["parts"]))

    def test_manual_nose_pad_variants_can_preview_color_on_3d_frame(self):
        payload = child_parts.library_payload("nose_pad")
        black = next(part for part in payload["parts"] if part["name"] == "Plain - black")
        grey = next(part for part in payload["parts"] if part["name"] == "Infinity logo - grey")

        self.assertTrue(black["configurator"]["canPreviewOnFrame"])
        self.assertEqual(black["configurator"]["fit"]["colorHex"], "#202124")
        self.assertEqual(black["configurator"]["fit"]["opacity"], 0.96)
        self.assertEqual(grey["configurator"]["fit"]["colorHex"], "#8b9094")
        self.assertEqual(grey["configurator"]["fit"]["logo"], "infinity")

    def test_manual_nosearm_variants_can_preview_on_3d_frame(self):
        payload = child_parts.library_payload("nosearm")
        long = next(part for part in payload["parts"] if part["name"] == "Long nosearm")
        short = next(part for part in payload["parts"] if part["name"] == "Short nosearm")

        self.assertTrue(long["configurator"]["canPreviewOnFrame"])
        self.assertTrue(short["configurator"]["canPreviewOnFrame"])
        self.assertEqual(long["configurator"]["fit"]["lengthClass"], "long")
        self.assertEqual(short["configurator"]["fit"]["lengthClass"], "short")
        self.assertGreater(
            long["configurator"]["fit"]["armReachMm"],
            short["configurator"]["fit"]["armReachMm"],
        )

    def test_rejects_unknown_part_type(self):
        with self.assertRaises(ValueError):
            child_parts.library_payload("rim")

    def test_resolves_known_child_part_asset_path(self):
        path, content_type = child_parts.resolve_child_part_asset(
            "nose_bridge--ss-26--vc-s13110-nb",
            "pdf",
        )

        self.assertEqual(content_type, "application/pdf")
        self.assertEqual(path.name, "VC S13110 NB.pdf")


if __name__ == "__main__":
    unittest.main()
