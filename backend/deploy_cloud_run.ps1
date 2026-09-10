# BizMonitor Cloud Run Deployment Script (PowerShell)
# This script deploys the FastAPI backend to Google Cloud Run

$ErrorActionPreference = "Stop"

$PROJECT_ID = if ($env:GCP_PROJECT) { $env:GCP_PROJECT } else { "bizmonitor-3d2d8" }
$REGION = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }
$SERVICE_NAME = "bizmonitor-backend"
$DATASET_ID = "bizmonitor_dw"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Deploying BizMonitor Backend to Google Cloud Run " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "GCP Project:  $PROJECT_ID"
Write-Host "Region:       $REGION"
Write-Host "Service Name: $SERVICE_NAME"
Write-Host "BigQuery DW:  $DATASET_ID"
Write-Host ""

# 1. Enable required APIs
Write-Host "[1/3] Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com bigquery.googleapis.com firestore.googleapis.com --project $PROJECT_ID

# 2. Deploy to Cloud Run from source
Write-Host "[2/3] Building and deploying container to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --source . `
    --project $PROJECT_ID `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --set-env-vars "GCP_PROJECT=$PROJECT_ID,BIGQUERY_DATASET=$DATASET_ID,BIGQUERY_LOCATION=US"

# 3. Output service URL
Write-Host "[3/3] Deployment complete! Retrieving live Service URL..." -ForegroundColor Green
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --project $PROJECT_ID --region $REGION --format "value(status.url)"
Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Backend deployed successfully!" -ForegroundColor Green
Write-Host " Cloud Run URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host " Use this URL as VITE_API_BASE_URL in your Vercel Project settings!" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
