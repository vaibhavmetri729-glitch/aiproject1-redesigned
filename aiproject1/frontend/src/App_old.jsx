import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [headToHead, setHeadToHead] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [team1, setTeam1] = useState("India");
  const [team2, setTeam2] = useState("Australia");
  const [search, setSearch] = useState("");
  const [venue, setVenue] = useState("Mumbai");
  const [tossWinner, setTossWinner] = useState("India");
  const [playerPrediction, setPlayerPrediction] = useState(null);
  const [commentary, setCommentary] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/players")
      .then((response) => setPlayers(response.data))
      .catch(console.error);

    axios
      .get("http://localhost:5000/api/teams")
      .then((response) => setTeams(response.data))
      .catch(console.error);

    axios
      .get("http://localhost:5000/api/matches")
      .then((response) => setMatches(response.data))
      .catch(console.error);
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );
  const getTeamStrength = (teamName) => {
  const team = teams.find((t) => t.name === teamName);

  if (!team) return 50;

  // Strength based on ranking and win rate
  const winRate = (team.wins / team.matchesPlayed) * 100;

  // Better ranking gives higher score
  const rankingScore = (4 - team.ranking) * 10;

  return Math.round(winRate + rankingScore);
};
const getPredictionReason = (
  team1Strength,
  team2Strength,
  venue,
  tossWinner
) => {
  const reasons = [];

  if (team1Strength > team2Strength)
    reasons.push(`${team1} has a stronger overall squad`);

  if (team2Strength > team1Strength)
    reasons.push(`${team2} has a stronger overall squad`);

  if (
    (venue === "Mumbai" || venue === "Delhi") &&
    team1 === "India"
  )
    reasons.push("Home advantage in India");

  if (
    (venue === "Melbourne" || venue === "Sydney") &&
    team1 === "Australia"
  )
    reasons.push("Home advantage in Australia");

  if (venue === "London" && team1 === "England")
    reasons.push("Home advantage in England");

  if (tossWinner === team1)
    reasons.push(`${team1} won the toss`);

  if (tossWinner === team2)
    reasons.push(`${team2} won the toss`);

  return reasons;
};
const getAIPrediction = () => {
  console.log("AI button clicked");

  const team1Strength = getTeamStrength(team1);
  const team2Strength = getTeamStrength(team2);

  axios.post("http://127.0.0.1:5001/predict", {
  team1,
  team2,
  team1_strength: team1Strength,
  team2_strength: team2Strength,
  venue,
  toss_winner: tossWinner,
})
    .then((response) => {
      console.log(response.data);

     setAiPrediction({
  match: `${team1} vs ${team2}`,
  winner: response.data.winner,
  probability: response.data.probability,
  team1Strength,
  team2Strength,
  reasons: getPredictionReason(
    team1Strength,
    team2Strength,
    venue,
    tossWinner
  ),
});
    })
    .catch((error) => {
      console.error("AI Error:", error);
    });
};
const generateCommentary = (result, battingTeam) => {
  const four = [
    `${battingTeam} finds the gap! FOUR runs.`,
    `Beautiful cover drive! That's a boundary.`,
    `Cracking shot! The ball races away to the fence.`,
  ];

  const six = [
    `Massive hit! That's gone all the way for SIX!`,
    `What a strike! Into the stands.`,
    `Towering six over long-on.`,
  ];

  const wicket = [
    `OUT! The batter has to depart.`,
    `Bowled him! What a delivery.`,
    `Caught! A brilliant piece of fielding.`,
  ];

  const singles = [
    `A comfortable single taken.`,
    `They rotate the strike with one run.`,
    `Quick running between the wickets.`,
  ];

  const dots = [
    `Dot ball. Good disciplined bowling.`,
    `No run. The bowler keeps it tight.`,
    `Solid defense from the batter.`,
  ];

  let list = dots;

  if (result === 4) list = four;
  else if (result === 6) list = six;
  else if (result === "W") list = wicket;
  else if (result > 0) list = singles;

  return list[Math.floor(Math.random() * list.length)];
};
const startSimulation = () => {
  if (isSimulating) return;

  setIsSimulating(true);

  let innings = 1;

  let runs = 0;
  let wickets = 0;
  let over = 0;
  let ball = 0;

  let target = 0;

  const outcomes = [0, 1, 2, 3, 4, 6, "W"];

  const interval = setInterval(() => {
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    if (result === "W") {
      wickets++;
    } else {
      runs += result;
    }
const text = generateCommentary(
  result,
  innings === 1 ? team1 : team2
);

setCommentary((prev) => [
  text,
  ...prev.slice(0, 9)
]);
    ball++;

    if (ball === 6) {
      over++;
      ball = 0;
    }

    // -------- FIRST INNINGS --------
    if (innings === 1) {
      setSimulation({
        innings: 1,
        battingTeam: team1,
        bowlingTeam: team2,
        score: `${runs}/${wickets}`,
        over: `${over}.${ball}`,
        lastBall: result === "W" ? "WICKET" : `${result} RUNS`,
        target: null,
        winProbability: Math.min(
          95,
          Math.max(5, 50 + runs / 3 - wickets * 4)
        ),
      });

      if (over === 20 || wickets === 10) {
        target = runs + 1;

        innings = 2;

        runs = 0;
        wickets = 0;
        over = 0;
        ball = 0;

        return;
      }
    }

    // -------- SECOND INNINGS --------
    else {
      const ballsBowled = over * 6 + ball;
      const ballsLeft = 120 - ballsBowled;
      const runsNeeded = target - runs;

      let chaseProbability = 50;

      if (ballsLeft > 0) {
        chaseProbability = Math.min(
          95,
          Math.max(
            5,
            50 +
              (target - runs) * -0.15 +
              ballsLeft * 0.08 -
              wickets * 3
          )
        );
      }

      setSimulation({
        innings: 2,
        battingTeam: team2,
        bowlingTeam: team1,
        score: `${runs}/${wickets}`,
        over: `${over}.${ball}`,
        lastBall: result === "W" ? "WICKET" : `${result} RUNS`,
        target,
        runsNeeded,
        ballsLeft,
        winProbability: 100 - chaseProbability,
      });

      if (runs >= target || over === 20 || wickets === 10) {
        clearInterval(interval);

        const winner =
          runs >= target ? team2 : team1;

        setSimulation((prev) => ({
          ...prev,
          winner,
        }));

        setIsSimulating(false);
      }
    }
  }, 700);
};
  const getHeadToHead = () => {
    axios
      .post("http://localhost:5000/api/match-analytics/head-to-head", {
        team1,
        team2,
      })
      .then((response) => setHeadToHead(response.data))
      .catch(console.error);
  };
