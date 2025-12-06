# Migration Plan: Viral Score™ Heuristic to Cloud Run ML Model

**Author:** Gemini Code Assist
**Status:** Proposed
**Date:** November 15, 2024

## 1. Objective

This document outlines the phased plan to migrate the `Viral Score™` from its current heuristic-based algorithm (`lib/viral-score.ts`) to a superior machine learning model served via a cost-effective, serverless Google Cloud Run service.

This approach solves the "cold start" problem by using a synthetically generated dataset and provides a production-ready ML feature with a **$0 idle cost**, making it ideal for the beta launch.

---

## 2. Architecture Overview

The new architecture will consist of three main parts:

1.  **Offline Model Training (Vertex AI):** A one-time process to train the model.
2.  **Online Prediction Service (Cloud Run):** A serverless API that loads the trained model and serves predictions on demand.
3.  **Application Integration (Next.js API):** The existing Trends API will be updated to call the new Cloud Run service.

!Architecture Diagram
*(Image Credit: Google Cloud Blog - Illustrates the general pattern)*

---

## 3. Phase 1: Data Generation & Model Training

This phase is performed once to create the initial ML model.

*   **Step 1.1: Generate Synthetic Dataset**
    *   **Action:** Execute the `scripts/generate-training-data.ts` script.
    *   **Command:** `npx tsx ./scripts/generate-training-data.ts`
    *   **Outcome:** A `training-data.csv` file is created in the `/scripts` directory. This file contains 1,000+ high-quality, AI-labeled trend examples.

*   **Step 1.2: Train AutoML Model in Vertex AI**
    *   **Action:** In the Google Cloud Console, navigate to **Vertex AI > Datasets**.
    *   Create a new `Tabular` dataset and upload `training-data.csv`.
    *   Once the dataset is created, select **Train New Model**.
    *   **Configuration:**
        *   **Objective:** Regression
        *   **Target Column:** `groundTruthViralScore`
        *   **Training Budget:** 1 node hour (minimum).
    *   **Outcome:** A trained AutoML model will be available in the Vertex AI Model Registry.

*   **Step 1.3: Export the Trained Model**
    *   **Action:** From the Vertex AI Model Registry, select the newly trained model.
    *   Find the **Export Model** option.
    *   **Destination:** Export the model as a `TensorFlow SavedModel` to a new Google Cloud Storage (GCS) bucket.
    *   **Outcome:** The model artifacts will be stored in a GCS bucket, ready for the prediction service to use.

---

## 4. Phase 2: Create the Serverless Prediction Service

This phase creates the API that will serve the model. We will use Python with Flask as it's lightweight and well-supported.

*   **Step 2.1: Create a Simple Flask API**
    *   **Action:** Create a new directory `services/viral-score-api`.
    *   Inside, create a Python file (`main.py`) that:
        1.  Loads the exported model from the GCS bucket on startup.
        2.  Defines a `/predict` endpoint that accepts a JSON payload with trend features (`title`, `traffic`, `sources`, `freshnessHours`).
        3.  Uses the loaded model to make a prediction.
        4.  Returns the predicted `viralScore` as a JSON response.

*   **Step 2.2: Dockerize the Service**
    *   **Action:** Create a `Dockerfile` in the `services/viral-score-api` directory.
    *   The Dockerfile will:
        1.  Use a Python base image.
        2.  Install dependencies (Flask, Google Cloud Storage, TensorFlow).
        3.  Copy the `main.py` file into the container.
        4.  Define the command to run the Flask application.

*   **Step 2.3: Deploy to Cloud Run**
    *   **Action:** Use the `gcloud` CLI to build the container and deploy it to Cloud Run.
    *   **Command:** `gcloud run deploy viral-score-service --source . --region [YOUR_REGION] --allow-unauthenticated`
    *   **Outcome:** A publicly accessible URL for the prediction service will be generated. This service will automatically scale to zero when not in use.

---

## 5. Phase 3: Application Integration

This phase connects the main TrendPulse application to the new ML service.

*   **Step 3.1: Add Environment Variable**
    *   **Action:** Add the new Cloud Run service URL to the `.env` file and Vercel environment variables.
    *   **Variable:** `VIRAL_SCORE_API_URL="https://viral-score-service-....run.app"`

*   **Step 3.2: Create a New Prediction Function**
    *   **Action:** In `lib/viral-score.ts`, create a new async function `predictViralScoreML`.
    *   This function will make a `fetch` POST request to the `VIRAL_SCORE_API_URL` with the trend data.
    *   It will handle the response and return the score in the `TrendWithViralScore` format.

*   **Step 3.3: Update the Trends API**
    *   **Action:** Modify `app/api/trends/route.ts`.
    *   Inside `getRealTrendingData` and `generateTrendsWithGemini`, replace the call to the local `calculateViralScore` with an `await` call to the new `predictViralScoreML`.
    *   **Recommendation:** Use a feature flag (`process.env.USE_ML_VIRAL_SCORE === 'true'`) to easily switch between the old heuristic and the new ML model for A/B testing or safe rollback.

---

## 6. Phase 4: Deprecation & Cleanup

*   **Step 4.1: Monitor Performance**
    *   **Action:** After deployment, monitor the Cloud Run service logs and the application's performance to ensure stability and accuracy.

*   **Step 4.2: Deprecate Heuristic Code**
    *   **Action:** Once the ML model is confirmed to be stable and superior, remove the old `calculate...Score` functions from `lib/viral-score.ts`.

*   **Step 4.3: Update Documentation**
    *   **Action:** Update `STATEMENT_OF_TRUTH.md` to change the status of "Viral Score™ ML Model" from "not yet built" to "active" and document the new Cloud Run architecture.