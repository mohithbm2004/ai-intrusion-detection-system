import sys
import os
import pandas as pd

# Add backend directory to sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(script_dir, ".."))
sys.path.insert(0, backend_dir)

from app.services.ml_service import ml_service

def test_inference():
    print("Testing ML Service Inference Pipeline...")
    loaded = ml_service.load_model_artifacts()
    print(f"ML Service Loaded: {loaded}")
    
    data_path = os.path.join(backend_dir, "..", "data", "CICIDS2017_sample.csv")
    df = pd.read_csv(data_path, nrows=10)
    
    print(f"Read 10 sample rows from {data_path}")
    results = ml_service.predict(df)
    
    for i, res in enumerate(results):
        print(f"Flow #{i+1}: Prediction={res['prediction']}, Attack Type={res['attack_type']}, Confidence={res['confidence']}%")
        
if __name__ == "__main__":
    test_inference()