const getPlayerPrediction = (player) => {
  axios
    .post("http://127.0.0.1:5001/predict-player", {
      average: player.average,
      strike_rate: player.strikeRate,
      opposition_strength: 82,
      recent_form: 90,
    })
    .then((response) => {
      setPlayerPrediction(response.data.predicted_runs);
    })
    .catch(console.error);
};
const getFantasyXI = () => {
  return [...players]
    .sort((a, b) => {
      const scoreA =
        a.average * 0.6 +
        a.strikeRate * 0.3 +
        (a.wickets || 0) * 0.1;

      const scoreB =
        b.average * 0.6 +
        b.strikeRate * 0.3 +
        (b.wickets || 0) * 0.1;

      return scoreB - scoreA;
    })
    .slice(0, 11);
};
const getTopPerformers = () => {
  return [...players]
    .sort((a, b) => {
      const scoreA =
        a.average * 0.6 +
        a.strikeRate * 0.3 +
        (a.wickets || 0) * 0.1;

      const scoreB =
        b.average * 0.6 +
        b.strikeRate * 0.3 +
        (b.wickets || 0) * 0.1;

      return scoreB - scoreA;
    })
    .slice(0, 5);
};
  return (
    <div className="container">
      <div className="prediction" style={{ textAlign: "center", marginBottom: "30px" }}>
  <h1 className="title">🏏 SmartCricket AI</h1>

  <p style={{ fontSize: "18px", color: "#cbd5e1" }}>
    AI-powered cricket analytics platform for match prediction,
    player performance forecasting, fantasy optimization,
    and live match simulation.
  </p>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      marginTop: "20px",
      flexWrap: "wrap",
    }}
  >
    <div className="card" style={{ width: "180px" }}>
      <h3>⚡ AI Models</h3>
      <p>2 Active</p>
    </div>

    <div className="card" style={{ width: "180px" }}>
      <h3>📊 Analytics</h3>
      <p>Real-Time</p>
    </div>

    <div className="card" style={{ width: "180px" }}>
      <h3>🏆 Teams</h3>
      <p>{teams.length} Tracked</p>
    </div>
  </div>
