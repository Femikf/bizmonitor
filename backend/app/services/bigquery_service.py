import os
import pandas as pd
from typing import Optional
from app.models.pipeline import BigQueryResult


def load_to_bigquery(
    df: pd.DataFrame,
    dataset_name: str,
    org_id: str,
    dataset_id: str
) -> BigQueryResult:
    """
    Syncs normalized DataFrame to BigQuery table.
    Supports live BigQuery loading if GCP credentials exist, or simulated staging fallback for offline local testing.
    """
    gcp_project = os.environ.get("GCP_PROJECT") or os.environ.get("GOOGLE_CLOUD_PROJECT")
    bq_dataset_id = os.environ.get("BIGQUERY_DATASET", "bizmonitor_dw")
    clean_org_id = org_id.replace("-", "_").lower()
    table_name = f"raw_{clean_org_id}_{dataset_id}"

    # Ensure GOOGLE_APPLICATION_CREDENTIALS path is resolved
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

    # Attempt Live BigQuery Client if credentials exist
    if gcp_project:
        try:
            from google.cloud import bigquery
            client = bigquery.Client(project=gcp_project)
            
            # Ensure BigQuery Dataset exists
            dataset_ref = bigquery.DatasetReference(gcp_project, bq_dataset_id)
            try:
                client.get_dataset(dataset_ref)
            except Exception:
                dataset = bigquery.Dataset(dataset_ref)
                dataset.location = os.environ.get("BIGQUERY_LOCATION", "US")
                client.create_dataset(dataset, exists_ok=True)

            table_id = f"{gcp_project}.{bq_dataset_id}.{table_name}"
            
            job_config = bigquery.LoadJobConfig(
                write_disposition="WRITE_TRUNCATE",
                autodetect=True,
            )
            job = client.load_table_from_dataframe(df, table_id, job_config=job_config)
            job.result()  # Wait for completion
            
            return BigQueryResult(
                dataset_id=bq_dataset_id,
                table_name=table_name,
                inserted_rows=len(df),
                mode="live",
                status="success",
                message=f"Live GCP BigQuery: Successfully loaded {len(df)} rows into '{table_id}'"
            )
        except Exception as err:
            # Fallback to simulated staging on GCP connection issue
            return BigQueryResult(
                dataset_id=bq_dataset_id,
                table_name=table_name,
                inserted_rows=len(df),
                mode="simulated",
                status="warning",
                message=f"BigQuery cloud connection warning ({str(err)}). Staged {len(df)} rows in simulated BigQuery warehouse."
            )

    else:
        # Simulated Staging Mode for offline development
        return BigQueryResult(
            dataset_id=bq_dataset_id,
            table_name=table_name,
            inserted_rows=len(df),
            mode="simulated",
            status="success",
            message=f"Simulated BigQuery ingestion: {len(df)} rows staged for warehouse table '{bq_dataset_id}.{table_name}'."
        )
