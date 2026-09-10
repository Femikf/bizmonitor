FROM python:3.11-slim

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies if needed, then copy requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY app ./app

# Expose standard Cloud Run port
ENV PORT=8080
EXPOSE 8080

# Execute uvicorn with dynamic port binding for Google Cloud Run
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
