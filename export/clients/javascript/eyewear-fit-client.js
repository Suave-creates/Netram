/**
 * @nexs/eyewear-fit-client — thin wrappers for eyewear-fit-api.
 *
 * Batch return-risk scoring (learnFromRows / scoreBatchRows) is browser-side
 * in eyewear-studio/src/llmTraining.js — not exposed on the API. Use llmChat
 * for LLM narratives after you score locally, or port llmTraining.js.
 */

const DEFAULT_BASE = "http://127.0.0.1:8000";

/**
 * @param {string} baseUrl
 * @param {string} path
 * @param {typeof fetch} fetchImpl
 * @param {RequestInit} [init]
 */
async function request(baseUrl, path, fetchImpl, init = {}) {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetchImpl(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`eyewear-fit-api ${res.status} ${path}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/**
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 * @param {typeof fetch} [options.fetchImpl]
 */
export function createEyewearFitClient(options = {}) {
  const baseUrl = options.baseUrl || process.env?.EYEWEAR_FIT_API_URL || DEFAULT_BASE;
  const fetchImpl = options.fetchImpl || fetch;
  const req = (path, init) => request(baseUrl, path, fetchImpl, init);

  return {
    /** GET /health */
    health: () => req("/health"),

    /** GET /api/guidelines */
    getGuidelines: () => req("/api/guidelines"),

    /** GET /api/guidelines/face-data/latest */
    getLatestFaceData: () => req("/api/guidelines/face-data/latest"),

    /** GET /api/guidelines/face-data/baseline */
    getBaselineFaceData: () => req("/api/guidelines/face-data/baseline"),

    /**
     * POST /api/guidelines/refresh-latest
     * Anthropic → OpenAI → demo fallback (server-side keys).
     */
    refreshLatest: () => req("/api/guidelines/refresh-latest", { method: "POST" }),

    /**
     * POST /api/audit
     * @param {{ sex?: 'male'|'female', active?: 'baseline'|'latest'|'sample', sample_name?: string, face_data?: object }} body
     */
    audit: (body = {}) =>
      req("/api/audit", { method: "POST", body: JSON.stringify(body) }),

    /**
     * POST /api/sheets/compare — side-by-side guideline vs population tables.
     * @param {{ sex?: 'male'|'female', active?: 'baseline'|'latest'|'sample', sample_name?: string, face_data?: object }} body
     */
    compareSheets: (body = {}) =>
      req("/api/sheets/compare", { method: "POST", body: JSON.stringify(body) }),

    /**
     * POST /api/sample/upload — multipart face sample (.csv / .xlsx).
     * @param {File|Blob} file
     */
    async uploadSample(file) {
      const url = `${baseUrl.replace(/\/$/, "")}/api/sample/upload`;
      const form = new FormData();
      form.append("file", file);
      const res = await fetchImpl(url, { method: "POST", body: form });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`eyewear-fit-api ${res.status} /api/sample/upload: ${text}`);
      }
      return res.json();
    },

    /**
     * POST /api/llm/chat — context-aware chat (sizing suggestions, batch enhance).
     * @param {{ message: string, sex?: string, active?: string, history?: object[], face_data?: object }} body
     */
    llmChat: (body) =>
      req("/api/llm/chat", { method: "POST", body: JSON.stringify(body) }),

    /**
     * POST /api/llm/audit-report
     * @param {{ sex?: string, active?: string, question?: string, stream?: boolean }} body
     */
    llmAuditReport: (body = {}) =>
      req("/api/llm/audit-report", { method: "POST", body: JSON.stringify(body) }),

    /**
     * POST /api/llm/audit-report/stream — returns raw Response for streaming.
     * @param {{ sex?: string, active?: string, question?: string }} body
     */
    async llmAuditReportStream(body = {}) {
      const url = `${baseUrl.replace(/\/$/, "")}/api/llm/audit-report/stream`;
      const res = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/plain" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`eyewear-fit-api ${res.status} stream: ${text}`);
      }
      return res;
    },
  };
}

/** Default singleton client (base from EYEWEAR_FIT_API_URL or localhost). */
export const eyewearFit = createEyewearFitClient();
