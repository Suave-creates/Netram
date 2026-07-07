from __future__ import annotations

import base64
import json
from pathlib import Path

from PIL import Image, ImageDraw

from eyewear_labeller import lenskart_matcher
from eyewear_labeller import server


def write_frame(path: Path, shape: str, size: tuple[int, int] = (220, 130)) -> None:
    image = Image.new("RGB", size, "#f3f5f4")
    draw = ImageDraw.Draw(image)
    if shape == "aviator":
        draw.ellipse((24, 34, 94, 96), outline="#222222", width=7)
        draw.ellipse((126, 34, 196, 96), outline="#222222", width=7)
        draw.line((54, 30, 166, 30), fill="#222222", width=6)
        draw.arc((92, 50, 128, 76), 190, 350, fill="#222222", width=5)
    elif shape == "cat-eye":
        draw.polygon([(24, 64), (58, 26), (102, 46), (96, 98), (42, 96)], outline="#222222")
        draw.polygon([(118, 46), (162, 26), (196, 64), (178, 96), (124, 98)], outline="#222222")
        draw.line((102, 66, 118, 66), fill="#222222", width=5)
    else:
        draw.rounded_rectangle((24, 38, 96, 94), radius=10, outline="#222222", width=7)
        draw.rounded_rectangle((124, 38, 196, 94), radius=10, outline="#222222", width=7)
        draw.line((96, 65, 124, 65), fill="#222222", width=5)
    image.save(path)


def product(product_id: str, image_path: Path, shape: str, a_size: float, b_size: float) -> dict:
    return {
        "product_id": product_id,
        "model": product_id,
        "brand": "Vincent Chase",
        "category": "sunglasses",
        "shape": shape,
        "frame_type": "Full Rim",
        "material": "Stainless Steel",
        "a_size": a_size,
        "b_size": b_size,
        "dbl": 16,
        "product_url": f"https://www.lenskart.com/{product_id}.html",
        "image_front_url": "https://static5.lenskart.com/example.jpg",
        "local_image": str(image_path),
    }


def test_deterministic_sample_keeps_vincent_chase_sunglasses_stable() -> None:
    candidates = [
        {"product_id": str(index), "brand": "Vincent Chase", "category": "sunglasses", "image_front_url": f"https://example.test/{index}.jpg"}
        for index in range(70)
    ]
    candidates.extend([
        {"product_id": "bad-brand", "brand": "John Jacobs", "category": "sunglasses", "image_front_url": "https://example.test/bad.jpg"},
        {"product_id": "bad-category", "brand": "Vincent Chase", "category": "eyeframe", "image_front_url": "https://example.test/bad2.jpg"},
    ])

    first = lenskart_matcher.deterministic_sample(
        candidates,
        sample_size=50,
        dataset=lenskart_matcher.VINCENT_CHASE_SUNGLASSES_DATASET,
    )
    second = lenskart_matcher.deterministic_sample(
        list(reversed(candidates)),
        sample_size=50,
        dataset=lenskart_matcher.VINCENT_CHASE_SUNGLASSES_DATASET,
    )

    assert len(first) == 50
    assert [item["product_id"] for item in first] == [item["product_id"] for item in second]
    assert all(item["brand"].startswith("Vincent Chase") for item in first)
    assert all(item["category"] == "sunglasses" for item in first)


def test_metal_eyewear_dataset_filters_to_metal_frames() -> None:
    candidates = [
        {"product_id": "steel", "brand": "Vincent Chase", "category": "eyeframe", "material": "Stainless Steel", "image_front_url": "https://example.test/steel.jpg"},
        {"product_id": "metal", "brand": "John Jacobs", "category": "sunglasses", "material": "Metal", "image_front_url": "https://example.test/metal.jpg"},
        {"product_id": "titanium", "brand": "John Jacobs", "category": "eyeframe", "material": "Titanium", "image_front_url": "https://example.test/titanium.jpg"},
        {"product_id": "plastic", "brand": "Vincent Chase", "category": "sunglasses", "material": "TR90", "image_front_url": "https://example.test/plastic.jpg"},
        {"product_id": "non-metal", "brand": "Vincent Chase", "category": "sunglasses", "material": "Non Metal", "image_front_url": "https://example.test/non-metal.jpg"},
        {"product_id": "accessory", "brand": "Lenskart", "category": "shipping_accessories", "material": "Metal", "image_front_url": "https://example.test/accessory.jpg"},
    ]

    sample = lenskart_matcher.deterministic_sample(
        candidates,
        sample_size=10,
        dataset=lenskart_matcher.METAL_EYEWEAR_DATASET,
    )

    assert {item["product_id"] for item in sample} == {"steel", "metal", "titanium"}
    assert lenskart_matcher.is_metal_eyewear(candidates[0])
    assert not lenskart_matcher.is_metal_eyewear(candidates[3])
    assert not lenskart_matcher.is_metal_eyewear(candidates[4])
    assert not lenskart_matcher.is_metal_eyewear(candidates[5])