</div>
      {/* Summary Cards */}
      <div className="section">
        <div className="cards">
          <div className="card">
            <h3>Total Players</h3>
            <h1>{players.length}</h1>
          </div>

          <div className="card">
            <h3>Total Teams</h3>
            <h1>{teams.length}</h1>
          </div>

          <div className="card">
            <h3>Total Matches</h3>
            <h1>{matches.length}</h1>
          </div>

          <div className="card">
            <h3>AI Engine</h3>
            <h1>Live</h1>
          </div>
        </div>
      </div>

      {/* Player Analytics */}
      <div className="section">
        <h2>🏏 Player Analytics</h2>

        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "8px",
            border: "none",
            marginBottom: "20px",
          }}
        />

        <div className="cards">
          {filteredPlayers.map((player) => (
            <div
  className="card"
  key={player._id}
  onClick={() => {
  setSelectedPlayer(player);
  getPlayerPrediction(player);
}}
  style={{ cursor: "pointer" }}
>
              <h3>{player.name}</h3>
              <p>Team: {player.team}</p>
              <p>Role: {player.role}</p>
              <p>Runs: {player.runs}</p>
              <p>Average: {player.average}</p>
              
            </div>
          ))}
        </div>
      </div>

<div className="section">
  <h2>🌟 Top Performers</h2>

  <div className="cards">
    {getTopPerformers().map((player, index) => (
      <div className="card" key={player._id}>
        <h3>
          #{index + 1} {player.name}
        </h3>

        <p><strong>Team:</strong> {player.team}</p>

        <p><strong>Role:</strong> {player.role}</p>

        <p><strong>Average:</strong> {player.average}</p>

        <p><strong>Strike Rate:</strong> {player.strikeRate}</p>

        <h3>
          AI Score:{" "}
          {(
            player.average * 0.6 +
            player.strikeRate * 0.3 +
            (player.wickets || 0) * 0.1
          ).toFixed(1)}
        </h3>
      </div>
    ))}
  </div>
</div>

