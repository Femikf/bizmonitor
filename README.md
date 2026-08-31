# BizMonitor (OpsPilot)

BizMonitor is a full-stack business monitoring and operations dashboard built with a modern React frontend and a Python FastAPI backend, integrated with Firebase Firestore.

## 🏗️ Architecture & Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), Lucide Icons, React Router 7, Firebase JS SDK.
- **Backend**: [Python 3.12](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/).
- **Database & Cloud**: Firebase Firestore (`firestore.rules`, `firestore.indexes.json`).
- **Development Tooling**: `oxlint` for fast JS/TS linting, `tsc` for type checking.

---

## 📁 Repository Structure

```
bizmonitor/
├── .agents/                    # Agent plans and project context documentation
├── analytics/                  # Analytics modules & data processing scripts
├── backend/                    # Python FastAPI application
│   ├── app/
│   │   ├── api/               # API routes (e.g. health check)
│   │   ├── config/            # Environment & app configurations
│   │   ├── core/              # Core logic & security
│   │   ├── models/            # Pydantic data models
│   │   ├── services/          # Business logic services
│   │   └── main.py            # FastAPI entrypoint & CORS configuration
│   └── requirements.txt       # Backend dependencies
├── data/                       # Local data storage / exports
├── docs/                       # Project documentation
├── frontend/                   # Vite + React + TypeScript app
│   ├── public/                # Static assets
│   ├── src/                   # React components, pages, services
│   ├── package.json           # Frontend dependencies & scripts
│   └── vite.config.ts         # Vite configuration
├── firestore.indexes.json      # Firebase Firestore composite indexes
├── firestore.rules             # Firebase Firestore security rules
├── .gitignore                  # Project-wide Git ignore rules
└── README.md                   # Repository documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ and `npm`
- **Python**: 3.10+ (or [`uv`](https://github.com/astral-sh/uv))

---

### 1. Backend Setup (FastAPI)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

   - API Server: `http://127.0.0.1:8000`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (React + Vite)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

   - Dev Server: `http://localhost:5173`

---

## 🔒 Firebase Configuration

- Firestore Security Rules are managed via [`firestore.rules`](file:///d:/bizmonitor/firestore.rules).
- Firestore Indexes are managed via [`firestore.indexes.json`](file:///d:/bizmonitor/firestore.indexes.json).

---

## 📄 License

Private / Proprietary. All rights reserved.
