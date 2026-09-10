# BizMonitor (OpsPilot) Project Context & Architecture

BizMonitor (powered by **OpsPilot**) is an autonomous AI Operations Manager and real-time business telemetry platform designed for small-to-mid sized businesses (SMBs). It operates with **zero dummy data**, turning real user-uploaded operational files (Excel, CSV, JSON, Parquet) into clear, decisive answers to:
> **"What is going wrong in my business, why is it happening, and what should I do tomorrow?"**

---

## 1. Zero Dummy Data Architecture

The platform guarantees 100% dynamic, dataset-driven analysis:
1. **Initial / Unloaded State**:
   - When no dataset has been uploaded, the platform presents a clean, welcoming **"Upload Business Dataset"** dropzone.
   - Zero hardcoded metrics, zero fake sales rows, zero dummy product names.
2. **Dynamic Ingestion & 5-Stage Synthesis**:
   - When a user uploads a report (e.g. Weighbridge logs, Sales registers, Inventory sheets, Purchase ledgers, Invoices, Delivery dispatches):
     - **Stage 1 (Detect)**: Automatically discovers numeric columns (`Charges`, `Weights`, `Amounts`), categoricals (`Stores`, `Vehicles`, `Vendors`, `Products`), and timestamps. Identifies unbilled/zero charges, scale calibration inversions, and statistical load outliers (>2.5 std dev). Calculates actual financial/operational revenue at risk.
     - **Stage 2 (Diagnose)**: Cross-correlates anomalies against entities (e.g., attributing unbilled transactions to specific stores/depots or load variances to specific vehicles).
     - **Stage 3 (Predict)**: Forecasts 30-to-90-day operational and financial leakage based on the dataset's actual transaction velocity.
     - **Stage 4 (Recommend)**: Generates prioritized tactical countermeasures mentioning the real columns and flagged entities.
     - **Stage 5 (Act)**: Drafts executable dispute letters, depot inspection SOP checklists, and executive briefings tailored with the real company name and slip numbers.
3. **Dataset-Aware Ask OpsPilot**:
   - Queries the active user dataset directly to calculate real sums, averages, counts, distributions, top locations, and vehicle activities.

---

## 2. Frontend Architecture (React + Vite + TypeScript)

