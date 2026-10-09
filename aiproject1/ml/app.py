from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)
# Load trained model
model = joblib.load("cricket_model.pkl")


@app.route("/")
def home():
    return "SmartCricket AI API Running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    match = pd.DataFrame([
        {
            "team1_strength": data["team1_strength"],
            "team2_strength": data["team2_strength"],
            "venue": data["venue"],
            "pitch_type": data["pitch_type"],
            "toss_winner": data["toss_winner"],
            "recent_form": data["recent_form"]
        }
    ])

    prediction = model.predict(match)[0]

    probability = model.predict_proba(match)[0]

    result = {
        "winner": prediction,
        "probability": {
            team: round(chance * 100, 2)
            for team, chance in zip(model.classes_, probability)
        }
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(port=5001, debug=True)