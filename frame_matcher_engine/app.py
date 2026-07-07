from __future__ import annotations

from pathlib import Path
import tempfile
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from frame_matcher.indexer import build_index, match_mask

MATCHER_UI_URL = "http://127.0.0.1:8766/matcher?model=VC%20S19003"

app = FastAPI(title="Lenskart Frame Similarity Engine", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(127\.0\.0\.1|localhost):\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/match")
def match_browser_help():
    return {
        "detail": f"The matcher runs from the UI. Open {MATCHER_UI_URL} and use Run match.",
        "method": "POST",
        "ui": MATCHER_UI_URL,
    }

@app.post("/build-index")
def api_build_index(
    excel_path: str = Form(...),
    out_dir: str = Form("/tmp/frame_matcher_index"),
    category: str | None = Form(None),
    max_rows: int | None = Form(None),
):
    return build_index(excel_path, out_dir, category=category, max_rows=max_rows)

@app.post("/match")
async def api_match(
    index_path: str = Form(...),
    lens_mask: UploadFile = File(...),
    a_size: float | None = Form(None),
    b_size: float | None = Form(None),
    dbl: float | None = Form(None),
    top_k: int = Form(10),
    generate_overlay: bool = Form(False),
    overlay_dir: str | None = Form(None),
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as f:
        f.write(await lens_mask.read())
        mask_path = f.name
    try:
        results = match_mask(index_path, mask_path, {"a_size": a_size, "b_size": b_size, "dbl": dbl}, top_k=top_k, generate_overlay=generate_overlay, overlay_dir=overlay_dir)
        return {"engine_version": "v_2", "scoring_formula": "80% lens geometry + 20% A/B/DBL", "top_k": top_k, "overlay_generation": "enabled" if generate_overlay else "disabled", "matches": results}
    finally:
        Path(mask_path).unlink(missing_ok=True)
