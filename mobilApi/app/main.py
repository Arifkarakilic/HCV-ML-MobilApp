from flask import Flask, request, jsonify
import joblib
import numpy as np

# Model ve pipeline yükle
model = joblib.load("app/model.pkl")
pipeline = joblib.load("app/pipeline.pkl")

selected_features = [
    'RBC', 'AST_1', 'BMI', 'WBC', 'RNA_4',
    'ALT_24', 'Plat', 'ALT_48', 'ALT_12', 'RNA_Base',
    'ALT4', 'ALT_1', 'ALT_36', 'ALT_after_24_w'
]

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    # Özelliklerin tam olup olmadığını kontrol et
    if not all(feature in data for feature in selected_features):
        return jsonify({"error": "Eksik ya da hatalı özellik gönderildi!"}), 400

    # RNA alanlarına log1p dönüşümü
    for key in data:
        if "RNA" in key:
            data[key] = np.log1p(data[key])

    input_values = [data[feature] for feature in selected_features]
    input_array = np.array([input_values])
    processed_input = pipeline.transform(input_array)
    prediction = model.predict(processed_input)[0]

    return jsonify({"predicted_stage": int(prediction)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)