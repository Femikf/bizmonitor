import type { Timestamp } from "firebase/firestore";

/**
 * User document schema stored in collection `users/{uid}`
 */
export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  organizationId: string;
  companyId?: string; // Legacy alias for organizationId
  role: 'owner' | 'manager' | 'analyst' | 'admin' | 'viewer';
  avatar?: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

/**
 * Organization document schema stored in collection `organizations/{orgId}`
 */
export interface OrganizationDocument {
  id: string;
  name: string;
  industry: string;
  currency: string;
  country: string;
  ownerId: string;
  plan?: 'free' | 'pro' | 'enterprise';
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

/**
 * Dataset document schema stored in collection `organizations/{orgId}/datasets/{datasetId}`
 */
export interface DatasetDocument {
  id: string;
  organizationId: string;
  name: string;
  fileName: string;
  fileSizeBytes: number;
  rowCount: number;
  columns: string[];
  uploadedByUid: string;
  uploadedByName: string;
  uploadedAt: Timestamp | string;
  status: 'ready' | 'processing' | 'error';
}

/**
 * Insight document schema stored in collection `organizations/{orgId}/insights/{insightId}`
 */
export interface InsightDocument {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  category: 'revenue' | 'inventory' | 'customer' | 'general';
  severity: 'low' | 'medium' | 'high';
  createdAt: Timestamp | string;
}

/**
 * Recommendation document schema stored in collection `organizations/{orgId}/recommendations/{recId}`
 */
export interface RecommendationDocument {
  id: string;
  organizationId: string;
  action: string;
  expectedImpact: string;
  priority: 'p1' | 'p2' | 'p3';
  status: 'open' | 'in_progress' | 'completed';
  createdAt: Timestamp | string;
}

/**
 * Conversation document schema stored in collection `organizations/{orgId}/conversations/{convId}`
 */
export interface ConversationDocument {
  id: string;
  organizationId: string;
  title: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: Timestamp | string;
  }>;
  createdAt: Timestamp | string;
}

/**
 * Monitor document schema stored in collection `monitors/{monitorId}`
 */
export interface MonitorDocument {
  id: string;
  name: string;
  url: string;
  type: 'HTTP' | 'PING' | 'TCP' | 'DNS';
  status: 'operational' | 'degraded' | 'down';
  checkIntervalSeconds: number;
  lastCheckedAt?: Timestamp | string;
  uptimePercentage: number;
  companyId: string;
  createdAt: Timestamp | string;
}

/**
 * Telemetry log document schema stored in collection `telemetry_logs/{logId}`
 */
export interface TelemetryLogDocument {
  id: string;
  monitorId: string;
  statusCode: number;
  responseTimeMs: number;
  cpuLoad: number;
  ramUsage: number;
  timestamp: Timestamp | string;
}

/**
 * Transaction document schema stored in collection `transactions/{txnId}`
 */
export interface TransactionDocument {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  description: string;
  timestamp: Timestamp | string;
}

/**
 * Schema version document stored in `meta/schema_version`
 */
export interface SchemaVersionDocument {
  version: string;
  appliedAt: Timestamp | string;
  description: string;
}

