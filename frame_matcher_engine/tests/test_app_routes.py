import importlib
import sys
import types

from fastapi.testclient import TestClient


def import_app_with_stubbed_matcher():
    frame_matcher = types.ModuleType("frame_matcher")
    frame_matcher.__path__ = []
    indexer = types.ModuleType("frame_matcher.indexer")
    indexer.build_index = lambda *args, **kwargs: {}
    indexer.match_mask = lambda *args, **kwargs: []

    previous_frame_matcher = sys.modules.get("frame_matcher")
    previous_indexer = sys.modules.get("frame_matcher.indexer")
    previous_python_multipart = sys.modules.get("python_multipart")
    python_multipart = types.ModuleType("python_multipart")
    python_multipart.__version__ = "0.0.32"
    sys.modules["frame_matcher"] = frame_matcher
    sys.modules["frame_matcher.indexer"] = indexer
    sys.modules["python_multipart"] = python_multipart
    try:
        module = importlib.import_module("frame_matcher_engine.app")
        return importlib.reload(module).app
    finally:
        if previous_frame_matcher is None:
            sys.modules.pop("frame_matcher", None)
        else:
            sys.modules["frame_matcher"] = previous_frame_matcher
        if previous_indexer is None:
            sys.modules.pop("frame_matcher.indexer", None)
        else:
            sys.modules["frame_matcher.indexer"] = previous_indexer
        if previous_python_multipart is None:
            sys.modules.pop("python_multipart", None)
        else:
            sys.modules["python_multipart"] = previous_python_multipart


def test_get_match_explains_browser_direct_access():
    client = TestClient(import_app_with_stubbed_matcher())

    response = client.get("/match")

    assert response.status_code == 200
    assert response.json() == {
        "detail": "The matcher runs from the UI. Open http://127.0.0.1:8766/matcher?model=VC%20S19003 and use Run match.",
        "method": "POST",
        "ui": "http://127.0.0.1:8766/matcher?model=VC%20S19003",
    }
