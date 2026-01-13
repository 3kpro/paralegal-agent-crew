
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# gcc needed for some python packages like numpy/pandas build
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ src/

# Create directory for persistent data (sqlite db, agent ckpts)
RUN mkdir -p /app/data

# Environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV MOCK_MODE=True

# Expose API port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
