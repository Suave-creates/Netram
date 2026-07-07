from __future__ import annotations

import argparse
import base64
import json
import random
import re
import ssl
import tempfile
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np
from PIL import Image


PROJECT_DIR = Path(__file__).resolve().parent.parent
CACHE_ROOT = PROJECT_DIR / "data" / "lenskart_cache"

ALGOLIA_APP_ID = "CCONZUESNX"
ALGOLIA_API_KEY = "cda35e5c76194e11f05b93e48b1aa02b"
ALGOLIA_INDEX = "prod_product_model_index_for_qs_IN"
TARGET_BRAND = "Vincent Chase"
TARGET_CATEGORY = "sunglasses"
TARGET_SHAPE = "Aviator"
TARGET_FRAME_TYPE = "Full Rim"
TARGET_MATERIAL = "Stainless Steel"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
EYEWEAR_CATEGORIES = {"eyeframe", "sunglasses"}
METAL_MATERIAL_TERMS = ("metal", "stainless steel", "steel", "titanium", "alloy", "aluminium", "aluminum")


@dataclass(frozen=True)
class DatasetConfig:
    key: str
    slug: str
    title: str
    queries: tuple[str, ...]
    sample_size: int
    sample_seed: int
    brand: str
    category: str
    material_focus: str | None = None
    max_pages_per_query: int = 10
    hits_per_page: int = 100


VINCENT_CHASE_SUNGLASSES_DATASET = DatasetConfig(
    key="vincent-chase-sunglasses-50",
    slug="vincent_chase_sunglasses_50",
    title="Vincent Chase sunglasses",
    queries=("VC S",),
    sample_size=50,
    sample_seed=19003,
    brand=TARGET_BRAND,
    category=TARGET_CATEGORY,
    max_pages_per_query=10,
)
METAL_EYEWEAR_DATASET = DatasetConfig(
    key="metal-eyewear-1000",
    slug="metal_eyewear_1000",
    title="Metal eyewear",
    queries=("VC E", "VC S", "JJ E", "JJ S", "Titanium"),
    sample_size=1000,
    sample_seed=190031000,
    brand="All brands",
    category="eyewear",
    material_focus="metal",
    max_pages_per_query=20,
)
DEFAULT_DATASET = METAL_EYEWEAR_DATASET
DATASETS = {
    VINCENT_CHASE_SUNGLASSES_DATASET.key: VINCENT_CHASE_SUNGLASSES_DATASET,
    "vc50": VINCENT_CHASE_SUNGLASSES_DATASET,
    METAL_EYEWEAR_DATASET.key: METAL_EYEWEAR_DATASET,
    "metal": METAL_EYEWEAR_DATASET,
}
DEFAULT_SAMPLE_SIZE = DEFAULT_DATASET.sample_size
DEFAULT_SAMPLE_SEED = DEFAULT_DATASET.sample_seed
ALGOLIA_QUERY = DEFAULT_DATASET.queries[0]
CACHE_SLUG = DEFAULT_DATASET.slug
CACHE_DIR = CACHE_ROOT / CACHE_SLUG
RAW_DIR = CACHE_DIR / "raw"
IMAGE_DIR = CACHE_DIR / "images"
PRODUCTS_PATH = CACHE_DIR / "products.json"
SUMMARY_PATH = CACHE_DIR / "summary.json"
_FEATURE_CACHE: dict[str, ImageFeatures] = {}


@dataclass(frozen=True)
class ImageFeatures:
    vector: np.ndarray
    aspect: float
    fill_ratio: float
    width_ratio: float
    height_ratio: float
    center_y: float


def deterministic_sample(
    candidates: Iterable[dict],
    sample_size: int | None = None,
    seed: int | None = None,
    dataset: DatasetConfig | str | None = DEFAULT_DATASET,
) -> list[dict]:
    dataset = resolve_dataset(dataset)
    sample_size = dataset.sample_size if sample_size is None else sample_size
    seed = dataset.sample_seed if seed is None else seed
    eligible = [
        item for item in candidates
        if is_dataset_product(item, dataset) and item.get("image_front_url")
    ]
    by_id = {str(item["product_id"]): item for item in eligible if item.get("product_id")}
    ordered = [by_id[key] for key in sorted(by_id)]
    rng = random.Random(seed)
    rng.shuffle(ordered)
    return ordered[:sample_size]


