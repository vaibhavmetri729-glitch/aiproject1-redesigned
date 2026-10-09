import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
data = pd.read_csv("matches.csv")

# Use ONLY 2 features
X = data[["team1_strength", "team2_strength"]]

# Winner
y = data["winner"]

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save model
joblib.dump(model, "cricket_model.pkl")

print("Model trained successfully!")