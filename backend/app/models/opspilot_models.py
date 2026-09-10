from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DetectedIssue(BaseModel):
    id: str
    severity: str  # "critical" | "warning" | "info"
    category: str  # "inventory" | "supplier" | "returns" | "demand"
    headline: str
    impact_amount: str  # e.g., "₹1.4L at risk", "23% drop", "31% returns"
    urgency: str  # "Immediate (4 days)", "High", "Medium"
    affected_entity: str  # e.g. "Product A", "Supplier B", "Product C"
    tag: str  # e.g., "🔴 Stockout Risk", "🟠 Reliability", "🔴 Return Spike", "🟡 Demand Gap"


class DiagnosisReport(BaseModel):
    issue_id: str
    headline: str
    root_cause: str
    evidence: str
    data_metrics: Dict[str, Any] = Field(default_factory=dict)
    contributing_factors: List[str] = Field(default_factory=list)


class ForecastPrediction(BaseModel):
    issue_id: str
    headline: str
    if_nothing_changes: str
    projected_loss: str
    timeline: str
    confidence_score: int = 94


class RecommendedAction(BaseModel):
    id: str
    priority: int  # 1 to 5
    title: str
    description: str
    effort: str  # "Low (15 min)", "Medium (1 hr)", "Quick Action"
    impact: str  # "Saves ₹1.4L", "Recovers ₹2.1L", "Prevents Stockout"
    action_type: str  # "supplier_dispute" | "po_adjustment" | "inspection" | "stock_replenishment" | "forecast_tuning"
    executable_id: Optional[str] = None


class ExecutableAction(BaseModel):
    id: str
    type: str  # "supplier_email" | "purchase_order" | "inspection_checklist" | "ops_briefing"
    title: str
    target_entity: str
    subject: Optional[str] = None
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class OpsPilotOverview(BaseModel):
    has_data: bool = True
    dataset_id: Optional[str] = None
    company_name: str
    revenue_at_risk: str
    risk_level: str
    summary_headline: str
    detected_issues: List[DetectedIssue]
    diagnoses: List[DiagnosisReport]
    predictions: List[ForecastPrediction]
    recommendations: List[RecommendedAction]
    executable_actions: List[ExecutableAction]
    analyzed_datasets: List[str]
    generated_at: str


class AskOpsPilotRequest(BaseModel):
    question: str
    dataset_id: Optional[str] = None
    context_datasets: Optional[List[str]] = None


class AskOpsPilotResponse(BaseModel):
    question: str
    answer: str
    calculation_summary: str
    key_findings: List[str]
    suggested_actions: List[RecommendedAction]
    executable_action: Optional[ExecutableAction] = None