{/* Player Profile */}
{selectedPlayer && (
  <div className="section">
    <h2>👤 Player Profile</h2>

    <div className="prediction">
      <h2>{selectedPlayer.name}</h2>

      <p><strong>Team:</strong> {selectedPlayer.team}</p>

      <p><strong>Role:</strong> {selectedPlayer.role}</p>

      <p><strong>Runs:</strong> {selectedPlayer.runs}</p>

      <p><strong>Wickets:</strong> {selectedPlayer.wickets}</p>

      <p><strong>Average:</strong> {selectedPlayer.average}</p>

      <p><strong>Strike Rate:</strong> {selectedPlayer.strikeRate}</p>
      {playerPrediction && (
  <>
    <h3>🤖 AI Predicted Runs: {playerPrediction}</h3>
    <p>Confidence: High</p>
  </>
)}
      <h3>
        AI Performance Score:
        {(
          selectedPlayer.average * 0.6 +
          selectedPlayer.strikeRate * 0.4
        ).toFixed(2)}
      </h3>
    </div>
  </div>
)}

      {/* Player Runs Chart */}
      <div className="section">
        <h2>📊 Player Runs Chart</h2>

        <div className="prediction">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={players}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="runs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Rankings */}
      <div className="section">
        <h2>🏆 Team Rankings</h2>

        <div className="cards">
          {teams.map((team) => (
            <div
  className="card"
  key={team._id}
  onClick={() => setSelectedTeam(team)}
  style={{ cursor: "pointer" }}
>
              <h3>{team.name}</h3>
              <p>Ranking: {team.ranking}</p>
              <p>Wins: {team.wins}</p>
              <p>Losses: {team.losses}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="section">
  <h2>🏆 AI Fantasy XI</h2>

  <div className="cards">
    {getFantasyXI().map((player, index) => (
      <div className="card" key={player._id}>
        <h3>
          {index + 1}. {player.name}
        </h3>

        <p>{player.team}</p>

        <p>{player.role}</p>

        <p>Average: {player.average}</p>
      </div>
    ))}
  </div>
</div>
{/* Team Profile */}
{selectedTeam && (
  <div className="section">
    <h2>🏆 Team Profile</h2>

    <div className="prediction">
      <h2>{selectedTeam.name}</h2>

      <p><strong>Country:</strong> {selectedTeam.country}</p>

      <p><strong>Captain:</strong> {selectedTeam.captain}</p>

      <p><strong>Coach:</strong> {selectedTeam.coach}</p>

      <p><strong>Ranking:</strong> {selectedTeam.ranking}</p>

      <p><strong>Matches:</strong> {selectedTeam.matchesPlayed}</p>

      <p><strong>Wins:</strong> {selectedTeam.wins}</p>

      <p><strong>Losses:</strong> {selectedTeam.losses}</p>

      <h3>
        Win Rate:{" "}
        {(
          (selectedTeam.wins / selectedTeam.matchesPlayed) *
          100
        ).toFixed(2)}
        %
      </h3>
    </div>
  </div>
)}
      {/* Team Wins Chart */}
      <div className="section">
        <h2>🏆 Team Wins Chart</h2>

        <div className="prediction">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teams}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="section">
        <h2>🏟️ Recent Matches</h2>

        <div className="cards">
          {matches.map((match) => (
            <div className="card" key={match._id}>
              <h3>
                {match.team1} vs {match.team2}
              </h3>

              <p>
                <strong>Winner:</strong> {match.winner}
              </p>

              <p>
                <strong>Score:</strong> {match.team1Score} - {match.team2Score}
              </p>

              <p>
                <strong>Venue:</strong> {match.venue}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(match.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Head-to-Head Comparison */}
      <div className="section">
        <h2>⚔️ Head-to-Head Comparison</h2>

        <button onClick={getHeadToHead}>
          Compare {team1} vs {team2}
        </button>

        {headToHead && (
          <div className="prediction">
            <h3>{headToHead.teams}</h3>

            <p>Total Matches: {headToHead.totalMatches}</p>

            <p>
              {team1} Wins: {headToHead[team1 + "_Wins"]}
            </p>

            <p>
              {team2} Wins: {headToHead[team2 + "_Wins"]}
            </p>
          </div>
        )}
      </div>

      {/* AI Match Prediction */}
      <div className="section">
  <h2>🤖 AI Match Prediction</h2>

  <select value={team1} onChange={(e) => setTeam1(e.target.value)}>
    {teams.map((team) => (
      <option key={team._id} value={team.name}>
        {team.name}
      </option>
    ))}
  </select>

<select
  value={team2}
  onChange={(e) => setTeam2(e.target.value)}
  style={{ marginLeft: "10px", marginRight: "20px" }}
>
  {teams.map((team) => (
    <option key={team._id} value={team.name}>
      {team.name}
    </option>
  ))}
</select>

<select
  value={venue}
  onChange={(e) => setVenue(e.target.value)}
>
  <option>Mumbai</option>
  <option>Delhi</option>
  <option>Melbourne</option>
  <option>Sydney</option>
  <option>London</option>
</select>

<select
  value={tossWinner}
  onChange={(e) => setTossWinner(e.target.value)}
  style={{ marginLeft: "10px" }}
>
  <option value={team1}>{team1}</option>
  <option value={team2}>{team2}</option>
</select>
 <br /><br />

  <button onClick={getAIPrediction}>Run AI Model</button>

  {aiPrediction && (
  <div className="prediction">
    <h3>{aiPrediction.match}</h3>

    <p><strong>Winner:</strong> {aiPrediction.winner}</p>

    <p>{team1} Strength: {aiPrediction.team1Strength}</p>

    <p>{team2} Strength: {aiPrediction.team2Strength}</p>

    <pre>{JSON.stringify(aiPrediction.probability, null, 2)}</pre>

    {aiPrediction.reasons && (
      <div style={{ marginTop: "15px" }}>
        <h4>🧠 AI Analysis</h4>

        <ul>
          {aiPrediction.reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}
</div>
<div className="section">
  <h2>🏏 Live Match Simulator</h2>

  <button onClick={startSimulation} disabled={isSimulating}>
    {isSimulating ? "Simulating..." : "Start Simulation"}
  </button>

  {simulation && (
  <div className="prediction">
    <h3>{team1} vs {team2}</h3>

    <h2>
      Innings {simulation.innings}: {simulation.battingTeam} batting
    </h2>

    <h1>{simulation.score}</h1>

    <p>Over: {simulation.over}</p>

    <p>Last Ball: {simulation.lastBall}</p>

    {simulation.target && (
      <>
        <h3>Target: {simulation.target}</h3>

        <p>
          Need {simulation.runsNeeded} runs from{" "}
          {simulation.ballsLeft} balls
        </p>
      </>
    )}

    <h3>Win Probability</h3>

    <p>{team1}: {simulation.winProbability}%</p>

    <p>{team2}: {100 - simulation.winProbability}%</p>

    {simulation.winner && (
      <h2 style={{ marginTop: "20px" }}>
        🏆 {simulation.winner} Wins!
      </h2>
    )}
  </div>
)}
{/*<div className="section">
  <h2>🎙️ AI Commentary</h2>

  <div className="prediction">
    {commentary.length === 0 ? (
      <p>Start the simulator to generate commentary.</p>
    ) : (
      commentary.map((line, index) => (
        <p key={index}>🗣️ {line}</p>
      ))
    )}
  </div>
</div>*/}
</div>
    </div>
    
    
  );
}

export default App;
