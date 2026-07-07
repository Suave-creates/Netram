# Eyewear Fit — integration export

Portable bundle for plugging **eyewear-fit-api** (REST) and thin clients into other NexS services. Source apps live alongside this folder:

| App | Path | Role |
|-----|------|------|
| eyewear-fit-api | `../eyewear-fit-api` | FastAPI backend |
| eyewear-studio | `../eyewear-studio` | React/Vite UI + client-side risk model |
| Project context | `../PROJECT_CONTEXT.md` | Full architecture reference |

## What's in this folder

```
export/
  README.md
  docker-compose.yml      # API + optional static frontend
  Dockerfile.api
  .env.example
  data/
    Eyewear_Fit_Standard_Guidelines.xlsx
    frame-qc-parameters.csv
  api/
    openapi.yaml            # Endpoint reference (also /docs when running)
  clients/
    javascript/             # @nexs/eyewear-fit-client
    python/                 # eyewear-fit-client (httpx)
  integration/
    EXAMPLES.md
    webhook-stub.md
```

---

## Quick start

```bash
cd export
cp .env.example .env          # add API keys locally only — never commit
docker compose up --build api   # http://127.0.0.1:8000/docs
```

Optional UI (build studio first):

```bash
cd ../eyewear-studio && npm install && npm run build
cd ../export
docker compose --profile frontend up --build
# UI at http://127.0.0.1:5173 — set VITE_FIT_API_URL to API host when rebuilding studio
```

Verify:

```bash
curl -s http://127.0.0.1:8000/health
curl -s -X POST http://127.0.0.1:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"sex":"male","active":"latest"}'
```

---

## Integration patterns

### 1. Call API from another microservice

Point your service at the running API (`EYEWEAR_FIT_API_URL`). Use the language client or raw HTTP.

**JavaScript / Node (ESM)**

```bash
# From your repo — copy the client folder or add as a file dependency:
npm install ../export/clients/javascript
```

```javascript
import { createEyewearFitClient } from "@nexs/eyewear-fit-client";

const fit = createEyewearFitClient({
  baseUrl: process.env.EYEWEAR_FIT_API_URL ?? "http://127.0.0.1:8000",
});

const audit = await fit.audit({ sex: "male", active: "latest" });
const sheets = await fit.compareSheets({ sex: "female", active: "latest" });
```

**Python**

```bash
pip install ./export/clients/python
# or: pip install httpx && copy eyewear_fit_client.py into your package
```

```python
from eyewear_fit_client import EyewearFitClient

with EyewearFitClient("http://eyewear-fit-api:8000") as client:
    audit = client.audit(sex="male", active="latest")
    refresh = client.refresh_latest()
```

See `integration/EXAMPLES.md` for curl and every endpoint.

### 2. Embed React components (eyewear-studio)

The export does **not** vendor the UI. Import or copy from `../eyewear-studio/src/`:

| Feature | Components / modules |
|---------|----------------------|
| Guidelines side-by-side | `GuidelineSheets.jsx`, `guidelines.js`, `sheetPopulationMap.js` |
| Latest refresh panel | `LatestDataRefresh.jsx`, `latestDataCompare.js` |
| Return-risk learning | `LlmTraining.jsx`, `llmTraining.js` |
| Root shell / tabs | `App.jsx` |

Configure the studio to call your deployed API:

```bash
# eyewear-studio/.env
VITE_FIT_API_URL=https://your-api-host.example.com
```

Studio uses the API for `POST /api/guidelines/refresh-latest` and `POST /api/llm/chat` only; guidelines XLSX and training CSV load from `/public` (copies also in `export/data/`).

### 3. Batch return-risk scoring (API-only consumers)

**Batch scoring is not a REST endpoint.** The model (`learnFromRows`, `scoreBatchRows`, `validateInput`) runs in:

- `../eyewear-studio/src/llmTraining.js`
- Training data: `export/data/frame-qc-parameters.csv`

**Recommended approaches:**

1. **Import `llmTraining.js`** in your Node/browser bundler and score locally; optionally call `fit.llmChat()` for LLM-enhanced reasons.
2. **Use eyewear-studio** batch tab against your API for LLM enhance only.
3. **Port the JS module** to Python if you need server-side scoring (not included in this export).

After local scoring, enhance narratives:

```javascript
await fit.llmChat({
  sex: "male",
  active: "latest",
  message: "Frame width 131mm, temple 135mm — 2 sizing tips to cut returns",
  history: [],
});
```

---

## API surface

| Method | Path | Client method |
|--------|------|---------------|
| GET | `/health` | `health()` |
| GET | `/api/guidelines` | `getGuidelines()` |
| GET | `/api/guidelines/face-data/latest` | `getLatestFaceData()` |
| GET | `/api/guidelines/face-data/baseline` | `getBaselineFaceData()` |
| POST | `/api/guidelines/refresh-latest` | `refreshLatest()` |
| POST | `/api/audit` | `audit()` |
| POST | `/api/sheets/compare` | `compareSheets()` |
| POST | `/api/sample/upload` | `uploadSample()` |
| POST | `/api/llm/chat` | `llmChat()` |
| POST | `/api/llm/audit-report` | `llmAuditReport()` |
| POST | `/api/llm/audit-report/stream` | `llmAuditReportStream()` |

Full OpenAPI: `api/openapi.yaml`. Interactive docs: `http://127.0.0.1:8000/docs`.

---

## Environment

Copy `export/.env.example` → `.env`. Keys stay on the **API container** only:

- `OPENAI_API_KEY` — `/api/llm/*`
- `ANTHROPIC_API_KEY` — preferred for `/api/guidelines/refresh-latest`
- `GUIDELINES_PATH` — defaults to mounted `./data/Eyewear_Fit_Standard_Guidelines.xlsx`

Consumers set `EYEWEAR_FIT_API_URL` (or `VITE_FIT_API_URL` in Vite apps).

---

## Copy vs reference

- **Copy** this `export/` folder into another monorepo, or mount it in CI.
- **Data** files are **copies** (not symlinks) under `data/` for portable deploys.
- **API image** builds from `../eyewear-fit-api` via `Dockerfile.api`; update source there and rebuild.

---

## Related docs

- `../PROJECT_CONTEXT.md` — architecture, face metrics, risk model details
- `integration/EXAMPLES.md` — curl / JS / Python per feature
- `integration/webhook-stub.md` — async wrapper for slow endpoints
