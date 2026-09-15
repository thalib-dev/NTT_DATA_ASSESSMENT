FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML application code and model artifacts
COPY . .

EXPOSE 5000

ENV PORT=5000

CMD ["python", "app.py"]
