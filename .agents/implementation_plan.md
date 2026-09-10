# Implementation Plan: Vercel (Frontend) + Google Cloud Run (Backend) Deployment

Prepare **BizMonitor / OpsPilot** for production deployment using the recommended hybrid cloud architecture:
- **Frontend (Client-Side)**: Deployed to **Vercel** as a high-speed global React 19 SPA.
- **Backend (Server-Side)**: Deployed to **Google Cloud Run** as a containerized FastAPI service running directly alongside your active BigQuery dataset and Cloud Firestore in project `bizmonitor-3d2d8`.

---

## Architecture Overview

```
                      ┌────────────────────────────────┐
                      │             USER               │
                      └──────────────┬─────────────────┘
                                     │
              ┌──────────────────────┴──────────────────────┐
              ▼                                             ▼
 ┌─────────────────────────┐                   ┌─────────────────────────┐
 │     VERCEL (FREE)       │                   │   GOOGLE CLOUD RUN      │
 │   Frontend React 19     │ ──[ HTTPS API ]──>│   FastAPI Python Engine │
 │   Global Edge CDN       │                   │   Container (Serverless)│
 └─────────────────────────┘                   └────────────┬────────────┘
                                                            │
                                                            ▼
                                               ┌─────────────────────────┐
                                               │   GCP BigQuery &        │
                                               │   Firestore (Live)      │
                                               │   bizmonitor-3d2d8      │
                                               └─────────────────────────┘
```

---

## User Review Required

> [!IMPORTANT]
> **Zero Secrets in Docker Images**:
> Google Cloud Run runs natively inside your GCP project (`bizmonitor-3d2d8`). It uses Google Cloud's **Application Default Credentials (ADC)** automatically. We will ensure `service-account.json` and `.env` are strictly excluded from the Docker container via `.dockerignore`.

> [!NOTE]
> **Vercel SPA Routing**:
> Vite single-page applications need a rewrite rule in `vercel.json` so that reloading pages like `/dashboard` or `/login` does not return a 404 error.

---

## Proposed Changes

### Frontend Configuration (Vercel)

#### [MODIFY] [api.ts](file:///d:/bizmonitor/frontend/src/services/api.ts)
- Update `API_BASE_URL` to read from Vite's environment variable:
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  ```
  This allows Vercel to point to your live Cloud Run URL while keeping `http://127.0.0.1:8000` for local development.

#### [NEW] [vercel.json](file:///d:/bizmonitor/frontend/vercel.json)
- Add SPA rewrite configuration to route all paths to `index.html`:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

#### [NEW] [.env.example](file:///d:/bizmonitor/frontend/.env.example)
- Document required environment variables for Vercel:
  ```env
  VITE_API_BASE_URL=https://bizmonitor-api-xxx.a.run.app
  ```

---

### Backend Configuration (Google Cloud Run)

#### [NEW] [Dockerfile](file:///d:/bizmonitor/backend/Dockerfile)
- Multi-stage, lightweight production container based on `python:3.11-slim`:
  - Installs requirements (`fastapi`, `pandas`, `pyarrow`, `google-cloud-bigquery`, etc.).
  - Configures dynamic `$PORT` handling (Cloud Run sets `PORT=8080`).
  - Starts Uvicorn: `CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}`.

#### [NEW] [.dockerignore](file:///d:/bizmonitor/backend/.dockerignore)
- Excludes `.venv`, `service-account.json`, `.env`, `__pycache__`, and git directories to keep the image secure and lightweight.

#### [MODIFY] [bigquery_service.py](file:///d:/bizmonitor/backend/app/services/bigquery_service.py) & [firestore_service.py](file:///d:/bizmonitor/backend/app/services/firestore_service.py)
- Ensure that if `GOOGLE_APPLICATION_CREDENTIALS` points to a non-existent local file (in production on Cloud Run), the environment variable is unset so that Google's native metadata server / Application Default Credentials take over automatically.

#### [MODIFY] [cloud_router.py](file:///d:/bizmonitor/backend/app/api/cloud_router.py)
- Update `/api/v1/cloud/status` to detect Cloud Run's native service account and report `status: "live (Cloud Run Native IAM)"`.

#### [NEW] [deploy_cloud_run.ps1](file:///d:/bizmonitor/backend/deploy_cloud_run.ps1) & [deploy_cloud_run.sh](file:///d:/bizmonitor/backend/deploy_cloud_run.sh)
- One-line deployment scripts running:
  ```bash
  gcloud run deploy bizmonitor-api \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --project bizmonitor-3d2d8 \
    --set-env-vars GCP_PROJECT=bizmonitor-3d2d8,BIGQUERY_DATASET=bizmonitor_dw,BIGQUERY_LOCATION=US
  ```

---

## Verification Plan

### Automated Verification
1. **Frontend Production Build**:
   - Run `npm run build` in `frontend/` to confirm that `import.meta.env.VITE_API_BASE_URL` compiles without TypeScript issues.
2. **Local Docker Build / Container Test (if Docker is available)** or **Dry-Run Syntax Check**:
   - Validate `Dockerfile` syntax and `.dockerignore` filters.
   - Verify `uvicorn app.main:app` runs with dynamic `PORT`.

### Manual Deployment Walkthrough
- Provide exact, step-by-step instructions for the user:
  1. How to run `gcloud run deploy` to get the live Cloud Run backend URL.
  2. How to import the repository into Vercel and paste the Cloud Run URL as `VITE_API_BASE_URL`.
