import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def train_and_save():
    print("Starting ML Model Pipeline Training & Serialization...")
    
    # Explicit backend dir
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.abspath(os.path.join(script_dir, ".."))
    repo_root = os.path.abspath(os.path.join(backend_dir, ".."))
    
    data_path = os.path.join(repo_root, "data", "CICIDS2017_sample.csv")
    output_dir = os.path.join(backend_dir, "trained_model")
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Data Path: {data_path}")
    print(f"Output Dir: {output_dir}")
    
    df = pd.read_csv(data_path)
    df.columns = [col.strip() for col in df.columns]
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    
    label_col = 'Label'
    feature_cols = [c for c in df.columns if c != label_col]
    
    X = df[feature_cols].copy()
    y = df[label_col].copy()
    
    print(f"Dataset shape: {df.shape}")
    print(f"Total features: {len(feature_cols)}")
    
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print("Training Random Forest Classifier model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {acc * 100:.2f}%")
    
    model_path = os.path.join(output_dir, "model.joblib")
    scaler_path = os.path.join(output_dir, "scaler.joblib")
    encoder_path = os.path.join(output_dir, "label_encoder.joblib")
    meta_path = os.path.join(output_dir, "metadata.json")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(label_encoder, encoder_path)
    
    metadata = {
        "accuracy": float(acc),
        "total_samples": int(len(df)),
        "feature_names": feature_cols,
        "classes": [str(c) for c in label_encoder.classes_],
        "class_mapping": {int(idx): str(cls_name) for idx, cls_name in enumerate(label_encoder.classes_)}
    }
    
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print("Files in output_dir:", os.listdir(output_dir))
    print(f"Successfully saved artifacts to {output_dir}")

if __name__ == "__main__":
    train_and_save()
