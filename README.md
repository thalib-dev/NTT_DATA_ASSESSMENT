# Dynamic Machine Data Management & Local Risk Prediction

> **NTT Data Technical Assessment Solution**
> An end-to-end microservice application for dynamic machine field configuration, record management, and offline local Machine Learning risk prediction.

---

## 📋 Table of Contents
1. [Executive Overview](#-executive-overview)
2. [Technology Stack](#-technology-stack)
3. [System Architecture & Communication Flow](#-system-architecture--communication-flow)
4. [Setup & Execution Instructions](#-setup--execution-instructions)
   - [Option 1: Single-Command Docker Setup (Recommended)](#option-1-single-command-docker-setup-recommended)
   - [Option 2: Local Manual Execution](#option-2-local-manual-execution)
5. [Dynamic Field Implementation & Database Design](#-dynamic-field-implementation--database-design)
6. [Dynamic Field Challenge (Humidity Scenario)](#-dynamic-field-challenge-humidity-scenario)
7. [API Endpoints Reference](#-api-endpoints-reference)

---

## 🎯 Executive Overview

This application fulfills all requirements specified for managing machine operational data and assessing machine failure risk levels dynamically:

- **Dynamic Field Configuration:** Users can define and modify machine attributes (Text, Number, Dropdown) at runtime without code changes or database migrations.
- **Machine Record CRUD:** Complete management interface (Create, Read, Update, Delete) with dynamically generated data entry forms.
- **Local Machine Learning:** Offline Python risk prediction model (`Low Risk`, `Medium Risk`, `High Risk`) running via Flask. No external or cloud AI APIs are used.
- **Microservices Architecture:** Decoupled Express.js REST API backend and Python Flask ML service containerized with Docker Compose.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend API** | Node.js (v22), Express.js | Port `4000`. Handles REST API routes, field validation, and ML service integration. |
| **Database** | SQLite3 (`better-sqlite3`) | Embedded transactional database using JSON document storage for dynamic fields. |
| **Machine Learning** | Python 3.11, Flask, Scikit-Learn | Port `5000`. Random Forest Classifier model (`train_model.py`, `app.py`). |
| **Containerization** | Docker & Docker Compose | Multi-container setup (`Dockerfile` per service, `docker-compose.yml`). |

---

## 🏗️ System Architecture & Communication Flow

The system employs a decoupled microservice model:

```
┌─────────────────────────────────────────────────────────┐
│                      Client / Web UI                    │
└────────────────────────────┬────────────────────────────┘
                             │ REST API Requests
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Express Backend API (Port 4000)             │
│  - Field Configuration Validation                       │
│  - SQLite Transaction Handler                           │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ SQLite Database          │   │ Python ML Service        │
│ (Dynamic JSON Payload)   │   │ (Flask - Port 5000)      │
│  - field_configurations  │   │  - Scikit-Learn Forest   │
│  - machines              │   │  - Local Risk Prediction │
└──────────────────────────┘   └──────────────────────────┘
```

### End-to-End Prediction Flow:
1. **User / Client** triggers a risk assessment request with machine metrics (e.g. Temperature, Pressure, Vibration, Humidity).
2. **Express Backend (`:4000`)** retrieves machine data from SQLite and forwards the payload to the **Flask ML Service (`:5000`)**.
3. **Python ML Model** processes feature vectors using pre-trained encodings and returns the risk level (`Low`, `Medium`, `High`) with confidence scores.
4. **Backend** passes the result back to the client UI.

---

## 🚀 Setup & Execution Instructions

### Option 1: Single-Command Docker Setup (Recommended)

Ensure Docker Desktop is running, then run:

```bash
docker-compose up --build
```

**Services automatically started:**
- **Express Backend API:** [http://localhost:4000](http://localhost:4000)
- **Python ML Service:** [http://localhost:5000](http://localhost:5000)
- **Frontend UI:** [http://localhost:3000](http://localhost:3000)

---

### Option 2: Local Manual Execution

#### 1. Start Python ML Microservice (Port 5000)
```bash
cd ml
pip install -r requirements.txt
python train_model.py    # Trains Random Forest model & saves model.pkl
python app.py            # Starts Flask API server
```

#### 2. Start Express Backend API (Port 4000)
```bash
cd backend
npm install
npm run dev              # Starts Express backend on http://localhost:4000
```

#### 3. Start Next.js Frontend UI (Port 3000)
```bash
cd frontend
npm install
npm run dev              # Starts Next.js UI on http://localhost:3000
```

---

## 🧩 Dynamic Field Implementation & Database Design

To allow users to add new fields (e.g. `Humidity`, `Oil Pressure`) without performing SQL `ALTER TABLE` schema migrations, the database uses an **EAV / JSON Document Pattern**:

### 1. `field_configurations` Table
Stores definitions for configured fields:
```sql
CREATE TABLE IF NOT EXISTS field_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  field_name TEXT UNIQUE NOT NULL,
  field_type TEXT CHECK(field_type IN ('text', 'number', 'dropdown')) NOT NULL,
  is_required INTEGER DEFAULT 0,
  dropdown_options TEXT, -- JSON array string e.g. ["Low", "Medium", "High"]
  display_order INTEGER DEFAULT 0
);
```

### 2. `machines` Table
Stores machine records with dynamic key-value attributes as a JSON document:
```sql
CREATE TABLE IF NOT EXISTS machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL, -- Stored as JSON: {"Temperature": 85, "Pressure": 120, "Vibration": "High", "Humidity": 45}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Key Benefit:** Any new field defined in `field_configurations` is instantly supported in machine records and dynamic forms without changing database structure or restarting services.

---

## 💡 Dynamic Field Challenge (Humidity Scenario)

### Scenario Description
Initially, the machine risk model operates on 3 features:
- `Temperature` (Number)
- `Pressure` (Number)
- `Vibration` (Dropdown: `Low`, `Medium`, `High`)

Later, a user dynamically adds a new field:
- `Humidity` (Number)

---

### 1. How the Application Handles the New Field
- **Database & Backend:** The new `Humidity` field definition is saved in `field_configurations`. When a machine record is created or updated, the Express backend validates `Humidity` against the configuration rules and saves it into the JSON `data` attribute in the `machines` table.
- **System Stability:** Machine CRUD operations work immediately with no database migration required.

---

### 2. Whether the Existing ML Model Can Use It
- **Current Model Behavior:** The active Random Forest model (`train_model.py`) is trained on a defined feature matrix (`Temperature`, `Pressure`, `Vibration`, `Humidity`).
- **Graceful Fallback & Protection:** If an incoming payload contains a newly registered field that was not part of the trained model, or if an optional field is omitted, the Flask API ([ml/app.py](file:///d:/resume/NTT%20DATA%20ASSESSMENT/superdesign-design/ml/app.py)) dynamically verifies keys against `model.feature_names_in_`:
  - Missing features are populated with safe default imputations (historical median/mode).
  - Unrecognized new features are bypassed safely so prediction endpoints **never crash**.

---

### 3. Requirements for the ML Model to Incorporate New Fields in the Future
To fully leverage newly added dynamic fields (such as `Humidity` or future sensor fields) for risk prediction, the following 3-step pipeline automation would be implemented:

1. **Continuous Data Logging:** Collect machine records with the new field (`Humidity`) over time in SQLite to accumulate historical observations with known outcomes.
2. **Dynamic Feature Engineering (`train_model.py`):** Update the training script to query `field_configurations` for numeric and categorical fields, dynamically building the pandas DataFrame feature matrix:
   ```python
   # Extract dynamic numerical and categorical columns from DB
   X = df[dynamic_feature_columns]
   ```
3. **Automated Retraining & Hot-Reload:** Trigger model retraining periodically or on-demand via a backend webhook (`POST /api/retrain`). The script re-fits the `RandomForestClassifier`, serializes updated `model.pkl` and `encoders.pkl`, and hot-reloads the model into Flask memory.

---

## 📡 API Endpoints Reference

### Field Configurations
- `GET /api/fields` — List all dynamic field configurations.
- `POST /api/fields` — Create a new dynamic field (Name, Type, Required status, Dropdown options).
- `PUT /api/fields/:id` — Update field configuration.
- `DELETE /api/fields/:id` — Remove field configuration.

### Machine Records
- `GET /api/machines` — List all machine records with parsed JSON attributes.
- `GET /api/machines/:id` — Fetch single machine record details.
- `POST /api/machines` — Create new machine record (validated against active fields).
- `PUT /api/machines/:id` — Update existing machine record.
- `DELETE /api/machines/:id` — Delete machine record.

### Risk Prediction
- `POST /api/predict` — Send machine data payload to ML model; returns predicted risk level (`Low`, `Medium`, `High`) and probabilities.
- `GET /api/ml-health` — Check status of Python Flask ML service.
- `GET /api/health` — Check backend status.

---
