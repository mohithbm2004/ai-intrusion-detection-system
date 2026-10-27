# System Architecture & Technical Specifications

## Aegis AI Intrusion Detection System (Full-Stack Architecture)

This document details the system design, data flow, ML model inference pipeline, normalized database schema, and deployment topology.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    User([Security Operator / User]) -->|HTTPS / Port 80| Frontend[React + TypeScript + Tailwind Frontend]
    Frontend -->|REST API / JWT Token| Backend[FastAPI Backend Application]
    
    subgraph Backend Core
        Backend --> Auth[JWT & Bcrypt Security Service]
        Backend --> ML[Random Forest ML Engine / Joblib Pipeline]
        Backend --> Export[Report Generator - CSV / XLSX / PDF]
        Backend --> DB[(PostgreSQL Database)]
    end

    subgraph ML Pipeline
        Dataset[(CICIDS2017 Sample Data)] --> Preprocessing[MinMax Scaler + Label Encoder]
        Preprocessing --> Classifier[Random Forest Classifier - 99.46% Acc]
        Classifier --> Artifacts[Serialized Joblib Artifacts]
        Artifacts --> ML
    end
```

---

## 2. Database ER Diagram (Normalized Schema)

```mermaid
erDiagram
    USERS ||--o{ UPLOADED_FILES : owns
    USERS ||--o{ PREDICTION_RECORDS : performs
    UPLOADED_FILES ||--o{ PREDICTION_RECORDS : contains

    USERS {
        int id PK
        string username UK
        string email UK
        string hashed_password
        boolean is_active
        datetime created_at
    }

    UPLOADED_FILES {
        int id PK
        string filename
        int user_id FK
        int file_size_bytes
        int total_flows
        int attack_count
        int normal_count
        datetime uploaded_at
    }

    PREDICTION_RECORDS {
        int id PK
        int user_id FK
        int file_id FK
        int flow_index
        string source_ip
        string destination_ip
        string prediction
        string attack_type
        boolean is_attack
        float confidence_score
        datetime timestamp
        json feature_snapshot
    }
```

---

## 3. CSV File Upload & Machine Learning Prediction Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant React as React Frontend
    participant API as FastAPI Backend
    participant ML as ML Service (Joblib)
    participant DB as PostgreSQL Database

    User->>React: Upload network packet flow CSV
    React->>API: POST /api/v1/predictions/upload (Multipart FormData)
    API->>API: Validate file extension & headers
    API->>ML: Extract 77 numeric features & run MinMaxScaler
    ML->>ML: Execute Random Forest predict() & predict_proba()
    ML-->>API: Return attack classifications & confidence scores (%)
    API->>DB: Persist UploadedFile & PredictionRecord objects
    DB-->>API: Confirm transaction commit
    API-->>React: Return JSON summary & preview sample predictions
    React-->>User: Render real-time threat dashboard & severity badges
```

---

## 4. API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new analyst account | No |
| `POST` | `/api/v1/auth/login` | Login and acquire JWT bearer token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes (JWT) |
| `POST` | `/api/v1/predictions/upload` | Upload packet flow CSV for ML batch prediction | Yes (JWT) |
| `POST` | `/api/v1/predictions/predict-single` | Real-time prediction for single flow | Yes (JWT) |
| `GET` | `/api/v1/predictions/dashboard-stats` | Aggregated threat analytics & metrics | Yes (JWT) |
| `GET` | `/api/v1/predictions/history` | Paginated, searchable prediction history | Yes (JWT) |
| `GET` | `/api/v1/predictions/export` | Download audit reports in CSV, XLSX, or PDF | Yes (JWT) |
