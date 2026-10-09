from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Load models
model = joblib.load("cricket_model.pkl")
player_model = joblib.load("player_model.pkl")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        team1 = data["team1"]
        team2 = data["team2"]

        team1_strength = int(data["team1_strength"])
        team2_strength = int(data["team2_strength"])

        # Optional venue and toss
        venue = data.get("venue", "")
        toss_winner = data.get("toss_winner", "")

        # Home advantage
        if venue in ["Mumbai", "Delhi"] and team1 == "India":
            team1_strength += 3
        if venue in ["Melbourne", "Sydney"] and team1 == "Australia":
            team1_strength += 3
        if venue == "London" and team1 == "England":
            team1_strength += 3

        # Toss advantage
        if toss_winner == team1:
            team1_strength += 2
        elif toss_winner == team2:
            team2_strength += 2

        prediction = model.predict([[team1_strength, team2_strength]])[0]

        probabilities = model.predict_proba([[team1_strength, team2_strength]])[0]
        classes = model.classes_

        team1_prob = 0
        team2_prob = 0

        for i, team in enumerate(classes):
            if team == team1:
                team1_prob = probabilities[i]
            elif team == team2:
                team2_prob = probabilities[i]

        total = team1_prob + team2_prob

        if total == 0:
            team1_final = 50.0
            team2_final = 50.0
        else:
            team1_final = round((team1_prob / total) * 100, 2)
            team2_final = round((team2_prob / total) * 100, 2)

        return jsonify({
            "winner": str(prediction),
            "probability": {
                team1: team1_final,
                team2: team2_final
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-player", methods=["POST"])
def predict_player():
    try:
        data = request.get_json()

        average = float(data["average"])
        strike_rate = float(data["strike_rate"])
        opposition_strength = float(data["opposition_strength"])
        recent_form = float(data["recent_form"])

        predicted_runs = player_model.predict([[
            average,
            strike_rate,
            opposition_strength,
            recent_form
        ]])[0]

        return jsonify({
            "predicted_runs": round(float(predicted_runs), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)