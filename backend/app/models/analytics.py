from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class QualityMetrics(BaseModel):
    score: int  # e.g., 91, 96, 94, 87 (0 to 100)
    completeness_pct: float
    uniqueness_pct: float
    consistency_pct: float
    status_label: str  # "Excellent" | "Good" | "Needs Attention"


class DetectedAnomaly(BaseModel):
    id: str
    title: str  # e.g., "Product C returns increased 23%"
    category: str  # "returns" | "inventory" | "sales" | "purchases"
    severity: str  # "high" | "medium" | "low"
    impact_percentage: Optional[float] = None
    description: str
    bigquery_query: str
    affected_item: Optional[str] = None


class AnalyticsReport(BaseModel):
    dataset_id: str
    dataset_name: str
    dataset_category: str  # "Sales" | "Inventory" | "Purchases" | "Returns" | "General"
    quality_score: int
    quality_metrics: QualityMetrics
    anomalies_detected: List[DetectedAnomaly] = Field(default_factory=list)
    bigquery_sandbox_table: str
    processed_at: str
