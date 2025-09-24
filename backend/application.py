import pandas as pd
import numpy as np
import shap
import traceback
import collections.abc
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app)

# --- GLOBAL VARIABLES ---
model = None
le = None
df = None
explainer = None
feature_cols = ["temperature", "humidity", "sunlight_hours", "ph", "rainfall", "soil_moisture"]

def load_model_and_data():
    """Load the dataset, train the model, and create the SHAP explainer."""
    global df, model, le, explainer
    try:
        # CRITICAL: Ensure this path points to the EXACT same CSV file as your test script.
        df = pd.read_csv("./Datasets/final_enriched_water_footprint_dataset.csv")

        df.columns = df.columns.str.strip().str.lower()
        if 'rec_crop' not in df.columns and 'crop' in df.columns:
            df.rename(columns={'crop': 'rec_crop'}, inplace=True)
        df.dropna(subset=["rec_crop"] + feature_cols, inplace=True)

        le = LabelEncoder()
        X = df[feature_cols]
        y = le.fit_transform(df["rec_crop"])

        # This model configuration is correct and matches your script.
        model = XGBClassifier(
            objective="multi:softprob",
            num_class=len(le.classes_),
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            use_label_encoder=False,
            eval_metric='mlogloss',
            random_state=42
        )
        model.fit(X, y)

        explainer = shap.TreeExplainer(model)

        print("✅ Model, data, and SHAP explainer loaded successfully.")
    except Exception as e:
        print(f"❌ An error occurred during model loading: {e}")
        print(traceback.format_exc())

def get_value(data, key, unit="", precision=2):
    """Helper to safely get and format data from the dataframe row."""
    val = data.get(key)
    if pd.isna(val) or val is None: return "N/A"
    if isinstance(val, (int, float)): return f"{round(val, precision)} {unit}".strip()
    return str(val).strip().capitalize()

def convert_to_native_types(obj):
    """Helper function to convert numpy types to native Python types for JSON serialization."""
    if isinstance(obj, collections.abc.Mapping):
        return {key: convert_to_native_types(value) for key, value in obj.items()}
    elif isinstance(obj, collections.abc.Sequence) and not isinstance(obj, str):
        return [convert_to_native_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests and return top 3 predictions with detailed metrics."""
    try:
        req_data = request.get_json()
        processed_data = {key: float(value) for key, value in req_data.items() if key in feature_cols}
        input_data = pd.DataFrame([processed_data])[feature_cols]

        all_probas = model.predict_proba(input_data)[0]
        top_3_indices = np.argsort(all_probas)[-3:][::-1]

        shap_explanation = explainer(input_data)

        predictions = []
        for index in top_3_indices:
            crop_name = le.inverse_transform([index])[0]
            confidence_score = all_probas[index] * 100

            crop_data = df[df['rec_crop'] == crop_name].iloc[0].to_dict()

            shap_values_for_class = shap_explanation.values[0, :, index]

            shap_chart_data = []
            total_abs_impact = np.sum(np.abs(shap_values_for_class))
            if total_abs_impact > 0:
                percentage_impact = (shap_values_for_class / total_abs_impact) * 100
            else:
                percentage_impact = np.zeros_like(shap_values_for_class)

            for i, feature in enumerate(feature_cols):
                shap_chart_data.append({
                    "name": feature.replace('_', ' ').title(),
                    "contribution": percentage_impact[i]
                })

            top_features_indices = np.argsort(np.abs(shap_values_for_class))[-3:][::-1]
            top_features = [feature_cols[i].replace('_', ' ').title() for i in top_features_indices]
            interpretation = f"{crop_name.title()} was recommended because the conditions for {', '.join(top_features)} most strongly match its requirements."

            # --- The following block is now corrected to match your script's column names ---
            prediction_details = {
                "cropDetails": {
                    "CropName": crop_name.title(),
                    "Confidence": f"{confidence_score:.2f}%"
                },
                "interpretation": interpretation,
                "shapChartData": shap_chart_data,
                "nutrientFertilizer": {
                    "N": get_value(crop_data, 'n', 'kg/ha'),
                    "P": get_value(crop_data, 'p', 'kg/ha'),
                    "K": get_value(crop_data, 'k', 'kg/ha'),
                    # FIXED: Changed 'fertilizer' to 'fuzzy_fert'
                    "Fertilizer": get_value(crop_data, 'fuzzy_fert'),
                    "Fertilizer Use": get_value(crop_data, 'fertilizer use (kg/ha)', 'kg/ha'),
                    # FIXED: Changed 'pesticide usage (ml)' to 'pesticide_usage_ml'
                    "Pesticide Usage": get_value(crop_data, 'pesticide_usage_ml', 'ml')
                },
                "waterIrrigation": {
                    "Total Water Use": get_value(crop_data, 'water use (m³/kg)', 'm³/kg'),
                    "Green Water Use": get_value(crop_data, 'green water use (m³/kg)', 'm³/kg'),
                    "Blue Water Use": get_value(crop_data, 'blue water use (m³/kg)', 'm³/kg'),
                    "Grey Water Pollution": get_value(crop_data, 'water pollution (grey water) (m³/kg)', 'm³/kg'),
                    "Irrigation Type": get_value(crop_data, 'irrigation type'),
                    "Irrigation Efficiency": get_value(crop_data, 'irrigation efficiency (%)', '%'),
                    "Water-Saving Practices": get_value(crop_data, 'water-saving practices')
                },
                "cyclePostHarvest": {
                    "Crop Cycle Duration": get_value(crop_data, 'crop cycle duration (days)', 'days'),
                    "Harvest Season": get_value(crop_data, 'harvest season'),
                    "Post-Harvest Processing": get_value(crop_data, 'post-harvest processing (liters/kg)', 'liters/kg'),
                    "CO2 Emission": get_value(crop_data, 'co2 emission (kg/ha)', 'kg/ha')
                },
                "actionableRecommendations": {
                    # FIXED: Changed 'fertilizer' to 'fuzzy_fert'
                    "Fertilizer": get_value(crop_data, 'fuzzy_fert'),
                    "Nutrient Application": f"Apply N: {get_value(crop_data, 'n')} kg/ha, P: {get_value(crop_data, 'p')} kg/ha, K: {get_value(crop_data, 'k')} kg/ha",
                    "Irrigation Strategy": get_value(crop_data, 'irrigation type'),
                    "Input Conditions": f"Soil Moisture: {get_value(req_data, 'soil_moisture')}, Rainfall: {get_value(req_data, 'rainfall')}"
                }
            }
            predictions.append(prediction_details)

        converted_predictions = convert_to_native_types(predictions)
        return jsonify(converted_predictions)

    except Exception as e:
        print(f"Error during prediction: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    load_model_and_data()
    app.run(host='0.0.0.0', port=5000, debug=True)