import requests

url = "http://127.0.0.1:5001/predict"

data = {
    "team1_strength":65,
    "team2_strength":60,
    "venue":1,
    "pitch_type":1,
    "toss_winner":1,
    "recent_form":85
}

response = requests.post(url, json=data)

print(response.json())