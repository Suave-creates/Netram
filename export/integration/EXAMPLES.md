# Integration examples — eyewear-fit-api

Base URL: `http://127.0.0.1:8000` (or `EYEWEAR_FIT_API_URL` / `VITE_FIT_API_URL`).

Shared training CSV for return-risk: `../data/frame-qc-parameters.csv` (624 rows).

---

## Health

```bash
curl -s http://127.0.0.1:8000/health | python3 -m json.tool
```

```javascript
import { eyewearFit } from "@nexs/eyewear-fit-client";
const h = await eyewearFit.health();
```

```python
from eyewear_fit_client import EyewearFitClient

with EyewearFitClient() as client:
    print(client.health())
```

---

## Guidelines & face data

```bash
curl -s http://127.0.0.1:8000/api/guidelines | python3 -m json.tool
curl -s http://127.0.0.1:8000/api/guidelines/face-data/latest | python3 -m json.tool
```

```javascript
const guidelines = await eyewearFit.getGuidelines();
const latest = await eyewearFit.getLatestFaceData();
```

```python
with EyewearFitClient() as client:
    guidelines = client.get_guidelines()
    latest = client.get_latest_face_data()
```

---

## Refresh latest anthropometry

Server uses `ANTHROPIC_API_KEY` (preferred) → `OPENAI_API_KEY` → demo fallback.

```bash
curl -s -X POST http://127.0.0.1:8000/api/guidelines/refresh-latest | python3 -m json.tool
```

```javascript
const refresh = await eyewearFit.refreshLatest();
// refresh.meta.source === "api" | "demo"
```

```python
with EyewearFitClient() as client:
    refresh = client.refresh_latest()
```

---

## Audit (rule-based fit gaps)

```bash
curl -s -X POST http://127.0.0.1:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"sex":"male","active":"latest"}' | python3 -m json.tool
```

```javascript
const audit = await eyewearFit.audit({ sex: "male", active: "latest" });
```

```python
with EyewearFitClient() as client:
    audit = client.audit(sex="male", active="latest")
```

---

## Side-by-side sheet compare

```bash
curl -s -X POST http://127.0.0.1:8000/api/sheets/compare \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","active":"baseline"}' | python3 -m json.tool
```

```javascript
const sheets = await eyewearFit.compareSheets({ sex: "female", active: "baseline" });
```

```python
with EyewearFitClient() as client:
    sheets = client.compare_sheets(sex="female", active="baseline")
```

---

## Sample face upload

```bash
curl -s -X POST http://127.0.0.1:8000/api/sample/upload \
  -F "file=@../eyewear-studio/public/faces/sample.csv"
```

```javascript
import { readFileSync } from "node:fs";
const blob = new Blob([readFileSync("sample.csv")]);
await eyewearFit.uploadSample(blob);
```

```python
with EyewearFitClient() as client:
    result = client.upload_sample("../eyewear-studio/public/faces/sample.csv")
```

---

## LLM chat (sizing suggestions)

Requires `OPENAI_API_KEY` on the API for real LLM output; otherwise rule-based stub.

```bash
curl -s -X POST http://127.0.0.1:8000/api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{"sex":"male","active":"latest","message":"Summarize S04 temple gaps for Indian males","history":[]}'
```

```javascript
const chat = await eyewearFit.llmChat({
  sex: "male",
  active: "latest",
  message: "Summarize S04 temple gaps for Indian males",
  history: [],
});
```

```python
with EyewearFitClient() as client:
    chat = client.llm_chat("Summarize S04 temple gaps for Indian males")
```

---

## LLM audit report

```bash
curl -s -X POST http://127.0.0.1:8000/api/llm/audit-report \
  -H "Content-Type: application/json" \
  -d '{"sex":"male","active":"latest","question":"What should change in S06 for head width?"}'
```

```javascript
const report = await eyewearFit.llmAuditReport({
  sex: "male",
  active: "latest",
  question: "What should change in S06 for head width?",
});
```

```python
with EyewearFitClient() as client:
    report = client.llm_audit_report(
        sex="male", active="latest", question="What should change in S06 for head width?"
    )
```

---

## Batch return-risk scoring (client-side only)

The API does **not** expose `learnFromRows` / `scoreBatchRows`. Options:

1. **Browser / Node:** import from `../eyewear-studio/src/llmTraining.js` (Vite/ESM).
2. **Microservice:** run scoring in your service using ported logic; call `/api/llm/chat` for optional LLM reasons (see `enhanceBatchWithLlm` in the same file).
3. **UI only:** use eyewear-studio Return-risk learning tab with `VITE_FIT_API_URL` pointing at this API.

Example validate inputs (after loading `frame-qc-parameters.csv` locally):

| Tier   | W   | H  | A  | Temple | DBL |
|--------|-----|----|----|--------|-----|
| Low    | 137 | 37 | 54 | 145    | 18  |
| Medium | 135 | 47 | 51 | 142    | 19  |
| High   | 131 | 47 | 50 | 135    | 18  |
