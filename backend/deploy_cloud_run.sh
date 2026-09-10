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

echo "[1/3] Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com bigquery.googleapis.com firestore.googleapis.com --project "$PROJECT_ID"

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