- **Stack**: Vite + React 19 + TypeScript + Vanilla CSS + `lucide-react` + `react-router-dom`
- **Location**: [frontend/](file:///d:/bizmonitor/frontend)

### Key Pages & Components
- **[Dashboard.tsx](file:///d:/bizmonitor/frontend/src/pages/Dashboard.tsx)**:
  - Conditionally renders:
    - **Empty State**: Modern file dropzone with zero dummy data.
    - **Active State**: Live 🚨 Today's Business Intelligence Hero Card, 5-Stage OpsPilot Execution Board, embedded Ask OpsPilot terminal, and active business dataset cards.
- **[OpsPilotBoard.tsx](file:///d:/bizmonitor/frontend/src/components/OpsPilotBoard.tsx)**:
  - Renders the dynamic 🚨 Hero Card and 5-stage tabs (Detect, Diagnose, Predict, Recommend, Act). Cleanly hides when no data is loaded.
- **[AskOpsPilotTerminal.tsx](file:///d:/bizmonitor/frontend/src/components/AskOpsPilotTerminal.tsx)**:
  - Interactive terminal featuring dataset-aware prompt chips (*"What is the total charges & volume?"*, *"Why are transactions unbilled or at risk?"*, *"Which store or vehicle has the most activity?"*, *"What should I do tomorrow?"*), data calculation breakdowns, and direct execution action triggers.
- **[OpsPilotActionModal.tsx](file:///d:/bizmonitor/frontend/src/components/OpsPilotActionModal.tsx)**:
  - Modal providing interactive review of pre-drafted agent actions: copyable notices with metadata badges, interactive checkable warehouse SOP checklists, and ERP execution confirmations.
- **[api.ts](file:///d:/bizmonitor/frontend/src/services/api.ts)**:
  - TypeScript client service (`getOpsPilotOverview`, `askOpsPilot`, `fetchUploadedDatasets`, `uploadDatasetToPipeline`, `getCloudStatus`).

---

## 3. Backend Architecture (FastAPI + Pandas + BigQuery)

- **Stack**: Python 3.11+ + FastAPI + Uvicorn + Google Cloud BigQuery + Cloud Firestore + Pandas + PyArrow + OpenPyXL
- **Location**: [backend/](file:///d:/bizmonitor/backend)
- **Virtual Environment**: `backend/.venv`
- **Entry point**: [backend/app/main.py](file:///d:/bizmonitor/backend/app/main.py)

### Package Organization
```
backend/
├── .venv/
├── requirements.txt
├── .env                  # GCP_PROJECT, GOOGLE_APPLICATION_CREDENTIALS, BIGQUERY_DATASET
├── service-account.json    # Live GCP service account key (git-ignored)
└── app/
    ├── main.py           # FastAPI app, dotenv loader, CORS, router mounting
    ├── api/
    │   ├── ask_router.py        # /api/v1/opspilot/overview, /ask, /datasets, /actions
    │   ├── upload.py            # /api/v1/upload (Pandas Ingestion Pipeline)
    │   ├── analytics_router.py  # /api/v1/analytics/detect (BigQuery scans)
    │   └── cloud_router.py      # /api/v1/cloud/status (GCP live verification)
    ├── models/
    │   ├── opspilot_models.py   # OpsPilotOverview (has_data, dataset_id), DetectedIssue, etc.
    │   ├── pipeline.py          # ValidationResult, ProfilingResult, NormalizationResult
    │   └── analytics.py         # QualityMetrics, DetectedAnomaly
    └── services/
        ├── dataset_store.py        # Thread-safe in-memory registry of active DataFrames & overviews
        ├── opspilot_engine.py      # Dynamic 5-stage synthesis engine & DataFrame query calculator
        ├── pandas_service.py       # Multi-format ingestion with banner auto-detection
        ├── validation_service.py   # Data sanity & integrity validation
        ├── profiling_service.py    # Statistical column distribution profiling
        ├── normalization_service.py# Clean snake_case schema normalization
        ├── bigquery_service.py     # Live table provisioning & streaming load
        ├── firestore_service.py    # Cloud Firestore metadata persistence
        └── analytics_service.py    # BigQuery Sandbox SQL analysis & dynamic anomaly rules
```

### Endpoints & Services
- **`GET /api/v1/opspilot/overview`**: Returns the dynamic 5-stage overview for the active dataset (or `has_data: false` when empty).
- **`GET /api/v1/opspilot/datasets`**: Lists metadata of all active uploaded datasets in the session.
- **`POST /api/v1/opspilot/ask`**: Computes mathematical answers directly on the active DataFrame.
- **`POST /api/v1/upload`**: Parses uploaded Excel/CSV/JSON files, loads into BigQuery, saves Firestore metadata, and registers dynamic OpsPilot overview.
- **`GET /api/v1/cloud/status`**: Verifies live GCP infrastructure (BigQuery US dataset and Firestore mode).
- **`GET /health`**: Healthcheck endpoint returning `{"status": "ok", "service": "OpsPilot API"}`.

---

## 4. Live Cloud & Zero-Billing Architecture

- **GCP Project**: `bizmonitor-3d2d8`
- **BigQuery Dataset**: `bizmonitor_dw` (US multi-region, 10 GB free monthly tier under GCP Free Tier).
- **Firestore Database**: `(default)` in Native mode (50k daily free reads / 20k writes under Spark Plan).
- **Engine Execution**: Deterministic statistical analysis and DataFrame querying runs locally without incurring costly LLM API token fees.

---

## 5. Deployment Architecture (Vercel + Cloud Run)

BizMonitor is optimized for a serverless combo:
- **Frontend**: Single Page Application (SPA) deployed to **Vercel** with edge rewrites (`frontend/vercel.json`) pointing to `index.html`.
  - Configured with `import.meta.env.VITE_API_BASE_URL` in [frontend/src/services/api.ts](file:///d:/bizmonitor/frontend/src/services/api.ts).
  - Environment variable `VITE_API_BASE_URL` in Vercel project dashboard points to the Cloud Run service URL.
- **Backend**: Containerized FastAPI service deployed to **Google Cloud Run** in project `bizmonitor-3d2d8`.
  - [Dockerfile](file:///d:/bizmonitor/backend/Dockerfile): Multi-stage `python:3.11-slim` with dynamic `$PORT` binding.
  - [.dockerignore](file:///d:/bizmonitor/backend/.dockerignore): Excludes `.venv`, `service-account.json`, `.env`, and test artifacts.
  - **Application Default Credentials (ADC)**: When running in Cloud Run, client libraries automatically use Cloud Run's native service account identity via metadata server. The backend auto-detects absence of local credential files and unsets `GOOGLE_APPLICATION_CREDENTIALS` so ADC takes precedence seamlessly.
  - **1-Command Deploy Scripts**:
    - PowerShell (Windows): [backend/deploy_cloud_run.ps1](file:///d:/bizmonitor/backend/deploy_cloud_run.ps1)
    - Bash (Linux/Mac/Cloud Shell): [backend/deploy_cloud_run.sh](file:///d:/bizmonitor/backend/deploy_cloud_run.sh)

---

## 6. Verification & Commands

```bash
# Frontend dev server (port 5173)
cd d:\bizmonitor\frontend
npm run dev

# Frontend production build & TypeScript validation
cd d:\bizmonitor\frontend
npm run build

# Backend API server (port 8000)
cd d:\bizmonitor\backend
.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000

# Backend Cloud Run 1-Click Deployment (PowerShell)
cd d:\bizmonitor\backend
.\deploy_cloud_run.ps1

# Backend Cloud Run 1-Click Deployment (Bash)
cd d:\bizmonitor\backend
chmod +x deploy_cloud_run.sh
./deploy_cloud_run.sh
```
