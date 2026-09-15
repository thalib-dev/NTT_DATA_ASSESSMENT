import os
import joblib
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load model and encoders
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')

try:
    model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
    encoders = joblib.load(os.path.join(MODEL_DIR, 'encoders.pkl'))
    vibration_encoder = encoders['vibration_encoder']
    MODEL_FEATURES = encoders['feature_names']  # ['Temperature', 'Pressure', 'Vibration', 'Humidity']
    print(f"[OK] Model loaded. Features: {MODEL_FEATURES}")
except FileNotFoundError:
    print("[ERROR] Model not found. Run train_model.py first.")
    model = None
    encoders = None
    vibration_encoder = None
    MODEL_FEATURES = ['Temperature', 'Pressure', 'Vibration', 'Humidity']


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok' if model is not None else 'model_not_loaded',
        'model_features': MODEL_FEATURES
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict risk level from machine data.
    
    Expected JSON: {"Temperature": 85, "Pressure": 120, "Vibration": "High", "Humidity": 62}
    """
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503

    raw_data = request.get_json()
    if not raw_data:
        return jsonify({'error': 'No JSON data provided.'}), 400

    # Normalize keys to title-case (e.g. 'temperature' -> 'Temperature')
    data = {str(k).strip().title(): v for k, v in raw_data.items()}

    # Required base features for prediction
    base_features = ['Temperature', 'Pressure', 'Vibration']
    missing_features = [f for f in base_features if f not in data]
    if missing_features:
        return jsonify({
            'error': f'Missing required features: {", ".join(missing_features)}',
            'model_features': MODEL_FEATURES
        }), 400

    extra_fields = [k for k in data.keys() if k not in MODEL_FEATURES and k != 'Machine Name']

    try:
        temperature = float(data['Temperature'])
        pressure = float(data['Pressure'])
        vibration = str(data['Vibration']).strip().capitalize()
        humidity = float(data.get('Humidity', 50.0))  # Default 50% if missing

        if vibration not in vibration_encoder.classes_:
            return jsonify({
                'error': f'Invalid Vibration value: "{vibration}". Must be one of: {list(vibration_encoder.classes_)}'
            }), 400

        vibration_encoded = vibration_encoder.transform([vibration])[0]

        # Build feature vector
        if 'Humidity' in MODEL_FEATURES:
            features = np.array([[temperature, pressure, vibration_encoded, humidity]])
        else:
            features = np.array([[temperature, pressure, vibration_encoded]])

        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities))

        prob_breakdown = {}
        for cls, prob in zip(model.classes_, probabilities):
            prob_breakdown[cls] = round(float(prob), 4)

        features_used = {
            'Temperature': temperature,
            'Pressure': pressure,
            'Vibration': vibration
        }
        if 'Humidity' in MODEL_FEATURES and 'Humidity' in data:
            features_used['Humidity'] = humidity

        response = {
            'risk_level': prediction,
            'confidence': round(confidence, 4),
            'probabilities': prob_breakdown,
            'model_features': MODEL_FEATURES,
            'features_used': features_used
        }

        if extra_fields:
            response['ignored_fields'] = extra_fields
            response['note'] = f'The following fields were not used by the model: {", ".join(extra_fields)}.'

        return jsonify(response)

    except (ValueError, TypeError) as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400


if __name__ == '__main__':
    print("\n  Machine Risk Prediction ML Service")
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
