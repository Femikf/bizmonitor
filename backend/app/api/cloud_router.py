import os
import json
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/cloud", tags=["GCP Live Infrastructure"])


def resolve_credentials():
    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json")
    if not os.path.isabs(creds_path):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidate = os.path.join(backend_dir, creds_path)
        if os.path.exists(candidate):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = candidate
            return candidate
        else:
            # Running in Cloud Run or environment without local service-account.json
            os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
            return None
    if os.path.exists(creds_path):
        return creds_path
    os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
    return None


@router.get("/status")
def get_cloud_infrastructure_status() -> Dict[str, Any]:
    """
    Checks and reports live Google Cloud Platform connectivity (BigQuery & Firestore).
    """
    creds_file = resolve_credentials()
    gcp_project = os.environ.get("GCP_PROJECT") or os.environ.get("GOOGLE_CLOUD_PROJECT", "bizmonitor-3d2d8")
    bq_dataset_id = os.environ.get("BIGQUERY_DATASET", "bizmonitor_dw")
    bq_location = os.environ.get("BIGQUERY_LOCATION", "US")

    sa_email = "cloud_run_adc (Application Default Credentials)"
    if creds_file and os.path.exists(creds_file):
        try:
            with open(creds_file, "r") as f:
                sa_data = json.load(f)
                sa_email = sa_data.get("client_email", "service_account")
        except Exception:
            pass
    elif not os.environ.get("K_SERVICE"):
        # If not running in Cloud Run and no creds file
        sa_email = "not_configured"

    bq_status = "offline"
    bq_details = ""
    try:
        from google.cloud import bigquery
        client = bigquery.Client(project=gcp_project)
        dataset_ref = bigquery.DatasetReference(gcp_project, bq_dataset_id)
        try:
            client.get_dataset(dataset_ref)
        except Exception:
            ds = bigquery.Dataset(dataset_ref)
            ds.location = bq_location
            client.create_dataset(ds, exists_ok=True)
        bq_status = "connected"
        bq_details = f"Dataset '{bq_dataset_id}' ready in project '{gcp_project}'"
    except Exception as e:
        bq_status = "simulated"
        bq_details = str(e)

    fs_status = "offline"
    fs_details = ""
    try:
        from google.cloud import firestore
        db = firestore.Client(project=gcp_project)
        doc_ref = db.collection("_healthcheck").document("ping")
        doc_ref.set({"ping": True})
        fs_status = "connected"
        fs_details = f"Firestore connected to project '{gcp_project}'"
    except Exception as e:
        fs_status = "simulated"
        fs_details = str(e)

    is_live = bq_status == "connected" and fs_status == "connected"

    return {
        "mode": "live" if is_live else "simulated",
        "project_id": gcp_project,
        "service_account": sa_email,
        "bigquery": {
            "status": bq_status,
            "dataset": bq_dataset_id,
            "location": bq_location,
            "details": bq_details
        },
        "firestore": {
            "status": fs_status,
            "details": fs_details
        }
    }
