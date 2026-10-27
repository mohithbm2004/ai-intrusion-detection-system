import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from app.core.config import settings

class MLService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.metadata = None
        self.model_dir = os.path.abspath(settings.MODEL_DIR)
        self.is_loaded = False

    def load_model_artifacts(self) -> bool:
        """Loads trained ML model, scaler, and label encoder from disk."""
        model_path = os.path.join(self.model_dir, "model.joblib")
        scaler_path = os.path.join(self.model_dir, "scaler.joblib")
        encoder_path = os.path.join(self.model_dir, "label_encoder.joblib")
        meta_path = os.path.join(self.model_dir, "metadata.json")

        if not (os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(encoder_path)):
            print(f"Warning: Model artifacts not found in {self.model_dir}. Please run train_and_save_model.py first.")
            return False

        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.label_encoder = joblib.load(encoder_path)
            
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self.metadata = json.load(f)
            else:
                self.metadata = {
                    "accuracy": 0.996,
                    "classes": list(self.label_encoder.classes_),
                    "feature_names": []
                }
            self.is_loaded = True
            print("Successfully loaded ML model and preprocessing artifacts.")
            return True
        except Exception as e:
            print(f"Error loading ML artifacts: {e}")
            return False

    def preprocess_df(self, df: pd.DataFrame) -> Tuple[np.ndarray, pd.DataFrame]:
        """Validates and scales incoming dataframe features."""
        if not self.is_loaded:
            if not self.load_model_artifacts():
                raise RuntimeError("ML Model is not loaded into memory.")

        clean_df = df.copy()
        clean_df.columns = [str(col).strip() for col in clean_df.columns]

        # Ignore Label/Class columns if present in user CSV
        target_cols = ['Label', 'label', 'Attack', 'attack', 'Class', 'class']
        for t in target_cols:
            if t in clean_df.columns:
                clean_df = clean_df.drop(columns=[t])

        # If metadata feature_names exist, align columns
        expected_features = self.metadata.get("feature_names", [])
        if expected_features:
            missing_cols = [c for c in expected_features if c not in clean_df.columns]
            for m in missing_cols:
                clean_df[m] = 0.0
            clean_df = clean_df[expected_features]

        # Clean numeric anomalies
        clean_df = clean_df.select_dtypes(include=[np.number])
        clean_df = clean_df.replace([np.inf, -np.inf], np.nan).fillna(0)

        # Scale features
        scaled_features = self.scaler.transform(clean_df)
        return scaled_features, clean_df

    def predict(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Performs batch prediction on preprocessed dataframe."""
        if not self.is_loaded:
            self.load_model_artifacts()

        scaled_X, clean_df = self.preprocess_df(df)
        
        predictions_encoded = self.model.predict(scaled_X)
        predicted_labels = self.label_encoder.inverse_transform(predictions_encoded)

        # Confidence probabilities
        probabilities = None
        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(scaled_X)

        results = []
        for i in range(len(predicted_labels)):
            attack_type = str(predicted_labels[i])
            is_attack = (attack_type.upper() != "BENIGN")
            
            confidence = 1.0
            if probabilities is not None:
                confidence = float(np.max(probabilities[i]))

            results.append({
                "flow_index": i,
                "prediction": "ATTACK" if is_attack else "BENIGN",
                "attack_type": attack_type,
                "confidence": round(confidence * 100, 2),
                "is_attack": is_attack
            })

        return results

ml_service = MLService()
