# SmartCricket AI — Redesign Notes

The UI has been redesigned in the visual style of cricket.com.au (deep navy,
baggy-green/gold accents, condensed sports headline type, scoreboard-style
data type), while keeping every existing feature working:

- ✅ AI Match Prediction (calls your Flask ML API at `http://127.0.0.1:5001/predict`)
- ✅ AI Match Simulator (ball-by-ball, unchanged core logic)
- ✅ Matches page live scores / results (calls your Express API at `http://localhost:5000/api/matches`)

## What's new

- **Live score ticker** — scrolling strip in the header (Navbar).
- **Toss Simulator** in AI Lab — randomly decides toss winner + bat/bowl choice, feeds into the prediction.
- **Live commentary feed** in the AI Match Simulator — ball-by-ball text log alongside the scoreboard.
- **ICC Points Table** on the Teams page — sortable by rank or AI rating, with form dots.
- **Squad Strength Index** cards on the Teams page.
- **AI Player Comparison** tool on the Players page — head-to-head stat bars for any two players.
- Every page now has graceful **fallback demo data** (`src/data/mockData.js`) so the UI looks fully populated even if the backend/ML services aren't running yet.

## Running it

```bash
cd frontend
npm install
npm run dev
```

The bundled `node_modules` folder was stripped out of this zip to keep it
small — run `npm install` in both `frontend/` and `backend/` before starting.

Backend (`backend/server.js`) and the ML service (`ml/`) were not modified.
