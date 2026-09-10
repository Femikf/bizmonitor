import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from app.models.pipeline import PipelineResponse
from app.services.pandas_service import load_dataframe_from_bytes
from app.services.validation_service import validate_dataframe
from app.services.profiling_service import profile_dataframe
from app.services.normalization_service import normalize_dataframe
from app.services.bigquery_service import load_to_bigquery
from app.services.firestore_service import save_firestore_metadata
from app.services.analytics_service import run_bigquery_sandbox_analytics
from app.services.dataset_store import dataset_store
from app.services.opspilot_engine import generate_dynamic_opspilot_overview

router = APIRouter(prefix="/api/v1", tags=["Data Ingestion Pipeline"])


@router.post("/upload", response_model=PipelineResponse, status_code=status.HTTP_200_OK)
async def upload_dataset_pipeline(
    file: UploadFile = File(...),
    org_id: Optional[str] = Form("default-org"),
    user_id: Optional[str] = Form("system"),
    dataset_name: Optional[str] = Form(None),
):
    """
    End-to-End Data Ingestion Pipeline:
    Upload File -> Pandas Ingestion -> Validation -> Profiling -> Normalization -> BigQuery -> Firestore Metadata -> Analytics Engine
    """
    try:
        content = await file.read()
        file_name = file.filename or "dataset.csv"
        file_size = len(content)

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

        ds_id = f"ds_{uuid.uuid4().hex[:10]}"
        ds_name = dataset_name if dataset_name else file_name.rsplit(".", 1)[0].replace("_", " ").title()

        # Step 1: Pandas Ingestion
        df, _ = load_dataframe_from_bytes(content, file_name)

        # Step 2: Validation
        validation_res = validate_dataframe(df)

        # Step 3: Profiling
        profiling_res = profile_dataframe(df)

        # Step 4: Normalization
        norm_df, norm_res = normalize_dataframe(df)

        # Step 5: BigQuery Load / Staging
        bq_res = load_to_bigquery(
            df=norm_df,
            dataset_name=ds_name,
            org_id=org_id or "default-org",
            dataset_id=ds_id
        )

        # Step 6: Firestore Metadata Persistence
        firestore_res = save_firestore_metadata(
            org_id=org_id or "default-org",
            dataset_id=ds_id,
            name=ds_name,
            file_name=file_name,
            file_size_bytes=file_size,
            row_count=len(norm_df),
            column_count=len(norm_df.columns)
        )

        # Step 7: OpsPilot Analytics & Detection Engine (BigQuery Sandbox)
        analytics_res = run_bigquery_sandbox_analytics(
            df=norm_df,
            dataset_id=ds_id,
            dataset_name=ds_name,
            filename=file_name,
            org_id=org_id or "default-org"
        )

        # Step 8: Synthesize dynamic OpsPilot 5-Stage Overview and register in store
        opspilot_overview = generate_dynamic_opspilot_overview(
            df=df,
            dataset_name=ds_name,
            org_name=org_id or "My Business",
            dataset_id=ds_id
        )
        dataset_store.register_dataset(
            dataset_id=ds_id,
            df=df,
            metadata={
                "dataset_name": ds_name,
                "file_name": file_name,
                "rows": len(df),
                "cols": len(df.columns)
            },
            overview=opspilot_overview
        )

        return PipelineResponse(
            success=True,
            dataset_id=ds_id,
            dataset_name=ds_name,
            file_name=file_name,
            file_size_bytes=file_size,
            uploaded_at=datetime.now(timezone.utc).isoformat(),
            validation=validation_res,
            profiling=profiling_res,
            normalization=norm_res,
            bigquery=bq_res,
            firestore=firestore_res,
            analytics=analytics_res
        )


    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(err)}")
