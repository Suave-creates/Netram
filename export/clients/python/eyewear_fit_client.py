"""Thin httpx client for eyewear-fit-api.

Batch return-risk scoring (learn_from_rows / score_batch_rows) lives in
eyewear-studio/src/llmTraining.js — not on the API. Use llm_chat for LLM
narratives after local scoring, or port the JS module.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, BinaryIO, Mapping, MutableMapping

import httpx

DEFAULT_BASE = "http://127.0.0.1:8000"


class EyewearFitError(Exception):
    """HTTP or transport error from eyewear-fit-api."""


class EyewearFitClient:
    def __init__(
        self,
        base_url: str | None = None,
        *,
        timeout: float = 120.0,
        client: httpx.Client | None = None,
    ) -> None:
        self.base_url = (base_url or os.environ.get("EYEWEAR_FIT_API_URL") or DEFAULT_BASE).rstrip(
            "/"
        )
        self._owns_client = client is None
        self._client = client or httpx.Client(base_url=self.base_url, timeout=timeout)

    def close(self) -> None:
        if self._owns_client:
            self._client.close()

    def __enter__(self) -> EyewearFitClient:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def _request(
        self,
        method: str,
        path: str,
        *,
        json: Mapping[str, Any] | None = None,
        files: Mapping[str, tuple[str, BinaryIO, str]] | None = None,
    ) -> Any:
        try:
            res = self._client.request(method, path, json=json, files=files)
            res.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = exc.response.text
            raise EyewearFitError(f"{exc.response.status_code} {path}: {body}") from exc
        except httpx.HTTPError as exc:
            raise EyewearFitError(str(exc)) from exc

        ct = res.headers.get("content-type", "")
        if "application/json" in ct:
            return res.json()
        return res.text

    def health(self) -> dict[str, Any]:
        """GET /health"""
        return self._request("GET", "/health")

    def get_guidelines(self) -> dict[str, Any]:
        """GET /api/guidelines"""
        return self._request("GET", "/api/guidelines")

    def get_latest_face_data(self) -> dict[str, Any]:
        """GET /api/guidelines/face-data/latest"""
        return self._request("GET", "/api/guidelines/face-data/latest")

    def get_baseline_face_data(self) -> dict[str, Any]:
        """GET /api/guidelines/face-data/baseline"""
        return self._request("GET", "/api/guidelines/face-data/baseline")

    def refresh_latest(self) -> dict[str, Any]:
        """POST /api/guidelines/refresh-latest"""
        return self._request("POST", "/api/guidelines/refresh-latest")

    def audit(
        self,
        *,
        sex: str = "male",
        active: str = "latest",
        sample_name: str | None = None,
        face_data: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        """POST /api/audit"""
        body: MutableMapping[str, Any] = {"sex": sex, "active": active}
        if sample_name is not None:
            body["sample_name"] = sample_name
        if face_data is not None:
            body["face_data"] = face_data
        return self._request("POST", "/api/audit", json=body)

    def compare_sheets(
        self,
        *,
        sex: str = "male",
        active: str = "latest",
        sample_name: str | None = None,
        face_data: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        """POST /api/sheets/compare"""
        body: MutableMapping[str, Any] = {"sex": sex, "active": active}
        if sample_name is not None:
            body["sample_name"] = sample_name
        if face_data is not None:
            body["face_data"] = face_data
        return self._request("POST", "/api/sheets/compare", json=body)

    def upload_sample(self, path: str | Path) -> dict[str, Any]:
        """POST /api/sample/upload — .csv or .xlsx face anthropometry sample."""
        p = Path(path)
        mime = (
            "text/csv"
            if p.suffix.lower() == ".csv"
            else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        with p.open("rb") as fh:
            return self._request(
                "POST",
                "/api/sample/upload",
                files={"file": (p.name, fh, mime)},
            )

    def llm_chat(
        self,
        message: str,
        *,
        sex: str = "male",
        active: str = "latest",
        history: list[dict[str, str]] | None = None,
        face_data: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        """POST /api/llm/chat"""
        body: MutableMapping[str, Any] = {
            "message": message,
            "sex": sex,
            "active": active,
            "history": history or [],
        }
        if face_data is not None:
            body["face_data"] = face_data
        return self._request("POST", "/api/llm/chat", json=body)

    def llm_audit_report(
        self,
        *,
        sex: str = "male",
        active: str = "latest",
        question: str | None = None,
        stream: bool = False,
    ) -> dict[str, Any]:
        """POST /api/llm/audit-report"""
        body: MutableMapping[str, Any] = {"sex": sex, "active": active, "stream": stream}
        if question is not None:
            body["question"] = question
        return self._request("POST", "/api/llm/audit-report", json=body)

    def llm_audit_report_stream(
        self,
        *,
        sex: str = "male",
        active: str = "latest",
        question: str | None = None,
    ) -> httpx.Response:
        """POST /api/llm/audit-report/stream — caller reads .iter_text()."""
        body: MutableMapping[str, Any] = {"sex": sex, "active": active}
        if question is not None:
            body["question"] = question
        try:
            res = self._client.post("/api/llm/audit-report/stream", json=body)
            res.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise EyewearFitError(f"{exc.response.status_code}: {exc.response.text}") from exc
        return res
