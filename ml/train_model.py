import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder

# Reproducibility
np.random.seed(42)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
os.makedirs(MODEL_DIR, exist_ok=True)


def generate_synthetic_data(n_samples=3000):

    temperature = np.random.uniform(30, 115, n_samples)   # °C
    pressure = np.random.uniform(70, 195, n_samples)       # PSI
    humidity = np.random.uniform(30, 85, n_samples)        # % RH
    vibration_options = ['Low', 'Medium', 'High']
    vibration = np.random.choice(vibration_options, n_samples)

    risk = []
    for i in range(n_samples):
        temp = temperature[i]
        pres = pressure[i]
        vib = vibration[i]
        hum = humidity[i]

        score = 0

        # Temperature
        if temp > 90:
            score += 3
        elif temp > 65:
            score += 2
        else:
            score += 1

        # Pressure
        if pres > 160:
            score += 3
        elif pres > 110:
            score += 2
        else:
            score += 1

        # Vibration
        if vib == 'High':
            score += 3
        elif vib == 'Medium':
            score += 2
        else:
            score += 1

        # Humidity
        if hum > 70:
            score += 2
        elif hum > 50:
            score += 1

        # Add noise
        noise = np.random.random()
        if noise < 0.05:
            score += 1
        elif noise < 0.10:
            score -= 1

        # Map score
        if score >= 8:
            risk.append('High')
        elif score >= 5:
            risk.append('Medium')
        else:
            risk.append('Low')

    df = pd.DataFrame({
        'Temperature': temperature,
        'Pressure': pressure,
        'Vibration': vibration,
        'Humidity': humidity,
        'Risk': risk
    })

    return df


def train_model():

    print("=" * 50)
    print("  Machine Risk Prediction - Model Training (v2.6)")
    print("=" * 50)

    df = generate_synthetic_data(3000)
    print(f"\n[DATA] Samples generated: {len(df)}")
    print(f"   Risk distribution:\n{df['Risk'].value_counts().to_string()}\n")

    vibration_encoder = LabelEncoder()
    df['Vibration_encoded'] = vibration_encoder.fit_transform(df['Vibration'])

    feature_names = ['Temperature', 'Pressure', 'Vibration', 'Humidity']
    feature_columns = ['Temperature', 'Pressure', 'Vibration_encoded', 'Humidity']
    X = df[feature_columns].values
    y = df['Risk'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("[TRAIN] Training Random Forest Classifier (100 Trees)...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\n[EVAL] Model Evaluation (Test Set):")
    print(classification_report(y_test, y_pred))

    accuracy = model.score(X_test, y_test)
    print(f"   Accuracy: {accuracy:.2%}")

    print("\n[FEATURES] Feature Importances:")
    for name, importance in zip(feature_names, model.feature_importances_):
        print(f"   {name}: {importance:.4f}")

    model_path = os.path.join(MODEL_DIR, 'model.pkl')
    encoders_path = os.path.join(MODEL_DIR, 'encoders.pkl')

    joblib.dump(model, model_path)
    joblib.dump({
        'vibration_encoder': vibration_encoder,
        'feature_names': feature_names,
        'feature_columns': feature_columns
    }, encoders_path)

    print(f"\n[OK] Model saved to: {model_path}")
    print(f"[OK] Encoders saved to: {encoders_path}")
    print("=" * 50)

    return model, vibration_encoder


if __name__ == '__main__':
    train_model()
