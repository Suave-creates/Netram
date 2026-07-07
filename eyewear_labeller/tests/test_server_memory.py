import tempfile
import unittest
from pathlib import Path

from eyewear_labeller import server


class MemoryApiTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.original_memory_dir = server.MEMORY_DIR
        server.MEMORY_DIR = Path(self.tmp.name)

    def tearDown(self):
        server.MEMORY_DIR = self.original_memory_dir

    def test_save_and_load_memory_round_trip(self):
        payload = {
            "modelId": "VC S19003",
            "labels": [
                {
                    "id": "label-1",
                    "type": "rect",
                    "component": "rim",
                    "view": "front",
                    "points": [{"x": 10, "y": 20}, {"x": 30, "y": 40}],
                    "groupId": None,
                    "notes": "left front rim seed",
                }
            ],
            "groups": [],
            "updatedAt": "2026-06-20T00:00:00.000Z",
        }

        saved = server.save_memory("VC S19003", payload)
        loaded = server.load_memory("VC S19003")

        self.assertEqual(saved["modelId"], "VC S19003")
        self.assertEqual(loaded["labels"][0]["component"], "rim")
        self.assertTrue((Path(self.tmp.name) / "VC S19003.labels.json").exists())

    def test_rejects_memory_for_wrong_model(self):
        with self.assertRaises(ValueError):
            server.save_memory("VC S19003", {"modelId": "VC S19004", "labels": [], "groups": []})

    def test_rejects_label_without_points(self):
        with self.assertRaises(ValueError):
            server.save_memory(
                "VC S19003",
                {"modelId": "VC S19003", "labels": [{"id": "bad"}], "groups": []},
            )

    def test_save_and_load_configurator_round_trip(self):
        payload = {
            "modelId": "VC S19003",
            "selectedPartIdsByType": {
                "nose_bridge": "nose_bridge--ss-26--vc-s13110-nb",
                "temple": "temple--ss-26--t5",
            },
            "materialId": "antique-brass",
            "lensId": "amber-gold",
            "polarized": True,
            "specs": {"rxPower": -2.25, "lensIndex": 1.67},
            "frameParameters": {"bridgeWidth_mm": 18, "lensWidth_mm": 52},
            "updatedAt": "2026-06-20T00:00:00.000Z",
        }

        saved = server.save_configurator("VC S19003", payload)
        loaded = server.load_configurator("VC S19003-01")

        self.assertEqual(saved["savedAs"], "VC S19003-01")
        self.assertEqual(loaded["savedAs"], "VC S19003-01")
        self.assertEqual(loaded["materialId"], "antique-brass")
        self.assertEqual(loaded["frameParameters"]["bridgeWidth_mm"], 18)
        self.assertTrue((Path(self.tmp.name) / "VC S19003-01.configurator.json").exists())

    def test_configurator_saves_increment_from_existing_versions(self):
        payload = {
            "modelId": "VC S19003",
            "selectedPartIdsByType": {"temple": "temple--ss-26--t5"},
            "materialId": "gunmetal-grey",
            "lensId": "g15-smoke",
            "polarized": True,
            "specs": {"rxPower": 0, "lensIndex": 1.59},
            "frameParameters": {"templeThickness_mm": 2.5},
            "updatedAt": "2026-06-20T00:00:00.000Z",
        }

        first = server.save_configurator("VC S19003", payload)
        second = server.save_configurator("VC S19003", {**payload, "frameParameters": {"templeThickness_mm": 3.5}})
        project = server.project_payload("VC S19003-02")

        self.assertEqual(first["savedAs"], "VC S19003-01")
        self.assertEqual(second["savedAs"], "VC S19003-02")
        self.assertTrue((Path(self.tmp.name) / "VC S19003-02.configurator.json").exists())
        self.assertEqual(server.load_configurator("VC S19003-02")["frameParameters"]["templeThickness_mm"], 3.5)
        self.assertEqual(project["modelId"], "VC S19003")
        self.assertEqual(project["selectedModelId"], "VC S19003-02")
        self.assertEqual(project["selectedConfiguratorId"], "VC S19003-02")
        self.assertEqual(project["configuratorLoadUrl"], "/api/configurator/VC%20S19003-02/load")
        self.assertIn("VC S19003-01", [model["id"] for model in project["models"]])
        self.assertIn("VC S19003-02", [model["id"] for model in project["models"]])
        self.assertEqual(project["nextConfiguratorSaveName"], "VC S19003-03")

    def test_rejects_configurator_for_wrong_model(self):
        with self.assertRaises(ValueError):
            server.save_configurator("VC S19003", {"modelId": "VC S19004"})

    def test_project_payload_uses_landscape_image_url(self):
        payload = server.project_payload()

        self.assertEqual(payload["title"], "Natalia - VC S19003")
        self.assertTrue(payload["source"]["image"].startswith("/static/assets/VC_S19003.png?orientation=landscape&v="))
        self.assertEqual(payload["labellerUrl"], "/labeller?model=VC%20S19003")
        self.assertEqual(payload["partsUrl"], "/parts?type=nose_bridge")
        self.assertEqual(payload["configuratorUrl"], "/configurator?model=VC%20S19003")
        self.assertEqual(payload["configuratorSaveUrl"], "/api/configurator/VC%20S19003/save")
        self.assertIsNone(payload["configuratorLoadUrl"])
        self.assertEqual(payload["selectedModelId"], "VC S19003")
        self.assertEqual(payload["nextConfiguratorSaveName"], "VC S19003-01")
        self.assertEqual(payload["returnPredictionUrl"], "/return-prediction?model=VC%20S19003")
        self.assertEqual(
            [page["id"] for page in payload["menuPages"]],
            ["labeller", "configurator", "lenskart", "return-prediction"],
        )
        self.assertEqual(
            [page["href"] for page in payload["menuPages"]],
            [
                "/labeller?model=VC%20S19003",
                "/configurator?model=VC%20S19003",
                "/lenskart-matcher?model=VC%20S19003",
                "/return-prediction?model=VC%20S19003",
            ],
        )

    def test_project_payload_lists_all_available_pdf_cad_models(self):
        payload = server.project_payload()

        self.assertEqual(
            [model["id"] for model in payload["models"]],
            ["VC S19000", "VC S19001", "VC S19002", "VC S19003", "VC S19004", "VC S19005"],
        )

    def test_project_payload_can_target_another_available_model(self):
        payload = server.project_payload("VC S19004")

        self.assertEqual(payload["modelId"], "VC S19004")
        self.assertEqual(payload["source"]["pdf"], "/source/pdf/VC%20S19004.pdf")
        self.assertEqual(payload["source"]["cad"], "/source/cad/VC%20S19004.dwg")
        self.assertEqual(payload["returnPredictionUrl"], "/return-prediction?model=VC%20S19004")
        self.assertTrue(payload["source"]["image"].startswith("/static/assets/VC_S19004.png?orientation=landscape&v="))
        self.assertTrue(payload["supports3dModel"])

    def test_project_payload_marks_all_labelled_models_as_3d_models(self):
        for model_id in ["VC S19000", "VC S19001", "VC S19002", "VC S19003", "VC S19004", "VC S19005"]:
            with self.subTest(model_id=model_id):
                payload = server.project_payload(model_id)

                self.assertTrue(payload["supports3dModel"])

    def test_memory_path_accepts_other_available_models(self):
        path = server.memory_path("VC S19004")

        self.assertEqual(path.name, "VC S19004.labels.json")

    def test_matcher_payload_describes_engine_inputs_and_default_dimensions(self):
        payload = server.matcher_payload("VC S19003")

        self.assertEqual(payload["modelId"], "VC S19003")
        self.assertEqual(payload["engine"]["matchUrl"], "http://127.0.0.1:8010/match")
        self.assertEqual(payload["engine"]["defaultIndexPath"], "/tmp/merch_matcher_index/portfolio_index.pkl")
        self.assertEqual(
            payload["engine"]["acceptedInputs"],
            ["index_path", "lens_mask", "a_size", "b_size", "dbl", "top_k", "generate_overlay"],
        )
        self.assertEqual(payload["dimensions"], {"a_size": 58, "b_size": 42.4, "dbl": 15.6})
        self.assertEqual(payload["labellerUrl"], "/labeller?model=VC%20S19003")
        self.assertTrue(payload["beautyRender"]["displayOnly"])
        self.assertEqual(payload["beautyRender"]["width"], 1400)
        self.assertEqual(payload["beautyRender"]["height"], 900)
        self.assertEqual(payload["beautyRender"]["frameWidthRatio"], 0.72)

    def test_matcher_payload_has_dimension_defaults_for_all_3d_models(self):
        expected = {
            "VC S19000": {"a_size": 60, "b_size": 53, "dbl": 14},
            "VC S19001": {"a_size": 60, "b_size": 52, "dbl": 14},
            "VC S19002": {"a_size": 59, "b_size": 46.8, "dbl": 11},
            "VC S19003": {"a_size": 58, "b_size": 42.4, "dbl": 15.6},
            "VC S19004": {"a_size": 57, "b_size": 48.7, "dbl": 16},
            "VC S19005": {"a_size": 59, "b_size": 52.1, "dbl": 15},
        }

        for model_id, dimensions in expected.items():
            with self.subTest(model_id=model_id):
                payload = server.matcher_payload(model_id)

                self.assertEqual(payload["dimensions"], dimensions)
                self.assertTrue(payload["supports3dModel"])

    def test_matcher_payload_can_target_other_available_model(self):
        payload = server.matcher_payload("VC S19004")

        self.assertEqual(payload["modelId"], "VC S19004")
        self.assertEqual(payload["dimensions"], {"a_size": 57, "b_size": 48.7, "dbl": 16})
        self.assertTrue(payload["supports3dModel"])

    def test_matcher_page_declares_lens_mask_and_front_view_share_controls(self):
        page = (server.STATIC_DIR / "matcher.html").read_text(encoding="utf-8")

        self.assertIn('href="/">Menu</a>', page)
        self.assertIn('href="/labeller"', page)
        self.assertIn('id="lensMask"', page)
        self.assertIn('id="shareFrontViewButton"', page)
        self.assertIn('id="beautyRenderPreview"', page)
        self.assertIn('id="generatedLensMaskStatus"', page)

    def test_menu_page_links_all_primary_pages(self):
        page = (server.STATIC_DIR / "menu.html").read_text(encoding="utf-8")
        script = (server.STATIC_DIR / "menu.js").read_text(encoding="utf-8")

        self.assertIn("<title>Natalia Menu</title>", page)
        self.assertIn('class="app-name brand-home-link" href="/">Natalia</a>', page)
        self.assertIn('data-menu-link="labeller"', page)
        self.assertIn('data-menu-link="configurator"', page)
        self.assertIn('data-menu-link="lenskart"', page)
        self.assertIn('data-menu-link="return-prediction"', page)
        self.assertIn("<strong>Return prediction</strong>", page)
        self.assertIn("<small>30-day return-risk scoring from frame dimensions</small>", page)
        self.assertIn('/static/menu.js?v=20260620-landing3', page)
        self.assertNotIn('data-menu-link="parts"', page)
        self.assertNotIn('data-menu-link="matcher"', page)
        self.assertIn("project.menuPages", script)
        self.assertIn("HIDDEN_MENU_PAGE_IDS", script)
        self.assertIn("'parts', 'matcher'", script)
        self.assertNotIn("project.partsUrl", script)
        self.assertNotIn("project.matcherUrl", script)
        self.assertIn("bindPageLinkInteractions", script)
        self.assertIn("Natalia - ${project.modelId} Menu", script)
        self.assertIn("[hidden]", (server.STATIC_DIR / "styles.css").read_text(encoding="utf-8"))

    def test_natalia_brand_appears_on_every_page(self):
        for page_name in [
            "menu.html",
            "index.html",
            "matcher.html",
            "configurator.html",
            "parts.html",
            "lenskart-matcher.html",
            "return-prediction.html",
        ]:
            with self.subTest(page_name=page_name):
                page = (server.STATIC_DIR / page_name).read_text(encoding="utf-8")
                self.assertIn('class="app-name brand-home-link" href="/">Natalia</a>', page)

    def test_return_prediction_page_explains_client_side_scoring(self):
        page = (server.STATIC_DIR / "return-prediction.html").read_text(encoding="utf-8")

        self.assertIn("<title>Natalia Return Prediction</title>", page)
        self.assertIn('href="styles.css?v=20260620-landing3"', page)
        self.assertIn("Return prediction", page)
        self.assertIn('class="return-hero-card"', page)
        self.assertIn('class="return-signal-card"', page)
        self.assertIn('class="return-meter"', page)
        self.assertIn("Validate new frame", page)
        self.assertIn('id="returnModelSelect"', page)
        self.assertIn('id="returnFrameWidth"', page)
        self.assertIn('id="returnFrameHeight"', page)
        self.assertIn('id="returnASize"', page)
        self.assertIn('id="returnTempleLength"', page)
        self.assertIn('id="returnDbl"', page)
        self.assertIn("30-day return-risk", page)
        self.assertIn("frame-qc-parameters.csv", page)
        self.assertIn("client-side scoring", page)
        self.assertIn("location.protocol === 'file:'", page)
        self.assertIn('/static/return-prediction.js?v=20260620-landing3', page)
        self.assertIn('return-prediction.js?v=20260620-landing3', page)

        script = (server.STATIC_DIR / "return-prediction.js").read_text(encoding="utf-8")
        self.assertIn("FRAME_3D_DIMENSIONS", script)
        self.assertIn("buildStaticProject", script)
        self.assertIn("returnFrameWidth", script)
        self.assertIn("frontWidth", script)
        self.assertIn("lensHeight", script)
        self.assertIn("templeLength", script)
        self.assertIn("bridgeWidth", script)
        styles = (server.STATIC_DIR / "styles.css").read_text(encoding="utf-8")
        self.assertIn(".return-hero-card", styles)
        self.assertIn(".return-signal-card", styles)
        self.assertIn(".return-meter", styles)

    def test_labeller_page_declares_3d_child_part_controls(self):
        page = (server.STATIC_DIR / "index.html").read_text(encoding="utf-8")

        self.assertIn("<title>Natalia Labeller</title>", page)
        self.assertIn('href="/">Menu</a>', page)
        self.assertIn('id="partsLink" class="action-button toolbar-link" href="/parts?type=nose_bridge" hidden', page)
        self.assertIn('id="matcherLink" class="action-button toolbar-link" href="/matcher" hidden', page)
        self.assertIn('id="configuratorLink"', page)
        self.assertIn('href="/configurator"', page)
        self.assertIn('id="noseBridgePartSelect"', page)
        self.assertIn('id="noseBridgePartStatus"', page)
        self.assertIn('id="frame3dBuildProgress"', page)
        self.assertIn('id="frame3dBuildProgressFill"', page)
        self.assertIn('id="frame3dBuildProgressLabel"', page)
        self.assertIn('id="noseBridgeCompare"', page)
        self.assertIn('id="noseBridgeBeforeButton"', page)
        self.assertIn('id="noseBridgeAfterButton"', page)
        self.assertIn('id="partDrawer"', page)
        self.assertIn('id="partDrawerToggle"', page)
        self.assertIn('id="partDrawerContent"', page)
        self.assertIn('id="noseBridgePartList"', page)

    def test_configurator_page_declares_standalone_drawer_controls(self):
        page = (server.STATIC_DIR / "configurator.html").read_text(encoding="utf-8")

        self.assertIn('id="configuratorModelSelect"', page)
        self.assertIn('id="configuratorDrawer"', page)
        self.assertIn('id="configuratorPartSections"', page)
        self.assertIn('id="materialPresetGrid"', page)
        self.assertIn('id="lensTintGrid"', page)
        self.assertIn('id="specControlGrid"', page)
        self.assertIn('id="frame3dCanvas"', page)
        self.assertIn("location.protocol === 'file:'", page)
        self.assertIn("http://127.0.0.1:8765/configurator", page)
        self.assertIn('/static/configurator.js?v=20260620-landing2', page)

    def test_parts_payload_defaults_to_nose_bridge_library(self):
        payload = server.child_parts_payload()

        self.assertEqual(payload["selectedType"], "nose_bridge")
        self.assertEqual(payload["moduleOrder"][:3], ["nose_bridge", "temple", "temple_tip"])
        self.assertGreaterEqual(payload["summary"]["usable2d"], 28)

    def test_parts_page_declares_library_browser_controls(self):
        page = (server.STATIC_DIR / "parts.html").read_text(encoding="utf-8")

        self.assertIn('id="partTypeTabs"', page)
        self.assertIn('id="partList"', page)
        self.assertIn('id="partPreview"', page)