def resolve_dataset(dataset: DatasetConfig | str | None = None) -> DatasetConfig:
    if dataset is None:
        return DEFAULT_DATASET
    if isinstance(dataset, DatasetConfig):
        return dataset
    key = str(dataset).strip().lower().replace("_", "-")
    if key in DATASETS:
        return DATASETS[key]
    raise ValueError(f"Unknown Lenskart matcher dataset: {dataset}")


def dataset_cache_dir(dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> Path:
    return CACHE_ROOT / resolve_dataset(dataset).slug


def dataset_raw_dir(dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> Path:
    return dataset_cache_dir(dataset) / "raw"


def dataset_image_dir(dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> Path:
    return dataset_cache_dir(dataset) / "images"


def dataset_products_path(dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> Path:
    return dataset_cache_dir(dataset) / "products.json"


def dataset_summary_path(dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> Path:
    return dataset_cache_dir(dataset) / "summary.json"


def is_dataset_product(item: dict, dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> bool:
    dataset = resolve_dataset(dataset)
    category = product_category(item)
    brand = str(item.get("brand") or item.get("brand_name") or "").lower()
    if dataset.brand != "All brands" and not brand.startswith(dataset.brand.lower()):
        return False
    if dataset.category == "eyewear":
        if category not in EYEWEAR_CATEGORIES:
            return False
    elif category != dataset.category:
        return False
    if dataset.material_focus == "metal" and not is_metal_eyewear(item):
        return False
    return True


def is_vincent_chase_sunglasses(item: dict) -> bool:
    return is_dataset_product(item, VINCENT_CHASE_SUNGLASSES_DATASET)


def is_metal_eyewear(item: dict) -> bool:
    return product_category(item) in EYEWEAR_CATEGORIES and is_metal_material(item.get("material") or item.get("frame_material"))


def product_category(item: dict) -> str:
    category = clean_text(item.get("category") or item.get("classification") or item.get("product_type")).lower()
    if category in {"eyeglasses", "computer glasses", "computer eyeglasses"}:
        return "eyeframe"
    return category


def is_metal_material(value: object) -> bool:
    text = clean_text(value).lower().replace("-", " ")
    if "non metal" in text or "nonmetal" in text:
        return False
    return any(term in text for term in METAL_MATERIAL_TERMS)


def ensure_cache(
    sample_size: int | None = None,
    refresh: bool = False,
    dataset: DatasetConfig | str | None = DEFAULT_DATASET,
) -> dict:
    dataset = resolve_dataset(dataset)
    sample_size = dataset.sample_size if sample_size is None else sample_size
    products_path = dataset_products_path(dataset)
    if not refresh and products_path.exists():
        products = load_cached_products(dataset=dataset)
        if len(products) >= sample_size:
            return cache_status(dataset)

    cache_dir = dataset_cache_dir(dataset)
    raw_dir = dataset_raw_dir(dataset)
    image_dir = dataset_image_dir(dataset)
    cache_dir.mkdir(parents=True, exist_ok=True)
    raw_dir.mkdir(parents=True, exist_ok=True)
    image_dir.mkdir(parents=True, exist_ok=True)

    raw_pages = fetch_algolia_pages(dataset=dataset)
    candidates = []
    for page in raw_pages:
        for hit in page.get("hits", []):
            product = normalize_algolia_hit(hit)
            if product:
                candidates.append(product)

    eligible = deterministic_sample(candidates, sample_size=10_000_000, dataset=dataset)
    if len(eligible) < sample_size:
        raise RuntimeError(f"Only found {len(eligible)} {dataset.title} products; expected {sample_size}")
    selected = eligible[:min(len(eligible), sample_size + max(50, sample_size // 10))]

    ordered_products: list[dict | None] = [None] * len(selected)
    failures = []
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {
            pool.submit(cache_product_image, index, product, dataset): index
            for index, product in enumerate(selected)
        }
        for future in as_completed(futures):
            try:
                index, product = future.result()
                ordered_products[index] = product
            except Exception as error:  # pragma: no cover - network-dependent cache build detail
                product = selected[futures[future]]
                failures.append({"product_id": product.get("product_id"), "error": str(error)})

    products = [product for product in ordered_products if product is not None][:sample_size]
    if len(products) < sample_size:
        raise RuntimeError(f"Cached {len(products)} products; expected {sample_size}. Failures: {failures[:3]}")

    products_path.write_text(json.dumps(products, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    dataset_summary_path(dataset).write_text(json.dumps({
        "title": dataset.title,
        "brand": dataset.brand,
        "category": dataset.category,
        "materialFocus": dataset.material_focus,
        "sampleSize": sample_size,
        "sampleSeed": dataset.sample_seed,
        "products": len(products),
        "rawPages": len(raw_pages),
        "queries": list(dataset.queries),
        "failures": failures,
        "source": "Lenskart Algolia product index",
    }, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return cache_status(dataset)


def cache_product_image(index: int, product: dict, dataset: DatasetConfig) -> tuple[int, dict]:
    product = dict(product)
    local_path = download_product_image(product, dataset=dataset)
    product["local_image"] = str(local_path.relative_to(dataset_cache_dir(dataset)))
    product["local_image_url"] = f"/lenskart-cache/{dataset.slug}/{product['local_image']}"
    return index, product


def fetch_algolia_pages(
    max_pages: int | None = None,
    hits_per_page: int | None = None,
    dataset: DatasetConfig | str | None = DEFAULT_DATASET,
) -> list[dict]:
    dataset = resolve_dataset(dataset)
    max_pages = dataset.max_pages_per_query if max_pages is None else max_pages
    hits_per_page = dataset.hits_per_page if hits_per_page is None else hits_per_page
    url = f"https://{ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/{ALGOLIA_INDEX}/query"
    context = ssl._create_unverified_context()
    pages = []
    raw_dir = dataset_raw_dir(dataset)
    raw_dir.mkdir(parents=True, exist_ok=True)
    for query_index, query in enumerate(dataset.queries):
        safe_query = re.sub(r"[^a-z0-9]+", "_", query.lower()).strip("_")
        for page in range(max_pages):
            payload = json.dumps({
                "query": query,
                "hitsPerPage": hits_per_page,
                "page": page,
            }).encode("utf-8")
            request = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": USER_AGENT,
                    "x-algolia-application-id": ALGOLIA_APP_ID,
                    "x-algolia-api-key": ALGOLIA_API_KEY,
                },
                method="POST",
            )
            with urllib.request.urlopen(request, context=context, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
            data["_lenskart_query"] = query
            pages.append(data)
            (raw_dir / f"algolia_{query_index:02d}_{safe_query}_page_{page:02d}.json").write_text(
                json.dumps(data, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
            )
            if not data.get("hits") or page + 1 >= int(data.get("nbPages") or 0):
                break
    return pages


def normalize_algolia_hit(hit: dict) -> dict | None:
    product_id = str(hit.get("productId") or hit.get("objectID") or "").strip()
    image_url = hit.get("imageUrl") or hit.get("thumbnailUrl")
    if not product_id or not image_url:
        return None

    product_url = str(hit.get("webUrl") or "")
    if product_url and not product_url.startswith("http"):
        product_url = f"https://www.lenskart.com/{product_url.lstrip('/')}"

    frame_size = parse_frame_size(hit.get("frameSizeSpecification"))
    return {
        "product_id": product_id,
        "model": clean_text(hit.get("model_name") or hit.get("modelName") or hit.get("product_name") or product_id),
        "brand": clean_text(hit.get("brand_name") or hit.get("brandName") or ""),
        "category": clean_text(hit.get("classification") or hit.get("product_type") or ""),
        "shape": clean_text(hit.get("frame_shape") or infer_shape(hit.get("searchProductName") or hit.get("product_name") or "")),
        "frame_type": clean_text(hit.get("frame_type") or hit.get("frameTypeKey") or ""),
        "material": clean_text(hit.get("frame_material") or hit.get("material") or ""),
        "frame_color": clean_text(hit.get("frame_color") or hit.get("color") or ""),
        "glass_color": clean_text(hit.get("glass_color") or hit.get("tint_color") or ""),
        "frame_size": clean_text(hit.get("frame_size") or hit.get("size") or ""),
        "a_size": frame_size.get("a_size"),
        "b_size": parse_number(hit.get("b_size") or hit.get("Frame Height_2")),
        "dbl": frame_size.get("dbl"),
        "temple_length": frame_size.get("temple_length"),
        "product_url": product_url,
        "image_front_url": str(image_url),
        "raw_object_id": hit.get("objectID"),
    }


def parse_frame_size(value: object) -> dict:
    parts = [float(part) for part in re.findall(r"\d+(?:\.\d+)?", str(value or ""))]
    return {
        "a_size": parts[0] if len(parts) >= 1 else None,
        "dbl": parts[1] if len(parts) >= 2 else None,
        "temple_length": parts[2] if len(parts) >= 3 else None,
    }


def parse_number(value: object) -> float | None:
    match = re.search(r"\d+(?:\.\d+)?", str(value or ""))
    return float(match.group(0)) if match else None


def infer_shape(text: object) -> str:
    lowered = str(text or "").lower()
    for shape in ["aviator", "geometric", "clubmaster", "cat eye", "rectangle", "square", "round", "oval", "wayfarer"]:
        if shape in lowered:
            return shape.title()
    return ""


def clean_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def download_product_image(product: dict, dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> Path:
    dataset = resolve_dataset(dataset)
    image_url = str(product["image_front_url"])
    suffix = Path(image_url.split("?", 1)[0]).suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        suffix = ".jpg"
    image_dir = dataset_image_dir(dataset)
    image_dir.mkdir(parents=True, exist_ok=True)
    out_path = image_dir / f"{product['product_id']}{suffix}"
    if out_path.exists() and out_path.stat().st_size > 1000:
        return out_path

    context = ssl._create_unverified_context()
    request = urllib.request.Request(image_url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, context=context, timeout=30) as response:
        out_path.write_bytes(response.read())
    return out_path


def cache_status(dataset: DatasetConfig | str | None = DEFAULT_DATASET) -> dict:
    dataset = resolve_dataset(dataset)
    products_path = dataset_products_path(dataset)
    products = load_cached_products(required=False, dataset=dataset)
    return {
        "slug": dataset.slug,
        "title": dataset.title,
        "path": str(dataset_cache_dir(dataset)),
        "productsPath": str(products_path),
        "exists": products_path.exists(),
        "count": len(products),
        "targetCount": dataset.sample_size,
        "brand": dataset.brand,
        "category": dataset.category,
        "materialFocus": dataset.material_focus,
        "source": "Lenskart Algolia product index",
    }


def load_cached_products(
    required: bool = True,
    dataset: DatasetConfig | str | None = DEFAULT_DATASET,
) -> list[dict]:
    dataset = resolve_dataset(dataset)
    products_path = dataset_products_path(dataset)
    cache_dir = dataset_cache_dir(dataset)
    if not products_path.exists():
        if required:
            ensure_cache(dataset=dataset)
        else:
            return []
    products = json.loads(products_path.read_text(encoding="utf-8"))
    for product in products:
        local_image = Path(product.get("local_image", ""))
        if not local_image.is_absolute():
            product["local_image"] = str(cache_dir / local_image)
        product.setdefault("local_image_url", f"/lenskart-cache/{dataset.slug}/images/{product['product_id']}.jpg")
    return products


def decode_front_view_data_url(data_url: str, out_path: str | Path) -> Path:
    if not data_url.startswith("data:image/"):
        raise ValueError("frontViewDataUrl must be an image data URL")
    try:
        _prefix, encoded = data_url.split(",", 1)
    except ValueError as error:
        raise ValueError("frontViewDataUrl is missing base64 data") from error
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(base64.b64decode(encoded))
    return out_path


def image_features(path: str | Path) -> ImageFeatures:
    image = Image.open(path).convert("RGB").resize((220, 140))
    arr = np.asarray(image).astype(np.float32)
    corner_pixels = np.concatenate([
        arr[:10, :10].reshape(-1, 3),
        arr[:10, -10:].reshape(-1, 3),
        arr[-10:, :10].reshape(-1, 3),
        arr[-10:, -10:].reshape(-1, 3),
    ])
    background = np.median(corner_pixels, axis=0)
    distance = np.linalg.norm(arr - background, axis=2)
    mask = distance > max(28.0, float(np.std(corner_pixels)) * 2.0)
    if mask.mean() < 0.01:
        gray = np.asarray(image.convert("L")).astype(np.float32)
        mask = gray < np.percentile(gray, 35)
    if mask.mean() > 0.75:
        gray = np.asarray(image.convert("L")).astype(np.float32)
        mask = gray < np.percentile(gray, 65)

    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise ValueError(f"Could not extract visible frame from {path}")
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    crop = mask[y0:y1, x0:x1]
    vector_image = Image.fromarray((crop.astype(np.uint8) * 255), mode="L").resize((64, 40), Image.Resampling.NEAREST)
    vector = (np.asarray(vector_image) > 0).astype(np.float32).reshape(-1)
    bbox_width = max(1, x1 - x0)
    bbox_height = max(1, y1 - y0)
    return ImageFeatures(
        vector=vector,
        aspect=bbox_width / bbox_height,
        fill_ratio=float(crop.mean()),
        width_ratio=bbox_width / mask.shape[1],
        height_ratio=bbox_height / mask.shape[0],
        center_y=((y0 + y1) / 2) / mask.shape[0],
    )


def cached_image_features(path: str | Path) -> ImageFeatures:
    path = Path(path)
    stat = path.stat()
    key = f"{path}:{stat.st_mtime_ns}:{stat.st_size}"
    if key not in _FEATURE_CACHE:
        _FEATURE_CACHE[key] = image_features(path)
    return _FEATURE_CACHE[key]


def visual_score(query: ImageFeatures, candidate: ImageFeatures) -> float:
    intersection = float(np.minimum(query.vector, candidate.vector).sum())
    union = float(np.maximum(query.vector, candidate.vector).sum()) or 1.0
    iou = intersection / union
    metric_delta = (
        min(abs(query.aspect - candidate.aspect) / 1.2, 1.0) +
        min(abs(query.fill_ratio - candidate.fill_ratio) / 0.35, 1.0) +
        min(abs(query.width_ratio - candidate.width_ratio) / 0.45, 1.0) +
        min(abs(query.height_ratio - candidate.height_ratio) / 0.45, 1.0) +
        min(abs(query.center_y - candidate.center_y) / 0.3, 1.0)
    ) / 5
    return clamp_score((iou * 70.0) + ((1.0 - metric_delta) * 30.0))


def shape_score(target_shape: str | None, candidate_shape: str | None) -> float:
    target = normalize_shape(target_shape or TARGET_SHAPE)
    candidate = normalize_shape(candidate_shape or "")
    if not candidate:
        return 70.0
    if target == candidate:
        return 100.0
    compatible = {
        "aviator": {"geometric": 88.0, "square": 76.0, "rectangle": 70.0, "clubmaster": 68.0},
        "geometric": {"aviator": 88.0, "square": 82.0, "rectangle": 74.0},
        "square": {"rectangle": 82.0, "geometric": 78.0, "aviator": 76.0},
    }
    return compatible.get(target, {}).get(candidate, 45.0)


def normalize_shape(value: str) -> str:
    return str(value or "").strip().lower().replace("-", " ")


def dimension_score(query_dims: dict, product: dict) -> float:
    scores = []
    for key, tolerance in [("a_size", 5.0), ("b_size", 5.0), ("dbl", 4.0)]:
        query_value = query_dims.get(key)
        candidate_value = product.get(key)
        if query_value is None or candidate_value is None:
            scores.append(72.0)
            continue
        scores.append(clamp_score(100.0 * (1.0 - abs(float(query_value) - float(candidate_value)) / tolerance)))
    return float(sum(scores) / len(scores))


def exact_text_score(target: str | None, candidate: str | None, neutral: float = 72.0) -> float:
    if not target or not candidate:
        return neutral
    return 100.0 if clean_text(target).lower() == clean_text(candidate).lower() else 55.0


def match_products(
    query_image: str | Path,
    products: list[dict],
    query_metadata: dict,
    top_k: int = 5,
    use_vlm: bool = True,
) -> list[dict]:
    query = image_features(query_image)

    def score_product(product: dict) -> dict:
        try:
            candidate = cached_image_features(product["local_image"])
            visual = visual_score(query, candidate)
        except Exception:
            visual = 40.0
        shape = shape_score(query_metadata.get("shape"), product.get("shape"))
        dimensions = dimension_score(query_metadata, product)
        frame_type = exact_text_score(query_metadata.get("frame_type", TARGET_FRAME_TYPE), product.get("frame_type"))
        material = exact_text_score(query_metadata.get("material", TARGET_MATERIAL), product.get("material"), neutral=75.0)
        base_score = (
            visual * 0.55 +
            shape * 0.20 +
            dimensions * 0.15 +
            frame_type * 0.05 +
            material * 0.05
        )
        return {
            **public_product_fields(product),
            "similarity": round(clamp_score(base_score), 2),
            "base_similarity": round(clamp_score(base_score), 2),
            "visual_score": round(visual, 2),
            "shape_score": round(shape, 2),
            "dimension_score": round(dimensions, 2),
            "frame_type_score": round(frame_type, 2),
            "material_score": round(material, 2),
            "vlm_adjustment": 0.0,
            "vlm_note": "",
            "reason": match_reason(product, visual, shape, dimensions),
        }

    if len(products) > 24:
        with ThreadPoolExecutor(max_workers=12) as pool:
            matches = list(pool.map(score_product, products))
    else:
        matches = [score_product(product) for product in products]
    matches.sort(key=lambda item: item["similarity"], reverse=True)
    if use_vlm:
        matches = apply_ollama_tie_breaker(query_image, matches)
    return distinct_frame_matches(matches)[:top_k]


def distinct_frame_matches(matches: list[dict]) -> list[dict]:
    seen = set()
    distinct = []
    for match in matches:
        key = normalize_model_key(match.get("model") or match.get("product_id"))
        if key in seen:
            continue
        seen.add(key)
        distinct.append(match)
    return distinct


def normalize_model_key(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def public_product_fields(product: dict) -> dict:
    return {
        "product_id": product.get("product_id"),
        "model": product.get("model"),
        "brand": product.get("brand"),
        "category": product.get("category"),
        "shape": product.get("shape"),
        "frame_type": product.get("frame_type"),
        "material": product.get("material"),
        "frame_color": product.get("frame_color"),
        "glass_color": product.get("glass_color"),
        "frame_size": product.get("frame_size"),
        "a_size": product.get("a_size"),
        "b_size": product.get("b_size"),
        "dbl": product.get("dbl"),
        "product_url": product.get("product_url"),
        "image_front": product.get("local_image_url") or product.get("image_front_url"),
        "image_front_url": product.get("image_front_url"),
    }


def match_reason(product: dict, visual: float, shape: float, dimensions: float) -> str:
    parts = [
        f"Visual silhouette {visual:.0f}",
        f"Shape {product.get('shape') or 'unknown'} {shape:.0f}",
        f"Dimensions {dimensions:.0f}",
    ]
    if product.get("frame_type"):
        parts.append(str(product["frame_type"]))
    if product.get("material"):
        parts.append(str(product["material"]))
    return " / ".join(parts)


def apply_ollama_tie_breaker(query_image: str | Path, matches: list[dict], threshold: float = 4.0) -> list[dict]:
    top_group = [item for item in matches if matches and matches[0]["similarity"] - item["similarity"] <= threshold]
    if len(top_group) < 2:
        return matches
    note = ollama_status_note()
    if note:
        for item in top_group:
            item["vlm_note"] = note
        return matches
    # The deterministic matcher remains authoritative unless an explicit local VLM
    # integration is available. This hook keeps response shape stable.
    for item in top_group:
        item["vlm_note"] = "Ollama tie-breaker available; deterministic rank retained."
    return matches


def ollama_status_note() -> str:
    try:
        with urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=1.5) as response:
            payload = json.loads(response.read().decode("utf-8"))
        models = [item.get("name", "") for item in payload.get("models", [])]
        if not models:
            return "Ollama is running but no local VLM model is listed."
        if not any(any(token in model.lower() for token in ["llava", "vision", "qwen2.5vl", "gemma3"]) for model in models):
            return "Ollama is running, but no obvious VLM model was found."
        return ""
    except (OSError, urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return "Ollama VLM tie-breaker unavailable; deterministic rank retained."


def match_front_view_data_url(payload: dict) -> dict:
    dataset = resolve_dataset(payload.get("dataset"))
    ensure_cache(dataset=dataset)
    with tempfile.TemporaryDirectory(prefix="lenskart-query-") as tmp_dir:
        image_path = decode_front_view_data_url(payload["frontViewDataUrl"], Path(tmp_dir) / "front-view.jpg")
        matches = match_products(
            image_path,
            load_cached_products(dataset=dataset),
            payload.get("metadata", {}),
            top_k=int(payload.get("topK") or 5),
            use_vlm=bool(payload.get("useVlm", True)),
        )
    return {
        "engine_version": "lenskart_hybrid_v1",
        "dataset": cache_status(dataset),
        "scoring_formula": "55% visual + 20% shape + 15% dimensions + 5% frame type + 5% material; Ollama VLM only annotates close ties when available",
        "matches": matches,
    }


def clamp_score(value: float) -> float:
    return float(max(0.0, min(100.0, value)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Build or inspect the Lenskart matcher cache.")
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--sample-size", type=int)
    parser.add_argument("--dataset", default=DEFAULT_DATASET.key)
    args = parser.parse_args()
    dataset = resolve_dataset(args.dataset)
    print(json.dumps(ensure_cache(sample_size=args.sample_size, refresh=args.refresh, dataset=dataset), indent=2))


if __name__ == "__main__":
    main()
