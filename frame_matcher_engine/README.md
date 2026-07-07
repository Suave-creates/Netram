# Frame Matcher Engine - v_2

## Purpose
Compare a newly imagined frame against the Lenskart portfolio using lens-opening geometry.

## Approved scoring formula

Final Similarity = 80% Lens Opening Geometry + 20% A/B/DBL Proportions

Shape family is used as a filter/explanation, not as a final-score component. Material compatibility is removed. Colour is ignored. Category filter is supported.

## Inputs from web app / AI design system

1. `beauty_render.jpg` - generated frame front image for display only.
2. `lens_mask.png` - binary lens-opening mask used for matching.
   - white = lens opening
   - black = everything else
3. Optional dimensions: `a_size`, `b_size`, `dbl`.
4. Portfolio Excel with `product_id`, `image_front`, category and dimension fields.

## Output
The API returns JSON containing:
- Top matching PIDs
- Similarity %
- Geometry score
- Fourier score
- Hu score
- Curvature score
- Hausdorff score
- A/B/DBL score
- Product image URL
- Product page URL
- Optional overlay image path

## API

### Build portfolio index

```bash
curl -X POST http://localhost:8000/build-index \
  -F "excel_path=/path/to/PIDs with attributes and returns.xlsx" \
  -F "out_dir=/path/to/index" \
  -F "category=sunglasses" \
  -F "max_rows=1000"
```

### Match new design, JSON only

```bash
curl -X POST http://localhost:8000/match \
  -F "index_path=/path/to/index/portfolio_index.pkl" \
  -F "lens_mask=@lens_mask.png" \
  -F "a_size=55" \
  -F "b_size=41" \
  -F "dbl=18" \
  -F "top_k=10"
```

### Match new design with optional overlay generation

```bash
curl -X POST http://localhost:8000/match \
  -F "index_path=/path/to/index/portfolio_index.pkl" \
  -F "lens_mask=@lens_mask.png" \
  -F "a_size=55" \
  -F "b_size=41" \
  -F "dbl=18" \
  -F "top_k=10" \
  -F "generate_overlay=true" \
  -F "overlay_dir=/path/to/web/static/overlays"
```

## Sample JSON response

```json
{
  "engine_version": "v_2",
  "scoring_formula": "80% lens geometry + 20% A/B/DBL",
  "top_k": 10,
  "overlay_generation": "enabled",
  "matches": [
    {
      "product_id": "241109",
      "model": "VC S19018",
      "category": "sunglasses",
      "shape_family": "Oval",
      "similarity": 94.2,
      "geometry_score": 95.3,
      "fourier_score": 96.1,
      "hu_score": 94.8,
      "curvature_score": 92.7,
      "hausdorff_score": 96.4,
      "a_score": 100.0,
      "b_score": 97.5,
      "dbl_score": 100.0,
      "proportion_score": 99.2,
      "image_front": "https://.../front.jpg",
      "product_url": "https://www.lenskart.com/...",
      "overlay_image": "/path/to/web/static/overlays/query_vs_241109.png"
    }
  ]
}
```

## Note on optional image generation
Overlay generation is optional. The matching engine works without it. It can be removed later without changing the core similarity logic or JSON structure, except that `overlay_image` will remain `null`.
