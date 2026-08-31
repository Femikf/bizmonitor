# BizMonitor Project Context & Architecture

BizMonitor is a full-stack business analytics and real-time infrastructure monitoring application.

## Frontend Architecture

- **Stack**: Vite + React 19 + TypeScript + Vanilla CSS + `react-router-dom` + `lucide-react`
- **Location**: [frontend/](file:///d:/bizmonitor/frontend)

### Key Routes & Pages
1. **`/login`** ([Login.tsx](file:///d:/bizmonitor/frontend/src/pages/Login.tsx)):
   - Glassmorphic login card with brand logo and background ambient glow.
   - Form controls with password show/hide toggle, "Remember me" checkbox, and Forgot Password modal reset flow.
   - Demo credential quick-fill triggers and social workspace login shortcuts.
2. **`/register`** ([Register.tsx](file:///d:/bizmonitor/frontend/src/pages/Register.tsx)):
   - User signup form (Full Name, Work Email, Password).
   - Password strength meter and Terms of Service agreement.
   - Forwards newly registered user to `/onboarding`.
3. **`/onboarding`** ([Onboarding.tsx](file:///d:/bizmonitor/frontend/src/pages/Onboarding.tsx)):
   - "Tell us about your business" workspace creation wizard.
   - Collects Business Name, Industry, Currency, and Country.
   - Provisions Firestore `organizations/{orgId}` document and owner record before navigating to `/dashboard`.
4. **`/dashboard`** ([Dashboard.tsx](file:///d:/bizmonitor/frontend/src/pages/Dashboard.tsx)):
   - Top navbar ([Navbar.tsx](file:///d:/bizmonitor/frontend/src/components/Navbar.tsx)) with `bizmonitor` branding and user dropdown (`[User] ▼`).
   - Sidebar navigation ([Sidebar.tsx](file:///d:/bizmonitor/frontend/src/components/Sidebar.tsx)): Dashboard, Data, Insights (Coming soon), Forecast (Coming soon), Ask BizMonitor (Coming soon), Settings (Coming soon).
   - Dynamic greeting ("Good evening, [User]"), "Today's Business Intelligence", and honest metric skeleton cards (`Revenue --`, `Stock --`, `Returns --`).
   - Upload business data callout banner & dataset management screen under `Data` tab.

### State & Auth Context
- [firebase.ts](file:///d:/bizmonitor/frontend/src/config/firebase.ts): Initializes Firebase App, Firebase Auth (`auth`), Firestore Database (`db`), and Analytics (`analytics`).
- [auth.ts](file:///d:/bizmonitor/frontend/src/services/auth.ts): Decoupled authentication & organization service layer handling Firebase Auth + Firestore `users/{uid}` and `organizations/{orgId}` documents & sub-collections.
- [AuthContext.tsx](file:///d:/bizmonitor/frontend/src/context/AuthContext.tsx): Holds `user`, `isAuthenticated`, `isLoading`, `theme`, `login`, `register`, `completeOnboarding`, `loginDemo`, and `logout` state.
- [ProtectedRoute.tsx](file:///d:/bizmonitor/frontend/src/components/ProtectedRoute.tsx): Protects `/dashboard` and `/onboarding`, checking auth status and organization completion (`requireOrg`).
- [PublicRoute.tsx](file:///d:/bizmonitor/frontend/src/components/PublicRoute.tsx): Restricts authenticated users from accessing `/login` or `/register`, redirecting to `/onboarding` or `/dashboard`.

### Database Architecture & Migration Engine
- [firestore.ts](file:///d:/bizmonitor/frontend/src/types/firestore.ts): TypeScript document schemas for `users`, `organizations`, `monitors`, `telemetry_logs`, `transactions`, and `meta`.
- [dbMigration.ts](file:///d:/bizmonitor/frontend/src/services/dbMigration.ts): Automated migration runner `runFirestoreMigrations()` that checks `meta/schema_version` and seeds baseline collections.
- [firestore.rules](file:///d:/bizmonitor/firestore.rules): Production security rules for Firestore access control.
- [firestore.indexes.json](file:///d:/bizmonitor/firestore.indexes.json): Composite indices for querying telemetry logs, monitors, and transactions.

---

## Backend Architecture (OpsPilot API)

- **Stack**: Python 3.11+ + FastAPI + Uvicorn
- **Location**: [backend/](file:///d:/bizmonitor/backend)
- **Virtual Environment**: `backend/.venv`
- **Entry point**: [backend/app/main.py](file:///d:/bizmonitor/backend/app/main.py)

### Package Structure
```
backend/
├── .venv/
├── requirements.txt
└── app/
    ├── main.py        # FastAPI app & CORS middleware
    ├── api/           # Endpoint routers
    ├── services/      # Business logic services
    ├── models/        # Pydantic schemas & data models
    ├── core/          # Core utilities & security
    └── config/        # Environment configurations
```

### Endpoints
- **`GET /health`**: Returns `{"status": "ok", "service": "OpsPilot API"}`.
- **Swagger Docs**: Available at `http://127.0.0.1:8000/docs`.

---

## Verification & Commands

```bash
# Run local frontend server
npm run dev

# Run FastAPI backend server
.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000

# Run TypeScript check & production build
npm run build
```
