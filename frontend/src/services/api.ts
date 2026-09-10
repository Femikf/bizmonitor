const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ValidationIssue {
  severity: 'warning' | 'error' | 'info';
  column?: string;
  message: string;
}

export interface ValidationResult {
  is_valid: boolean;
  total_rows: number;
  total_columns: number;
  missing_cells_count: number;
  duplicate_rows_count: number;
  issues: ValidationIssue[];
}

export interface ColumnProfile {
  column_name: string;
  data_type: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'text';
  null_count: number;
  null_percentage: number;
  unique_count: number;
  min_val?: number | string | null;
  max_val?: number | string | null;
  mean_val?: number | null;
  top_values?: Record<string, number> | null;
}

export interface ProfilingResult {
  total_rows: number;
  total_columns: number;
  memory_usage_kb: number;
  column_profiles: ColumnProfile[];
}

export interface NormalizationResult {
  original_columns: string[];
  normalized_columns: string[];
  column_mapping: Record<string, string>;
  rows_processed: number;
  sample_records: Record<string, any>[];
}

export interface BigQueryResult {
  dataset_id: string;
  table_name: string;

  inserted_rows: number;
  mode: 'live' | 'simulated';
  status: string;
  message: string;
}

export interface FirestoreMetadataResult {
  dataset_id: string;
  organization_id: string;
  name: string;
  file_name: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  status: string;
  firestore_path: string;
}

export interface QualityMetrics {
  score: number;
  completeness_pct: number;
  uniqueness_pct: number;
  consistency_pct: number;
  status_label: string;
}

export interface DetectedAnomaly {
  id: string;
  title: string;
  category: 'returns' | 'inventory' | 'sales' | 'purchases' | string;
  severity: 'high' | 'medium' | 'low';
  impact_percentage?: number;
  description: string;
  bigquery_query: string;
  affected_item?: string;
}

export interface AnalyticsReport {
  dataset_id: string;
  dataset_name: string;
  dataset_category: 'Sales' | 'Inventory' | 'Purchases' | 'Returns' | string;
  quality_score: number;
  quality_metrics: QualityMetrics;
  anomalies_detected: DetectedAnomaly[];
  bigquery_sandbox_table: string;
  processed_at: string;
}

export interface PipelineResponse {
  success: boolean;
  dataset_id: string;
  dataset_name: string;
  file_name: string;
  file_size_bytes: number;
  uploaded_at: string;
  validation: ValidationResult;
  profiling: ProfilingResult;
  normalization: NormalizationResult;
  bigquery: BigQueryResult;
  firestore: FirestoreMetadataResult;
  analytics: AnalyticsReport;
}

/**
 * Performs GET /health request to FastAPI backend (OpsPilot API).
 */
export const checkBackendHealth = async (): Promise<HealthResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const data: HealthResponse = await response.json();
    return data;
  } catch (error) {
    console.warn('OpsPilot API connection note:', error);
    return null;
  }
};

/**
 * Uploads dataset file to FastAPI backend end-to-end data processing pipeline (POST /api/v1/upload).
 */
export const uploadDatasetToPipeline = async (
  file: File,
  orgId: string = 'default-org',
  userId: string = 'system',
  datasetName?: string
): Promise<PipelineResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('org_id', orgId);
  formData.append('user_id', userId);
  if (datasetName) {
    formData.append('dataset_name', datasetName);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pipeline upload failed (${response.status}): ${errorText}`);
  }

  return await response.json();
};

/**
 * Triggers BigQuery Sandbox Analytics & Anomaly Detection (POST /api/v1/analytics/detect).
 */
export const runDatasetAnalytics = async (
  datasetId: string,
  datasetName: string,
  datasetCategory: string = 'Sales'
): Promise<AnalyticsReport> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataset_id: datasetId,
      dataset_name: datasetName,
      dataset_category: datasetCategory,
    }),
  });

  if (!response.ok) {
    throw new Error(`Analytics detection failed: ${response.statusText}`);
  }

  return await response.json();
};

export interface CloudStatusResponse {
  mode: 'live' | 'simulated';
  project_id: string;
  service_account: string;
  bigquery: {
    status: string;
    dataset: string;
    location: string;
    details: string;
  };
  firestore: {
    status: string;
    details: string;
  };
}

/**
 * Checks live Google Cloud Platform infrastructure status (GET /api/v1/cloud/status).
 */
export const getCloudStatus = async (): Promise<CloudStatusResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/cloud/status`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('Could not fetch cloud status:', err);
    return null;
  }
};

export interface DetectedIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'inventory' | 'supplier' | 'returns' | 'demand';
  headline: string;
  impact_amount: string;
  urgency: string;
  affected_entity: string;
  tag: string;
}

export interface DiagnosisReport {
  issue_id: string;
  headline: string;
  root_cause: string;
  evidence: string;
  data_metrics: Record<string, any>;
  contributing_factors: string[];
}

export interface ForecastPrediction {
  issue_id: string;
  headline: string;
  if_nothing_changes: string;
  projected_loss: string;
  timeline: string;
  confidence_score: number;
}

export interface RecommendedAction {
  id: string;
  priority: number;
  title: string;
  description: string;
  effort: string;
  impact: string;
  action_type: string;
  executable_id?: string;
}

export interface ExecutableAction {
  id: string;
  type: string;
  title: string;
  target_entity: string;
  subject?: string;
  content: string;
  metadata: Record<string, any>;
}

export interface OpsPilotOverview {
  has_data?: boolean;
  dataset_id?: string;
  company_name: string;
  revenue_at_risk: string;
  risk_level: string;
  summary_headline: string;
  detected_issues: DetectedIssue[];
  diagnoses: DiagnosisReport[];
  predictions: ForecastPrediction[];
  recommendations: RecommendedAction[];
  executable_actions: ExecutableAction[];
  analyzed_datasets: string[];
  generated_at: string;
}

export interface AskOpsPilotResponse {
  question: string;
  answer: string;
  calculation_summary: string;
  key_findings: string[];
  suggested_actions: RecommendedAction[];
  executable_action?: ExecutableAction;
}

/**
 * Fetch OpsPilot 5-Stage Overview (GET /api/v1/opspilot/overview)
 */
export const getOpsPilotOverview = async (datasetId?: string): Promise<OpsPilotOverview> => {
  const url = datasetId
    ? `${API_BASE_URL}/api/v1/opspilot/overview?dataset_id=${encodeURIComponent(datasetId)}`
    : `${API_BASE_URL}/api/v1/opspilot/overview`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpsPilot overview: ${response.statusText}`);
  }
  return await response.json();
};

/**
 * Ask OpsPilot query (POST /api/v1/opspilot/ask)
 */
export const askOpsPilot = async (question: string, datasetId?: string): Promise<AskOpsPilotResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/opspilot/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, dataset_id: datasetId }),
  });
  if (!response.ok) {
    throw new Error(`OpsPilot query failed: ${response.statusText}`);
  }
  return await response.json();
};

export interface UploadedDatasetMeta {
  dataset_id: string;
  dataset_name: string;
  file_name: string;
  rows: number;
  cols: number;
  revenue_at_risk: string;
  risk_level: string;
  detected_issues_count: number;
}

/**
 * Lists all active datasets uploaded in this session (GET /api/v1/opspilot/datasets)
 */
export const fetchUploadedDatasets = async (): Promise<UploadedDatasetMeta[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/opspilot/datasets`);
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.warn('Could not fetch uploaded datasets:', err);
    return [];
  }
};
