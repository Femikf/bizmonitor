from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ValidationIssue(BaseModel):
    severity: str  # "warning" | "error" | "info"
    column: Optional[str] = None
    message: str


class ValidationResult(BaseModel):
    is_valid: bool
    total_rows: int
    total_columns: int
    missing_cells_count: int
    duplicate_rows_count: int
    issues: List[ValidationIssue] = Field(default_factory=list)


class ColumnProfile(BaseModel):
    column_name: str
    data_type: str  # "numeric" | "categorical" | "datetime" | "boolean" | "text"
    null_count: int
    null_percentage: float
    unique_count: int
    min_val: Optional[Any] = None
    max_val: Optional[Any] = None
    mean_val: Optional[float] = None
    top_values: Optional[Dict[str, int]] = None


class ProfilingResult(BaseModel):
    total_rows: int
    total_columns: int
    memory_usage_kb: float
    column_profiles: List[ColumnProfile]


class NormalizationResult(BaseModel):
    original_columns: List[str]
    normalized_columns: List[str]
    column_mapping: Dict[str, str]
    rows_processed: int
    sample_records: List[Dict[str, Any]]


class BigQueryResult(BaseModel):
    dataset_id: str
    table_name: str
    inserted_rows: int
    mode: str  # "live" | "simulated"
    status: str
    message: str


class FirestoreMetadataResult(BaseModel):
    dataset_id: str
    organization_id: str
    name: str
    file_name: str
    file_size_bytes: int
    row_count: int
    column_count: int
    status: str
    firestore_path: str


from app.models.analytics import AnalyticsReport


class PipelineResponse(BaseModel):
    success: bool
    dataset_id: str
    dataset_name: str
    file_name: str
    file_size_bytes: int
    uploaded_at: str
    validation: ValidationResult
    profiling: ProfilingResult
    normalization: NormalizationResult
    bigquery: BigQueryResult
    firestore: FirestoreMetadataResult
    analytics: AnalyticsReport

