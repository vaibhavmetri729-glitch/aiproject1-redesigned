import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

data = pd.read_csv("player_performance.csv")

X = data[["average", "strike_rate", "opposition_strength", "recent_form"]]
y = data["predicted_runs"]

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "player_model.pkl")

print("Player model trained successfully!")