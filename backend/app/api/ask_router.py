from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any

from app.models.opspilot_models import (
    OpsPilotOverview,
    AskOpsPilotRequest,
    AskOpsPilotResponse,
    ExecutableAction,
)
from app.services.opspilot_engine import (
    get_default_opspilot_overview,
    process_ask_opspilot,
    get_default_executable_actions,
    get_empty_opspilot_overview,
)
from app.services.dataset_store import dataset_store

router = APIRouter(prefix="/api/v1/opspilot", tags=["OpsPilot AI Operations"])


@router.get("/overview", response_model=OpsPilotOverview)
def get_opspilot_overview(dataset_id: Optional[str] = Query(None)):
    """
    Returns the dynamic 5-Stage OpsPilot Command Center Overview for the active user dataset.
    If no dataset has been uploaded, returns has_data=False (guaranteeing ZERO dummy data).
    """
    try:
        if dataset_id:
            overview = dataset_store.get_overview(dataset_id)
            if overview:
                return overview
        return get_default_opspilot_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate OpsPilot overview: {str(e)}")


@router.get("/datasets")
def list_uploaded_datasets() -> List[Dict[str, Any]]:
    """
    Returns metadata for all datasets uploaded by the user in this session.
    """
    items = dataset_store.get_all_datasets()
    result = []
    for item in items:
        meta = item.get("metadata", {})
        overview: OpsPilotOverview = item.get("overview")
        result.append({
            "dataset_id": item["id"],
            "dataset_name": meta.get("dataset_name", item["id"]),
            "file_name": meta.get("file_name", ""),
            "rows": meta.get("rows", 0),
            "cols": meta.get("cols", 0),
            "revenue_at_risk": overview.revenue_at_risk if overview else "₹0",
            "risk_level": overview.risk_level if overview else "HEALTHY",
            "detected_issues_count": len(overview.detected_issues) if overview else 0,
        })
    return result


@router.post("/ask", response_model=AskOpsPilotResponse)
def ask_opspilot(payload: AskOpsPilotRequest):
    """
    Ask OpsPilot anything about operations, anomalies, totals, and recommendations.
    Dynamically computes answers from the uploaded user dataset.
    """
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        return process_ask_opspilot(payload.question, payload.dataset_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")


@router.get("/actions", response_model=List[ExecutableAction])
def list_executable_actions():
    """
    Returns executable agent actions dynamically generated for the active dataset.
    """
    return get_default_executable_actions()


@router.get("/actions/{action_id}", response_model=ExecutableAction)
def get_executable_action(action_id: str):
    """
    Retrieve a specific executable action by ID.
    """
    actions = get_default_executable_actions()
    action = next((a for a in actions if a.id == action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail=f"Action '{action_id}' not found.")
    return action
