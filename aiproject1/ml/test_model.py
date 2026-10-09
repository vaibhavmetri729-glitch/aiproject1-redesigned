import joblib
import pandas as pd

# Load model
model = joblib.load("cricket_model.pkl")

# New match input
match = pd.DataFrame([
    {
        "team1_strength": 65,
        "team2_strength": 60,
        "venue": 1,
        "pitch_type": 1,
        "toss_winner": 1,
        "recent_form": 85
    }
])

# Prediction
winner = model.predict(match)

# Probability
probability = model.predict_proba(match)

print("Predicted Winner:", winner[0])

print("\nWin Probability:")
for team, chance in zip(model.classes_, probability[0]):
    print(team, ":", round(chance * 100, 2), "%")