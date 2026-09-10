#!/usr/bin/env bash
# BizMonitor Cloud Run Deployment Script (Bash / Cloud Shell)
set -e

PROJECT_ID="${GCP_PROJECT:-bizmonitor-3d2d8}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="bizmonitor-backend"
DATASET_ID="bizmonitor_dw"

echo "===================================================="
echo " Deploying BizMonitor Backend to Google Cloud Run "
echo "===================================================="
echo "GCP Project:  $PROJECT_ID"
echo "Region:       $REGION"
echo "Service Name: $SERVICE_NAME"
echo "BigQuery DW:  $DATASET_ID"
echo ""

echo "[1/3] Enabling required Google Cloud APIs and configuring permissions..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com bigquery.googleapis.com firestore.googleapis.com --project "$PROJECT_ID"

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Configuring permissions for build service account: $COMPUTE_SA"
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$COMPUTE_SA" --role="roles/storage.objectViewer" --condition=None >/dev/null 2>&1 || true
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$COMPUTE_SA" --role="roles/logging.logWriter" --condition=None >/dev/null 2>&1 || true
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$COMPUTE_SA" --role="roles/artifactregistry.writer" --condition=None >/dev/null 2>&1 || true

echo "[2/3] Building and deploying container to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "GCP_PROJECT=$PROJECT_ID,BIGQUERY_DATASET=$DATASET_ID,BIGQUERY_LOCATION=US"

echo "[3/3] Deployment complete! Retrieving live Service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format "value(status.url)")

echo ""
echo "===================================================="
echo " Backend deployed successfully!"
echo " Cloud Run URL: $SERVICE_URL"
echo " Use this URL as VITE_API_BASE_URL in your Vercel Project settings!"
echo "===================================================="
