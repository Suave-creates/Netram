# Webhook stub — async integration pattern

The eyewear-fit-api is **synchronous REST** today. For long-running jobs (refresh-latest with live search, large batch LLM enhance), wrap it in your orchestrator.

## Pattern

```
Your service                    eyewear-fit-api
     |                                |
     |-- POST /jobs (your API) ------>|  (optional: enqueue)
     |<-- 202 { jobId }               |
     |                                |
     |-- worker: POST refresh-latest ->|
     |<-- 200 { rows, regions }       |
     |                                |
     |-- POST your-webhook-url -------|  (your callback)
     |   { jobId, status, payload }   |
```

## Minimal worker (Python)

```python
import os
from eyewear_fit_client import EyewearFitClient

def handle_refresh_job(job_id: str, callback_url: str) -> None:
    with EyewearFitClient(os.environ["EYEWEAR_FIT_API_URL"]) as client:
        payload = client.refresh_latest()
    # POST payload to callback_url with your auth headers
    # requests.post(callback_url, json={"jobId": job_id, "status": "done", "result": payload})
```

## Minimal worker (Node)

```javascript
import { createEyewearFitClient } from "@nexs/eyewear-fit-client";

export async function handleRefreshJob(jobId, callbackUrl) {
  const client = createEyewearFitClient({ baseUrl: process.env.EYEWEAR_FIT_API_URL });
  const result = await client.refreshLatest();
  // await fetch(callbackUrl, { method: "POST", body: JSON.stringify({ jobId, status: "done", result }) });
}
```

## When to use

| Operation              | Typical latency | Sync OK? | Webhook suggested? |
|------------------------|-----------------|----------|--------------------|
| `/health`, `/api/audit`| &lt; 1s         | Yes      | No                 |
| `/api/sheets/compare`  | 1–3s            | Yes      | Optional           |
| `/api/guidelines/refresh-latest` | 5–60s   | Borderline | Yes for UX   |
| Batch LLM enhance (15 rows/chunk via `/api/llm/chat`) | minutes | No | Yes        |

## Idempotency

- Store `jobId` + input hash; dedupe refresh requests per day if literature data is cached.
- Return `409` from your gateway if the same `jobId` is already running.

## Security

- Do not forward `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` to callers; keep keys only on the API container (see `export/.env.example`).
- Authenticate your webhook callbacks (HMAC signature or mTLS).
