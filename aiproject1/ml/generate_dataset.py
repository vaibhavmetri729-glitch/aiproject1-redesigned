import pandas as pd
import random

teams = {
    "India": 90,
    "Australia": 86,
    "England": 80,
    "Pakistan": 82,
    "South Africa": 81,
    "New Zealand": 83,
    "Sri Lanka": 76,
    "Bangladesh": 72
}

rows = []

for _ in range(500):
    team1, team2 = random.sample(list(teams.keys()), 2)

    s1 = teams[team1] + random.randint(-3, 3)
    s2 = teams[team2] + random.randint(-3, 3)

    # Stronger team wins most of the time
    if s1 > s2:
        winner = team1 if random.random() < 0.75 else team2
    elif s2 > s1:
        winner = team2 if random.random() < 0.75 else team1
    else:
        winner = random.choice([team1, team2])

    rows.append({
        "team1": team1,
        "team2": team2,
        "team1_strength": s1,
        "team2_strength": s2,
        "winner": winner
    })

df = pd.DataFrame(rows)
df.to_csv("matches.csv", index=False)

print("500-match dataset created successfully!")