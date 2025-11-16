import os
import logging
import tempfile
from flask import Flask, request, jsonify
import tensorflow as tf
from google.cloud import storage

# --- Configuration ---

# Set up logging
logging.basicConfig(level=logging.INFO)

# Environment variables
BUCKET_NAME = os.environ.get("GCS_BUCKET", "viral-score-models")
MODEL_PATH = os.environ.get("MODEL_PATH", "v1/")
PORT = int(os.environ.get("PORT", 8080))

app = Flask(__name__)

# --- Model Loading ---

def download_model_from_gcs(bucket_name, model_path):
    """Downloads a model from GCS to a temporary local directory."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blobs = bucket.list_blobs(prefix=model_path)

        # Create a temporary directory to store the model
        temp_model_dir = tempfile.mkdtemp()
        logging.info(f"Created temporary model directory: {temp_model_dir}")

        for blob in blobs:
            if not blob.name.endswith("/"):
                destination_file_name = os.path.join(temp_model_dir, os.path.basename(blob.name))
                logging.info(f"Downloading model file: {blob.name} to {destination_file_name}")
                blob.download_to_filename(destination_file_name)

        logging.info("Model download complete.")
        return temp_model_dir

    except Exception as e:
        logging.error(f"Failed to download model from GCS: {e}", exc_info=True)
        raise

# Load the model on application startup to avoid reloading on every request.
# This is a key optimization for serverless environments.
try:
    logging.info("Starting model download from GCS...")
    local_model_path = download_model_from_gcs(BUCKET_NAME, MODEL_PATH)
    model = tf.saved_model.load(local_model_path)
    # The 'serving_default' key is standard for TensorFlow SavedModels.
    predictor = model.signatures["serving_default"]
    logging.info("✅ Model loaded successfully and is ready to serve predictions.")
except Exception as e:
    logging.error("❌ CRITICAL: Model could not be loaded at startup. The application will not be able to serve predictions.")
    model = None
    predictor = None

# --- API Endpoints ---

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to confirm the service is running."""
    if predictor:
        return jsonify({"status": "ok", "message": "Service is running and model is loaded."}), 200
    else:
        return jsonify({"status": "error", "message": "Service is running but model failed to load."}), 500

@app.route("/predict", methods=["POST"])
def predict():
    """Accepts trend data and returns a predicted viral score."""
    if not predictor:
        return jsonify({"error": "Model is not loaded. Cannot serve predictions."}), 503 # Service Unavailable

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        # Validate required fields
        required_fields = ["title", "traffic", "sources", "freshnessHours"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing one or more required fields: {required_fields}"}), 400

        # Preprocess input data to match the model's expected format.
        # AutoML Tabular models expect a dictionary of tensors.
        input_data = {
            "title": tf.constant([str(data["title"])]),
            "traffic": tf.constant([str(data["traffic"])]),
            "sources": tf.constant([",".join(data["sources"])]), # Join array into comma-separated string
            "freshnessHours": tf.constant([float(data["freshnessHours"])])
        }

        # Get prediction from the model
        predictions = predictor(**input_data)

        # The output key 'score' is typical for AutoML regression models.
        # It might need adjustment if the model's signature is different.
        predicted_score = predictions['score'].numpy()[0]

        # Format the response as requested
        response = {
            "viralScore": round(float(predicted_score), 2),
            # Confidence is not a standard output for regression models.
            # Returning a placeholder as per the prompt's requirements.
            "confidence": 0.99
        }

        return jsonify(response), 200

    except Exception as e:
        logging.error(f"Prediction failed: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred during prediction."}), 500


if __name__ == "__main__":
    # This block is for local development and will not be used by Gunicorn on Cloud Run.
    app.run(host="0.0.0.0", port=PORT, debug=True)