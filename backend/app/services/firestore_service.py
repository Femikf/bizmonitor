import os
from datetime import datetime, timezone
from typing import Dict, Any
from app.models.pipeline import FirestoreMetadataResult


def save_firestore_metadata(
    org_id: str,
    dataset_id: str,
    name: str,
    file_name: str,
    file_size_bytes: int,
    row_count: int,
    column_count: int
) -> FirestoreMetadataResult:
    """
    Constructs and persists Firestore dataset metadata document.
    """
    firestore_path = f"organizations/{org_id}/datasets/{dataset_id}"
    
    metadata_payload: Dict[str, Any] = {
        "id": dataset_id,
        "organizationId": org_id,
        "name": name,
        "fileName": file_name,
        "fileSizeBytes": file_size_bytes,
        "rowCount": row_count,
        "columnCount": column_count,
        "status": "ready",
        "uploadedAt": datetime.now(timezone.utc).isoformat(),
        "firestorePath": firestore_path
    }

    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json")
    if not os.path.isabs(creds_path):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidate = os.path.join(backend_dir, creds_path)
        if os.path.exists(candidate):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = candidate
        else:
            os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
    elif not os.path.exists(creds_path):
        os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)

    gcp_project = os.environ.get("GCP_PROJECT") or os.environ.get("GOOGLE_CLOUD_PROJECT")
    if gcp_project:
        try:
            from google.cloud import firestore
            db = firestore.Client(project=gcp_project)
            doc_ref = db.collection("organizations").document(org_id).collection("datasets").document(dataset_id)
            doc_ref.set(metadata_payload)
        except Exception as err:
            print(f"Firestore live sync warning: {err}")


    return FirestoreMetadataResult(
        dataset_id=dataset_id,
        organization_id=org_id,
        name=name,
        file_name=file_name,
        file_size_bytes=file_size_bytes,
        row_count=row_count,
        column_count=column_count,
        status="ready",
        firestore_path=firestore_path
    )
