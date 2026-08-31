import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import type {
  UserDocument,
  OrganizationDocument,
  MonitorDocument,
  TelemetryLogDocument,
  TransactionDocument,
  SchemaVersionDocument
} from "../types/firestore";
import { db } from "../config/firebase";

const CURRENT_SCHEMA_VERSION = "1.0.0";
const META_COLLECTION = "meta";
const VERSION_DOC_ID = "schema_version";

export interface MigrationResult {
  previousVersion: string | null;
  currentVersion: string;
  applied: boolean;
  message: string;
}

/**
 * Checks the current Firestore schema version and applies necessary migrations & seed structures.
 */
export const runFirestoreMigrations = async (): Promise<MigrationResult> => {
  try {
    const versionRef = doc(db, META_COLLECTION, VERSION_DOC_ID);
    const versionSnap = await getDoc(versionRef);

    let previousVersion: string | null = null;
    if (versionSnap.exists()) {
      const data = versionSnap.data() as SchemaVersionDocument;
      previousVersion = data.version;
    }

    if (previousVersion === CURRENT_SCHEMA_VERSION) {
      return {
        previousVersion,
        currentVersion: CURRENT_SCHEMA_VERSION,
        applied: false,
        message: `Database schema is up to date (v${CURRENT_SCHEMA_VERSION}).`
      };
    }

    // Execute Migration v1.0.0 (Initial baseline schema & seed setup)
    await applyMigrationV1();

    // Record applied version
    const versionData: SchemaVersionDocument = {
      version: CURRENT_SCHEMA_VERSION,
      appliedAt: serverTimestamp() as any,
      description: "Baseline Firestore schema v1.0.0 (users, organizations, monitors, telemetry_logs, transactions)"
    };
    await setDoc(versionRef, versionData);

    return {
      previousVersion,
      currentVersion: CURRENT_SCHEMA_VERSION,
      applied: true,
      message: `Successfully migrated database schema to v${CURRENT_SCHEMA_VERSION}.`
    };
  } catch (error: any) {
    console.error("Firestore Migration Failed:", error);
    return {
      previousVersion: null,
      currentVersion: CURRENT_SCHEMA_VERSION,
      applied: false,
      message: `Migration error: ${error?.message || String(error)}`
    };
  }
};

/**
 * Baseline Migration v1.0.0: Seed default records if collections are empty.
 */
const applyMigrationV1 = async (): Promise<void> => {
  // 1. Seed Organization document
  const orgsSnap = await getDocs(collection(db, "organizations"));
  if (orgsSnap.empty) {
    const defaultOrg: OrganizationDocument = {
      id: "org_acme_enterprise",
      name: "Acme Enterprise",
      industry: "Retail",
      currency: "INR",
      country: "India",
      plan: "enterprise",
      ownerId: "system_owner",
      createdAt: serverTimestamp() as any
    };
    await setDoc(doc(db, "organizations", defaultOrg.id), defaultOrg);
  }

  // 2. Seed Default User profile
  const usersSnap = await getDocs(collection(db, "users"));
  if (usersSnap.empty) {
    const defaultUser: UserDocument = {
      uid: "system_admin_01",
      name: "System Administrator",
      email: "admin@bizmonitor.io",
      organizationId: "org_acme_enterprise",
      companyId: "org_acme_enterprise",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      createdAt: serverTimestamp() as any
    };
    await setDoc(doc(db, "users", defaultUser.uid), defaultUser);
  }

  // 3. Seed Baseline Service Monitors
  const monitorsSnap = await getDocs(collection(db, "monitors"));
  if (monitorsSnap.empty) {
    const defaultMonitors: MonitorDocument[] = [
      {
        id: "mon_api_gateway",
        name: "Primary API Gateway",
        url: "https://api.bizmonitor.io/v1/health",
        type: "HTTP",
        status: "operational",
        checkIntervalSeconds: 30,
        uptimePercentage: 99.98,
        companyId: "org_acme_enterprise",
        createdAt: serverTimestamp() as any
      },
      {
        id: "mon_auth_service",
        name: "Auth Service Cluster",
        url: "https://auth.bizmonitor.io/health",
        type: "HTTP",
        status: "operational",
        checkIntervalSeconds: 60,
        uptimePercentage: 100.0,
        companyId: "org_acme_enterprise",
        createdAt: serverTimestamp() as any
      },
      {
        id: "mon_db_primary",
        name: "Primary PostgreSQL DB",
        url: "db-primary.bizmonitor.internal:5432",
        type: "TCP",
        status: "operational",
        checkIntervalSeconds: 15,
        uptimePercentage: 99.95,
        companyId: "org_acme_enterprise",
        createdAt: serverTimestamp() as any
      }
    ];

    for (const mon of defaultMonitors) {
      await setDoc(doc(db, "monitors", mon.id), mon);
    }
  }

  // 4. Seed Telemetry Logs
  const logsSnap = await getDocs(collection(db, "telemetry_logs"));
  if (logsSnap.empty) {
    const defaultLogs: TelemetryLogDocument[] = [
      {
        id: "log_01",
        monitorId: "mon_api_gateway",
        statusCode: 200,
        responseTimeMs: 38,
        cpuLoad: 24.5,
        ramUsage: 62.1,
        timestamp: serverTimestamp() as any
      },
      {
        id: "log_02",
        monitorId: "mon_auth_service",
        statusCode: 200,
        responseTimeMs: 45,
        cpuLoad: 31.0,
        ramUsage: 58.4,
        timestamp: serverTimestamp() as any
      }
    ];

    for (const logItem of defaultLogs) {
      await setDoc(doc(db, "telemetry_logs", logItem.id), logItem);
    }
  }

  // 5. Seed Transactions
  const txnsSnap = await getDocs(collection(db, "transactions"));
  if (txnsSnap.empty) {
    const defaultTransactions: TransactionDocument[] = [
      {
        id: "txn_1001",
        organizationId: "org_acme_enterprise",
        amount: 299.0,
        currency: "USD",
        status: "succeeded",
        description: "Enterprise Subscription - Monthly Renewal",
        timestamp: serverTimestamp() as any
      }
    ];

    for (const txn of defaultTransactions) {
      await setDoc(doc(db, "transactions", txn.id), txn);
    }
  }
};