def test_hybrid_matcher_ranks_visual_and_metadata_match_first(tmp_path: Path) -> None:
    query_path = tmp_path / "query.jpg"
    aviator_path = tmp_path / "aviator.jpg"
    cat_eye_path = tmp_path / "cat-eye.jpg"
    write_frame(query_path, "aviator")
    write_frame(aviator_path, "aviator")
    write_frame(cat_eye_path, "cat-eye")

    matches = lenskart_matcher.match_products(
        query_path,
        [
            product("vc-aviator", aviator_path, "Aviator", 58, 42),
            product("vc-cat-eye", cat_eye_path, "Cat Eye", 52, 35),
        ],
        {"a_size": 58, "b_size": 42.4, "dbl": 15.6, "shape": "Aviator", "frame_type": "Full Rim"},
        top_k=2,
        use_vlm=False,
    )

    assert [match["product_id"] for match in matches] == ["vc-aviator", "vc-cat-eye"]
    assert matches[0]["similarity"] > matches[1]["similarity"]
    assert matches[0]["visual_score"] >= 90
    assert "Shape" in matches[0]["reason"]


def test_hybrid_matcher_returns_distinct_frame_models(tmp_path: Path) -> None:
    query_path = tmp_path / "query.jpg"
    aviator_path = tmp_path / "aviator.jpg"
    square_path = tmp_path / "square.jpg"
    write_frame(query_path, "aviator")
    write_frame(aviator_path, "aviator")
    write_frame(square_path, "square")
    duplicate_a = product("same-model-a", aviator_path, "Aviator", 58, 42)
    duplicate_b = product("same-model-b", aviator_path, "Aviator", 58, 42)
    duplicate_a["model"] = "VC S11320"
    duplicate_b["model"] = "VC S11320"

    matches = lenskart_matcher.match_products(
        query_path,
        [
            duplicate_a,
            duplicate_b,
            product("vc-square", square_path, "Square", 58, 42),
        ],
        {"a_size": 58, "b_size": 42.4, "dbl": 15.6, "shape": "Aviator", "frame_type": "Full Rim"},
        top_k=3,
        use_vlm=False,
    )

    assert [match["model"] for match in matches] == ["VC S11320", "vc-square"]


def test_lenskart_matcher_payload_exposes_new_page_and_cache_contract() -> None:
    payload = server.lenskart_matcher_payload("VC S19003")
    project_payload = server.project_payload("VC S19003")

    assert payload["modelId"] == "VC S19003"
    assert project_payload["lenskartMatcherUrl"] == "/lenskart-matcher?model=VC%20S19003"
    assert payload["labellerUrl"] == "/labeller?model=VC%20S19003"
    assert payload["cache"]["targetCount"] == 1000
    assert payload["cache"]["title"] == "Metal eyewear"
    assert payload["cache"]["brand"] == "All brands"
    assert payload["cache"]["category"] == "eyewear"
    assert payload["cache"]["materialFocus"] == "metal"
    assert payload["matchUrl"] == "/api/lenskart-matcher/match"
    assert payload["beautyRender"]["fileName"] == "VC_S19003_lenskart_front.jpg"


def test_match_request_decodes_front_view_data_url(tmp_path: Path) -> None:
    image_path = tmp_path / "query.jpg"
    write_frame(image_path, "aviator")
    data_url = "data:image/jpeg;base64," + base64.b64encode(image_path.read_bytes()).decode("ascii")

    decoded = lenskart_matcher.decode_front_view_data_url(data_url, tmp_path / "decoded.jpg")

    assert decoded.exists()
    assert decoded.read_bytes().startswith(b"\xff\xd8")
    assert json.loads(json.dumps({"path": str(decoded)}))["path"].endswith("decoded.jpg")


def test_lenskart_matcher_page_posts_current_front_view_to_local_api() -> None:
    html = Path("eyewear_labeller/static/lenskart-matcher.html").read_text(encoding="utf-8")
    script = Path("eyewear_labeller/static/lenskart-matcher.js").read_text(encoding="utf-8")

    assert 'id="runMatchButton"' in html
    assert 'id="useVlm"' in html
    assert 'src="/static/lenskart-matcher.js' in html
    assert "/api/lenskart-matcher/project" in script
    assert "frontViewDataUrl" in script
    assert "project.matchUrl" in script
    assert "renderMatches(payload.matches ?? [], payload)" in script
