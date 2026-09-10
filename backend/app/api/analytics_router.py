from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from app.models.analytics import AnalyticsReport, DetectedAnomaly, QualityMetrics
from app.services.analytics_service import run_bigquery_sandbox_analytics
import pandas as pd

router = APIRouter(prefix="/api/v1/analytics", tags=["OpsPilot Analytics Engine"])


class DetectionRequest(BaseModel):
    dataset_id: str
    dataset_name: str
    dataset_category: Optional[str] = "Sales"
    sample_data: Optional[List[dict]] = None


@router.post("/detect", response_model=AnalyticsReport, status_code=status.HTTP_200_OK)
def trigger_bigquery_analytics_detection(req: DetectionRequest):
    """
    Triggers OpsPilot Analytics Engine & BigQuery Sandbox Anomaly Detection.
    """
    try:
        if req.sample_data:
            df = pd.DataFrame(req.sample_data)
        else:
            # Generate sample dataset if no inline records provided
            df = pd.DataFrame({
                "product_name": ["Product C", "Product A", "Product B", "Product C", "Product C"],
                "return_qty": [12, 1, 2, 15, 14],
                "sale_amount": [120.0, 450.0, 310.0, 115.0, 110.0],
                "date": ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"]
            })

        report = run_bigquery_sandbox_analytics(
            df=df,
            dataset_id=req.dataset_id,
            dataset_name=req.dataset_name,
            filename=f"{req.dataset_name.lower().replace(' ', '_')}.csv"
        )

        if req.dataset_category and req.dataset_category != "General":
            report.dataset_category = req.dataset_category

        return report
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Analytics detection failed: {str(err)}")
