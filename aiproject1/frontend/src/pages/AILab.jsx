import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { TEAM_STRENGTHS } from "../data/mockData";
import { playerProfiles } from "../data/playerProfiles";

import "./AILab.css";
import StrategyEngine from "./StrategyEngine";

const API_BASE = "http://localhost:5000";
const AI_API = "http://127.0.0.1:5001";

const TEAM_OPTIONS = Object.keys(TEAM_STRENGTHS);

const VENUES = [
  "Mumbai",
  "Delhi",
  "Melbourne",
  "Sydney",
  "London",
];

const FORMATS = ["T20", "ODI", "Test"];

const PLAYER_LIST = Object.values(playerProfiles);

const PLAYER_OPTIONS = PLAYER_LIST.map((player) => player.name);


/* =========================================================
   HELPERS
========================================================= */

function seededNoise(seedStr) {
  let hash = 0;

  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  return ((hash % 100) / 100 + 1) / 2;
}


function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}


/*
  Cricsheet names and UI names may differ.

  Example:
  UI:  Virat Kohli
  DB:  V Kohli
*/
function getPlayerAliases(name) {
  const aliases = {
    "Virat Kohli": ["Virat Kohli", "V Kohli"],
    "Rohit Sharma": ["Rohit Sharma", "RG Sharma"],
    "KL Rahul": ["KL Rahul", "KL Rahul"],
    "Jasprit Bumrah": ["Jasprit Bumrah", "JJ Bumrah"],
    "Shubman Gill": ["Shubman Gill", "Shubman Gill"],
    "Yashasvi Jaiswal": ["Yashasvi Jaiswal", "YBK Jaiswal"],
    "Rishabh Pant": ["Rishabh Pant", "RR Pant"],
  };

  return aliases[name] || [name];
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function AILab() {
  const [module, setModule] = useState("prediction");

  /* ================= MATCH ================= */

  const [team1, setTeam1] = useState("India");
  const [team2, setTeam2] = useState("Australia");
  const [venue, setVenue] = useState("Mumbai");
  const [matchFormat, setMatchFormat] = useState("ODI");
  const [tossWinner, setTossWinner] = useState("India");

  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  /* ================= SIMULATOR ================= */

  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [commentary, setCommentary] = useState([]);

  const intervalRef = useRef(null);

  /* ================= PLAYER ================= */

  const [selectedPlayer, setSelectedPlayer] = useState(
    PLAYER_OPTIONS[0]
  );

  const [playerOpponent, setPlayerOpponent] = useState("Australia");
  const [playerVenue, setPlayerVenue] = useState("Mumbai");
  const [playerFormat, setPlayerFormat] = useState("ODI");

  const [playerPrediction, setPlayerPrediction] = useState(null);
  const [playerAnalytics, setPlayerAnalytics] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);

  /* ================= COACH ================= */

  const [coachPlayer, setCoachPlayer] =
    useState("Virat Kohli");

  const [coachFormat, setCoachFormat] = useState("ODI");
  const [coachCountry, setCoachCountry] = useState("Australia");
  const [coachOpponent, setCoachOpponent] = useState("Australia");
  const [coachVenue, setCoachVenue] = useState("Melbourne");
  const [coachPitch, setCoachPitch] = useState("Fast");

  const [coachReport, setCoachReport] = useState(null);

  /* ================= INJURY ================= */

  const [injuryReport, setInjuryReport] = useState(null);
  const [recentMatches, setRecentMatches] = useState(8);
  const [playerAge, setPlayerAge] = useState(32);
  const [previousInjury, setPreviousInjury] = useState("No");


  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  /* =========================================================
     TOSS
  ========================================================= */

  const runToss = () => {
    const winner =
      Math.random() > 0.5
        ? team1
        : team2;

    setTossWinner(winner);
  };


  /* =========================================================
     AI MATCH PREDICTION
  ========================================================= */

  const getAIPrediction = async () => {
    if (team1 === team2) {
      alert("Please select two different teams.");
      return;
    }

    setLoadingPrediction(true);

    try {
      const response = await axios.post(
        `${AI_API}/predict`,
        {
          team1,
          team2,

          team1_strength:
            TEAM_STRENGTHS[team1],

          team2_strength:
            TEAM_STRENGTHS[team2],

          venue,
          format: matchFormat,
          toss_winner: tossWinner,
        }
      );

      const data = response.data;

      setPrediction({
        ...data,

        winner:
          data.winner ||
          data.predictedWinner ||
          team1,

        probability:
          data.probability ||
          data.probabilities ||
          {
            [team1]: 50,
            [team2]: 50,
          },
      });

    } catch (error) {
      console.error(
        "AI prediction error:",
        error
      );

      /*
        FALLBACK MODEL

        This keeps the UI working if
        Flask is temporarily offline.
      */

      const s1 =
        TEAM_STRENGTHS[team1] || 50;

      const s2 =
        TEAM_STRENGTHS[team2] || 50;

      let score1 = s1;
      let score2 = s2;

      if (tossWinner === team1) {
        score1 += 2;
      }

      if (tossWinner === team2) {
        score2 += 2;
      }

      const total =
        score1 + score2;

      const p1 =
        Math.round(
          (score1 / total) * 100
        );

      setPrediction({
        winner:
          p1 >= 50
            ? team1
            : team2,

        probability: {
          [team1]: p1,
          [team2]: 100 - p1,
        },

        source: "Fallback model",
      });

    } finally {
      setLoadingPrediction(false);
    }
  };


  /* =========================================================
     MATCH SIMULATOR
  ========================================================= */

  const startSimulation = () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setCommentary([]);

    let innings = 1;

    let runs = 0;
    let wickets = 0;

    let over = 0;
    let ball = 0;

    let target = 0;

    const outcomes = [
      0,
      0,
      1,
      1,
      1,
      2,
      2,
      3,
      4,
      4,
      6,
      "W",
    ];

    /*
      T20 = 20 overs
      ODI = 50 overs
      Test simulation is intentionally limited
      for UI demonstration.
    */

    const MAX_OVERS =
      matchFormat === "T20"
        ? 20
        : matchFormat === "Test"
        ? 10
        : 20;

    intervalRef.current =
      setInterval(() => {

        const result =
          outcomes[
            Math.floor(
              Math.random() *
              outcomes.length
            )
          ];

        if (result === "W") {
          wickets++;
        } else {
          runs += result;
        }

        ball++;

        if (ball === 6) {
          over++;
          ball = 0;
        }

        const battingTeam =
          innings === 1
            ? team1
            : team2;

        setSimulation({
          innings,
          battingTeam,
          score:
            `${runs}/${wickets}`,
          over:
            `${over}.${ball}`,
          target:
            innings === 2
              ? target
              : null,
        });

        const ballLabel =
          `${over}.${ball}`;

        const text =
          result === "W"
            ? `${ballLabel} — ${battingTeam}: WICKET!`
            : `${ballLabel} — ${battingTeam}: ${result} run${
                result === 1
                  ? ""
                  : "s"
              }`;

        setCommentary((previous) =>
          [text, ...previous]
            .slice(0, 8)
        );

        const inningsOver =
          over >= MAX_OVERS ||
          wickets >= 10 ||
          (
            innings === 2 &&
            runs >= target
          );

        if (inningsOver) {

          if (innings === 1) {

            target =
              runs + 1;

            innings = 2;

            runs = 0;
            wickets = 0;
            over = 0;
            ball = 0;

            setCommentary((previous) =>
              [
                `INNINGS BREAK — ${team2} need ${target} to win.`,
                ...previous,
              ].slice(0, 8)
            );

          } else {

            clearInterval(
              intervalRef.current
            );

            const winner =
              runs >= target
                ? team2
                : team1;

            setSimulation((previous) => ({
              ...previous,
              winner,
            }));

            setCommentary((previous) =>
              [
                `MATCH OVER — ${winner} win!`,
                ...previous,
              ].slice(0, 8)
            );

            setIsSimulating(false);
          }
        }

      }, 250);
  };


  /* =========================================================
     PLAYER ANALYTICS FROM MONGODB
  ========================================================= */

  const loadPlayerAnalytics =
    async (playerName) => {

      const aliases =
        getPlayerAliases(
          playerName
        );

      for (const alias of aliases) {

        try {

          const response =
            await axios.get(
              `${API_BASE}/api/player-analytics/${encodeURIComponent(
                alias
              )}`
            );

          const data =
            response.data;

          if (
            data &&
            (
              data.batting?.runs > 0 ||
              data.bowling?.wickets > 0 ||
              data.batting?.innings > 0 ||
              data.bowling?.innings > 0
            )
          ) {
            return data;
          }

        } catch (error) {
          console.log(
            `Analytics unavailable for ${alias}`
          );
        }
      }

      return null;
    };


  /* =========================================================
     PLAYER PERFORMANCE ENGINE
  ========================================================= */

  const predictPlayer = async () => {

    const player =
      PLAYER_LIST.find(
        (p) =>
          p.name ===
          selectedPlayer
      );

    if (!player) return;

    setLoadingPlayer(true);

    try {

      /*
        FIRST:
        Get real historical
        Cricsheet/MongoDB analytics.
      */

      const analytics =
        await loadPlayerAnalytics(
          selectedPlayer
        );

      setPlayerAnalytics(
        analytics
      );

      const noise =
        seededNoise(
          `${selectedPlayer}-${playerOpponent}-${playerVenue}-${playerFormat}`
        );

      const career =
        player.career || {};

      const hasBatting =
        career.runs !== undefined ||
        analytics?.batting;

      const hasBowling =
        career.wickets !== undefined ||
        analytics?.bowling;

      const battingStats =
        analytics?.batting || {};

      const bowlingStats =
        analytics?.bowling || {};

      const careerBattingAverage =
        battingStats.average ||
        career.battingAverage ||
        career.average ||
        30;

      const careerStrikeRate =
        battingStats.strikeRate ||
        career.strikeRate ||
        85;

      const careerWickets =
        bowlingStats.wickets ||
        career.wickets ||
        0;

      const careerMatches =
        battingStats.matches ||
        career.matches ||
        1;

      const opponentStrength =
        TEAM_STRENGTHS[
          playerOpponent
        ] || 80;

      /*
        Strong opponent slightly
        reduces expected output.
      */

      const opponentFactor =
        clamp(
          1 -
          (
            opponentStrength - 70
          ) / 250,
          0.75,
          1.10
        );

      /*
        Format intelligence.
      */

      let formatFactor = 1;

      if (playerFormat === "T20") {
        formatFactor = 1.12;
      }

      if (playerFormat === "Test") {
        formatFactor = 0.82;
      }

      /*
        Recent form from existing profile.
      */

      const recent =
        player.recentForm || [];

      const recentAverage =
        recent.length
          ? recent.reduce(
              (sum, value) =>
                sum + Number(value),
              0
            ) / recent.length
          : careerBattingAverage;

      /*
        Combine career + recent form +
        opponent + format.
      */

      const expectedRuns =
        hasBatting
          ? Math.max(
              0,
              Math.round(
                (
                  careerBattingAverage *
                  0.55 +
                  recentAverage *
                  0.45
                ) *
                formatFactor *
                opponentFactor *
                (
                  0.90 +
                  noise * 0.20
                )
              )
            )
          : 0;

      const strikeRate =
        hasBatting
          ? Math.round(
              careerStrikeRate *
              (
                playerFormat === "Test"
                  ? 0.70
                  : playerFormat === "T20"
                  ? 1.05
                  : 1
              )
            )
          : 0;

      /*
        Probability models.
      */

      const fiftyProbability =
        hasBatting
          ? clamp(
              Math.round(
                25 +
                expectedRuns * 0.55 +
                recentAverage * 0.10
              ),
              5,
              92
            )
          : 0;

      const centuryProbability =
        hasBatting
          ? clamp(
              Math.round(
                expectedRuns * 0.25 -
                (
                  playerFormat === "T20"
                    ? 12
                    : 0
                )
              ),
              1,
              55
            )
          : 0;

      const dismissalRisk =
        hasBatting
          ? clamp(
              Math.round(
                55 -
                careerBattingAverage * 0.35 +
                opponentStrength * 0.12
              ),
              10,
              75
            )
          : 0;

      /*
        Bowling model.
      */

      const wicketsPerMatch =
        careerMatches > 0
          ? careerWickets /
            careerMatches
          : 0;

      const expectedWickets =
        hasBowling
          ? Number(
              (
                wicketsPerMatch *
                formatFactor *
                opponentFactor *
                (
                  0.85 +
                  noise * 0.30
                )
              ).toFixed(1)
            )
          : 0;

      const wicketProbability =
        hasBowling
          ? clamp(
              Math.round(
                35 +
                expectedWickets * 25
              ),
              5,
              90
            )
          : 0;

      const confidence =
        clamp(
          Math.round(
            65 +
            (
              analytics
                ? 18
                : 0
            ) +
            noise * 10
          ),
          55,
          96
        );

      setPlayerPrediction({

        name:
          player.name,

        role:
          player.role,

        runs:
          expectedRuns,

        strikeRate,

        fiftyProbability,

        centuryProbability,

        dismissalRisk,

        wickets:
          expectedWickets,

        wicketProbability,

        confidence,

        dataSource:
          analytics
            ? "Cricsheet + MongoDB + AI model"
            : "Career profile + AI model",

        recentAverage:
          Number(
            recentAverage.toFixed(1)
          ),

        opponentStrength,

      });

    } finally {
      setLoadingPlayer(false);
    }
  };


  /* =========================================================
     AI COACH
  ========================================================= */

  const analyzeCoach =
    async () => {

      const player =
        PLAYER_LIST.find(
          (p) =>
            p.name ===
            coachPlayer
        );

      if (!player) return;

      const analytics =
        await loadPlayerAnalytics(
          coachPlayer
        );

      const career =
        player.career || {};

      const recent =
        player.recentForm || [];

      const recentAverage =
        recent.length
          ? recent.reduce(
              (sum, value) =>
                sum + Number(value),
              0
            ) /
            recent.length
          : 50;

      const battingAverage =
        analytics?.batting?.average ||
        career.battingAverage ||
        career.average ||
        40;

      const strikeRate =
        analytics?.batting?.strikeRate ||
        career.strikeRate ||
        85;

      let expectedRuns =
        battingAverage *
        0.65 +
        recentAverage *
        0.35;

      let confidence = 72;

      /*
        Format
      */

      if (coachFormat === "T20") {
        expectedRuns *= 1.05;
        confidence += 3;
      }

      if (coachFormat === "Test") {
        expectedRuns *= 0.95;
        confidence += 4;
      }

      /*
        Venue
      */

      const venueAdjustments = {
        Mumbai: 5,
        Delhi: 2,
        Melbourne: -3,
        Sydney: 2,
        London: -4,
      };

      expectedRuns +=
        venueAdjustments[
          coachVenue
        ] || 0;

      /*
        Pitch
      */

      if (coachPitch === "Fast") {
        expectedRuns -= 3;
      }

      if (coachPitch === "Spin") {
        expectedRuns -= 4;
      }

      if (coachPitch === "Balanced") {
        expectedRuns += 2;
      }

      /*
        Opponent
      */

      const opponentStrength =
        TEAM_STRENGTHS[
          coachOpponent
        ] || 80;

      expectedRuns -=
        (
          opponentStrength - 70
        ) * 0.10;

      /*
        Form boost
      */

      if (recentAverage >= 70) {
        confidence += 12;
      } else if (
        recentAverage >= 50
      ) {
        confidence += 6;
      } else if (
        recentAverage < 30
      ) {
        confidence -= 10;
      }

      expectedRuns =
        Math.round(
          clamp(
            expectedRuns,
            10,
            150
          )
        );

      confidence =
        Math.round(
          clamp(
            confidence,
            50,
            98
          )
        );

      let recommendation =
        "CONSIDER REPLACEMENT";

      if (
        confidence >= 82 &&
        expectedRuns >= 50
      ) {
        recommendation =
          "START THIS PLAYER";
      } else if (
        confidence >= 68
      ) {
        recommendation =
          "SAFE TO PLAY";
      }

      const matchupRating =
        Math.round(
          clamp(
            100 -
            (
              opponentStrength - 50
            ) *
            0.7,
            35,
            92
          )
        );

      setCoachReport({

        expectedRuns,

        confidence,

        formAverage:
          recentAverage.toFixed(1),

        battingAverage,

        strikeRate,

        matchupRating,

        recommendation,

        dataSource:
          analytics
            ? "Live MongoDB analytics"
            : "Career profile",

        condition:
          coachPitch === "Fast"
            ? "Fast conditions may expose technical weaknesses against high pace."
            : coachPitch === "Spin"
            ? "Spin-friendly conditions increase the importance of strike rotation and footwork."
            : "Balanced conditions provide a neutral scoring environment.",

        opponentInsight:
          `${coachPlayer} is being evaluated against ${coachOpponent} using career output, recent form, venue, pitch and opponent strength.`,

      });
    };


  /* =========================================================
     INJURY / WORKLOAD ENGINE
  ========================================================= */

  const analyzeInjury =
    () => {

      let fatigue =
        recentMatches * 5;

      fatigue +=
        Math.max(
          0,
          playerAge - 25
        ) * 1.4;

      if (
        previousInjury === "Yes"
      ) {
        fatigue += 20;
      }

      fatigue =
        Math.round(
          clamp(
            fatigue,
            5,
            95
          )
        );

      let risk = "Low";

      if (fatigue >= 80) {
        risk = "High";
      } else if (
        fatigue >= 60
      ) {
        risk = "Moderate";
      }

      const recommendation =
        risk === "High"
          ? "REST THIS PLAYER"
          : risk === "Moderate"
          ? "ROTATE THIS PLAYER"
          : "SAFE TO PLAY";

      const replacements = {
        "Virat Kohli":
          "Shubman Gill",

        "Rohit Sharma":
          "Yashasvi Jaiswal",

        "Jasprit Bumrah":
          "Mohammed Siraj",

        "KL Rahul":
          "Rishabh Pant",
      };

      setInjuryReport({

        fatigue,

        risk,

        recommendation,

        replacement:
          replacements[
            coachPlayer
          ] ||
          "Best available replacement",

        recovery:
          risk === "High"
            ? "5–7 days"
            : risk === "Moderate"
            ? "2–3 days"
            : "Normal workload",

      });
    };


  /* =========================================================
     MATCH CONFIDENCE
  ========================================================= */

  const predictionConfidence =
    prediction
      ? Math.max(
          prediction.probability?.[
            team1
          ] || 0,
          prediction.probability?.[
            team2
          ] || 0
        )
      : 0;


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="ai-page">

      <div className="ai-page-inner">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="ai-lab-header">

          <div>

            <span className="ai-lab-eyebrow">
              SMARTCRICKET AI
            </span>

            <h1>
              AI Lab
            </h1>

            <p>
              Multi-layer cricket intelligence engine
              powered by match data, player analytics,
              form, conditions and predictive models.
            </p>

          </div>

          <div className="ai-status-card">

            <span className="status-dot" />

            <div>
              <strong>
                AI ENGINE
              </strong>

              <span>
                Online
              </span>
            </div>

          </div>

        </div>


        {/* =================================================
            TABS
        ================================================= */}

        <div className="ai-tabs">

          {[
            ["prediction", "Match AI"],
            ["simulator", "Simulator"],
            ["player", "Player AI"],
            ["strategy", "Strategy"],
            ["coach", "AI Coach"],
          ].map(([value, label]) => (

            <button
              key={value}
              className={
                module === value
                  ? "active"
                  : ""
              }
              onClick={() =>
                setModule(value)
              }
            >
              {label}
            </button>

          ))}

        </div>


        {/* =================================================
            MATCH PREDICTION
        ================================================= */}

        {module === "prediction" && (

          <div className="ai-bento">

            <div className="bento-card match-setup-card">

              <div className="card-label">
                MATCH INTELLIGENCE
              </div>

              <h2>
                AI Match Predictor
              </h2>

              <p className="card-description">
                Combine team strength, toss,
                venue and format before running
                the prediction engine.
              </p>

              <div className="ai-form-grid">

                <label>
                  <span>Team 1</span>

                  <select
                    value={team1}
                    onChange={(e) =>
                      setTeam1(e.target.value)
                    }
                  >
                    {TEAM_OPTIONS.map((team) => (
                      <option
                        key={team}
                        value={team}
                      >
                        {team}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Team 2</span>

                  <select
                    value={team2}
                    onChange={(e) =>
                      setTeam2(e.target.value)
                    }
                  >
                    {TEAM_OPTIONS.map((team) => (
                      <option
                        key={team}
                        value={team}
                      >
                        {team}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Venue</span>

                  <select
                    value={venue}
                    onChange={(e) =>
                      setVenue(e.target.value)
                    }
                  >
                    {VENUES.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Format</span>

                  <select
                    value={matchFormat}
                    onChange={(e) =>
                      setMatchFormat(
                        e.target.value
                      )
                    }
                  >
                    {FORMATS.map((format) => (
                      <option
                        key={format}
                        value={format}
                      >
                        {format}
                      </option>
                    ))}
                  </select>
                </label>

              </div>

              <div className="toss-row">

                <button
                  className="btn-secondary"
                  onClick={runToss}
                >
                  Simulate Toss
                </button>

                <span>
                  Toss:
                  <strong>
                    {tossWinner}
                  </strong>
                </span>

              </div>

              <button
                className="btn-primary ai-main-button"
                onClick={getAIPrediction}
                disabled={
                  loadingPrediction
                }
              >
                {loadingPrediction
                  ? "AI ENGINE RUNNING..."
                  : "RUN AI PREDICTION →"}
              </button>

            </div>


            {/* MODEL STACK */}

            <div className="bento-card model-card">

              <div className="card-label">
                MODEL STACK
              </div>

              <div className="model-stack">

                <div>
                  <span>01</span>
                  <strong>Team Strength</strong>
                </div>

                <div>
                  <span>02</span>
                  <strong>Venue Factor</strong>
                </div>

                <div>
                  <span>03</span>
                  <strong>Toss Impact</strong>
                </div>

                <div>
                  <span>04</span>
                  <strong>Format Intelligence</strong>
                </div>

                <div>
                  <span>05</span>
                  <strong>AI Prediction</strong>
                </div>

              </div>

            </div>


            {/* RESULT */}

            {prediction && (

              <div className="bento-card prediction-main-card">

                <div className="result-top">

                  <div>

                    <span className="card-label">
                      AI VERDICT
                    </span>

                    <h2>
                      {prediction.winner}
                    </h2>

                    <p>
                      Predicted winner based on
                      current match conditions.
                    </p>

                  </div>

                  <div className="confidence-ring">
                    <strong>
                      {predictionConfidence}%
                    </strong>

                    <span>
                      CONFIDENCE
                    </span>
                  </div>

                </div>


                <div className="probability-grid">

                  <div className="probability-team">

                    <div className="probability-head">
                      <strong>
                        {team1}
                      </strong>

                      <span>
                        {
                          prediction
                            .probability?.[
                              team1
                            ] ?? 0
                        }%
                      </span>
                    </div>

                    <div className="probability-bar">
                      <div
                        style={{
                          width: `${
                            prediction
                              .probability?.[
                                team1
                              ] ?? 0
                          }%`,
                        }}
                      />
                    </div>

                  </div>


                  <div className="probability-team">

                    <div className="probability-head">
                      <strong>
                        {team2}
                      </strong>

                      <span>
                        {
                          prediction
                            .probability?.[
                              team2
                            ] ?? 0
                        }%
                      </span>
                    </div>

                    <div className="probability-bar">
                      <div
                        style={{
                          width: `${
                            prediction
                              .probability?.[
                                team2
                              ] ?? 0
                          }%`,
                        }}
                      />
                    </div>

                  </div>

                </div>


                <div className="ai-reason-grid">

                  <div>
                    <span>VENUE</span>
                    <strong>{venue}</strong>
                  </div>

                  <div>
                    <span>FORMAT</span>
                    <strong>
                      {matchFormat}
                    </strong>
                  </div>

                  <div>
                    <span>TOSS</span>
                    <strong>
                      {tossWinner}
                    </strong>
                  </div>

                </div>


                <Link
                  to="/match/ai-preview"
                  state={{
                    isUpcoming: true,

                    aiData: {
                      team1,
                      team2,
                      venue,
                      format: matchFormat,
                      date: "AI Preview",

                      prediction: {
                        winner:
                          prediction.winner,

                        team1Win:
                          prediction
                            .probability?.[
                              team1
                            ] ?? 0,

                        team2Win:
                          prediction
                            .probability?.[
                              team2
                            ] ?? 0,

                        confidence:
                          predictionConfidence,
                      },

                      projectedScore: {
                        team1:
                          matchFormat === "T20"
                            ? 165
                            : 260,

                        team2:
                          matchFormat === "T20"
                            ? 158
                            : 248,
                      },

                      recentAverage: {
                        team1:
                          TEAM_STRENGTHS[
                            team1
                          ],

                        team2:
                          TEAM_STRENGTHS[
                            team2
                          ],
                      },

                      keyPlayers: [],

                      matchup: {
                        batter: team1,
                        bowler: team2,

                        description:
                          "AI matchup generated from team and contextual strength.",

                        advantage:
                          prediction.winner,
                      },

                      aiReason:
                        `${prediction.winner} is currently favoured using team strength, toss, venue and format inputs.`,

                      predictedXI: {
                        team1: [],
                        team2: [],
                      },

                      venueStats: {
                        averageFirstInnings: "—",
                        averageSecondInnings: "—",
                        highestScore: "—",
                        lowestScore: "—",
                        battingFirstWin: "—",
                        pitch: "Balanced",
                      },

                      strategy: {
                        team1: [
                          "Build powerplay pressure.",
                          "Target favourable matchups.",
                          "Control middle overs.",
                        ],

                        team2: [
                          "Attack the opposition top order.",
                          "Rotate bowling intelligently.",
                          "Finish strongly.",
                        ],
                      },

                      tossRecommendation:
                        `${tossWinner} should assess conditions before choosing to bat or bowl.`,
                    },
                  }}
                  className="match-button"
                >
                  OPEN FULL MATCH ANALYSIS →
                </Link>

              </div>

            )}


            {/* QUICK METRICS */}

            <div className="bento-card metric-card">

              <span>TEAM 1 STRENGTH</span>

              <strong>
                {TEAM_STRENGTHS[team1]}
              </strong>

              <small>
                {team1}
              </small>

            </div>


            <div className="bento-card metric-card">

              <span>TEAM 2 STRENGTH</span>

              <strong>
                {TEAM_STRENGTHS[team2]}
              </strong>

              <small>
                {team2}
              </small>

            </div>

          </div>

        )}


        {/* =================================================
            SIMULATOR
        ================================================= */}

        {module === "simulator" && (

          <div className="ai-bento">

            <div className="bento-card simulator-main">

              <div className="card-label">
                MATCH SIMULATION
              </div>

              <h2>
                AI Match Simulator
              </h2>

              <p className="card-description">
                Simulate ball-by-ball match flow
                using probabilistic outcomes.
              </p>

              <button
                className="btn-primary"
                onClick={
                  startSimulation
                }
                disabled={
                  isSimulating
                }
              >
                {isSimulating
                  ? "SIMULATION RUNNING..."
                  : "START SIMULATION →"}
              </button>

              {simulation && (

                <div className="simulation-score">

                  <span>
                    INNINGS{" "}
                    {simulation.innings}
                  </span>

                  <strong>
                    {simulation.battingTeam}
                  </strong>

                  <div className="big-score">
                    {simulation.score}
                  </div>

                  <p>
                    Over{" "}
                    {simulation.over}
                  </p>

                  {simulation.target && (
                    <p>
                      Target:{" "}
                      {simulation.target}
                    </p>
                  )}

                  {simulation.winner && (
                    <div className="simulation-winner">
                      🏆{" "}
                      {simulation.winner}
                      {" "}WIN
                    </div>
                  )}

                </div>

              )}

            </div>


            <div className="bento-card commentary-card">

              <div className="card-label">
                LIVE AI COMMENTARY
              </div>

              <ul className="commentary">

                {commentary.length === 0 ? (
                  <li>
                    Simulation waiting to start...
                  </li>
                ) : (
                  commentary.map(
                    (item, index) => (
                      <li
                        key={index}
                        className={
                          index === 0
                            ? "latest"
                            : ""
                        }
                      >
                        {item}
                      </li>
                    )
                  )
                )}

              </ul>

            </div>

          </div>

        )}


        {/* =================================================
            PLAYER AI
        ================================================= */}

        {module === "player" && (

          <div className="ai-bento">

            <div className="bento-card player-setup-card">

              <div className="card-label">
                PLAYER INTELLIGENCE
              </div>

              <h2>
                AI Performance Predictor
              </h2>

              <p className="card-description">
                Uses career statistics, recent form,
                opponent strength, venue and format.
              </p>

              <div className="ai-form-grid">

                <label>
                  <span>Player</span>

                  <select
                    value={
                      selectedPlayer
                    }
                    onChange={(e) =>
                      setSelectedPlayer(
                        e.target.value
                      )
                    }
                  >
                    {PLAYER_OPTIONS.map(
                      (player) => (
                        <option
                          key={player}
                          value={player}
                        >
                          {player}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span>Opponent</span>

                  <select
                    value={
                      playerOpponent
                    }
                    onChange={(e) =>
                      setPlayerOpponent(
                        e.target.value
                      )
                    }
                  >
                    {TEAM_OPTIONS.map(
                      (team) => (
                        <option
                          key={team}
                          value={team}
                        >
                          {team}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span>Venue</span>

                  <select
                    value={
                      playerVenue
                    }
                    onChange={(e) =>
                      setPlayerVenue(
                        e.target.value
                      )
                    }
                  >
                    {VENUES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span>Format</span>

                  <select
                    value={
                      playerFormat
                    }
                    onChange={(e) =>
                      setPlayerFormat(
                        e.target.value
                      )
                    }
                  >
                    {FORMATS.map(
                      (format) => (
                        <option
                          key={format}
                          value={format}
                        >
                          {format}
                        </option>
                      )
                    )}
                  </select>
                </label>

              </div>

              <button
                className="btn-primary"
                onClick={
                  predictPlayer
                }
                disabled={
                  loadingPlayer
                }
              >
                {loadingPlayer
                  ? "ANALYSING DATA..."
                  : "PREDICT PERFORMANCE →"}
              </button>

            </div>


            {playerPrediction && (

              <div className="bento-card player-result-card">

                <div className="player-result-header">

                  <div>

                    <span className="card-label">
                      AI PLAYER VERDICT
                    </span>

                    <h2>
                      {playerPrediction.name}
                    </h2>

                    <p>
                      vs{" "}
                      {playerOpponent}
                      {" • "}
                      {playerFormat}
                    </p>

                  </div>

                  <div className="confidence-ring">
                    <strong>
                      {
                        playerPrediction
                          .confidence
                      }%
                    </strong>

                    <span>
                      CONFIDENCE
                    </span>
                  </div>

                </div>


                <div className="player-stat-bento">

                  {playerPrediction.runs !==
                    undefined && (

                    <div>
                      <span>
                        EXPECTED RUNS
                      </span>

                      <strong>
                        {
                          playerPrediction
                            .runs
                        }
                      </strong>
                    </div>

                  )}

                  {playerPrediction.strikeRate !==
                    undefined && (

                    <div>
                      <span>
                        PROJECTED SR
                      </span>

                      <strong>
                        {
                          playerPrediction
                            .strikeRate
                        }
                      </strong>
                    </div>

                  )}

                  {playerPrediction.wickets !==
                    undefined && (

                    <div>
                      <span>
                        EXPECTED WICKETS
                      </span>

                      <strong>
                        {
                          playerPrediction
                            .wickets
                        }
                      </strong>
                    </div>

                  )}

                  {playerPrediction.fiftyProbability !==
                    undefined && (

                    <div>
                      <span>
                        50+ CHANCE
                      </span>

                      <strong>
                        {
                          playerPrediction
                            .fiftyProbability
                        }%
                      </strong>
                    </div>

                  )}

                  {playerPrediction.centuryProbability !==
                    undefined && (

                    <div>
                      <span>
                        100+ CHANCE
                      </span>

                      <strong>
                        {
                          playerPrediction
                            .centuryProbability
                        }%
                      </strong>
                    </div>

                  )}

                  {playerPrediction.dismissalRisk !==
                    undefined && (

                    <div>
                      <span>
                        DISMISSAL RISK
                      </span>

                      <strong>
                        {
                          playerPrediction
                            .dismissalRisk
                        }%
                      </strong>
                    </div>

                  )}

                </div>


                <div className="data-source">

                  <span>
                    DATA SOURCE
                  </span>

                  <strong>
                    {
                      playerPrediction
                        .dataSource
                    }
                  </strong>

                </div>

              </div>

            )}


            {/* LIVE DATABASE DATA */}

            <div className="bento-card database-card">

              <div className="card-label">
                MONGODB PERFORMANCE DATA
              </div>

              {playerAnalytics ? (

                <div className="database-stats">

                  <div>
                    <span>
                      MATCHES
                    </span>

                    <strong>
                      {
                        playerAnalytics
                          .batting
                          ?.matches ?? 0
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      RUNS
                    </span>

                    <strong>
                      {
                        playerAnalytics
                          .batting
                          ?.runs ?? 0
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      AVG
                    </span>

                    <strong>
                      {
                        playerAnalytics
                          .batting
                          ?.average ?? 0
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      SR
                    </span>

                    <strong>
                      {
                        playerAnalytics
                          .batting
                          ?.strikeRate ?? 0
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      WICKETS
                    </span>

                    <strong>
                      {
                        playerAnalytics
                          .bowling
                          ?.wickets ?? 0
                      }
                    </strong>
                  </div>

                </div>

              ) : (

                <p className="empty-data">
                  Run Player Prediction to
                  load historical Cricsheet
                  data from MongoDB.
                </p>

              )}

            </div>

          </div>

        )}


        {/* =================================================
            STRATEGY
        ================================================= */}

        {module === "strategy" && (
          <div className="strategy-wrapper">
            <StrategyEngine />
          </div>
        )}

      </div>


      {/* =====================================================
          AI COACH
      ===================================================== */}

      {module === "coach" && (

        <div className="ai-page-inner coach-section">

          <div className="bento-card coach-main-card">

            <div className="card-label">
              DECISION INTELLIGENCE
            </div>

            <h2>
              🧠 AI Performance Coach
            </h2>

            <p className="card-description">
              Generate a tactical player report
              using career statistics, recent form,
              opponent strength, venue and pitch.
            </p>


            <div className="ai-form-grid">

              <label>
                <span>Player</span>

                <select
                  value={coachPlayer}
                  onChange={(e) =>
                    setCoachPlayer(
                      e.target.value
                    )
                  }
                >
                  {PLAYER_OPTIONS.map(
                    (player) => (
                      <option
                        key={player}
                        value={player}
                      >
                        {player}
                      </option>
                    )
                  )}
                </select>
              </label>


              <label>
                <span>Format</span>

                <select
                  value={coachFormat}
                  onChange={(e) =>
                    setCoachFormat(
                      e.target.value
                    )
                  }
                >
                  {FORMATS.map(
                    (format) => (
                      <option
                        key={format}
                        value={format}
                      >
                        {format}
                      </option>
                    )
                  )}
                </select>
              </label>


              <label>
                <span>Opponent</span>

                <select
                  value={coachOpponent}
                  onChange={(e) =>
                    setCoachOpponent(
                      e.target.value
                    )
                  }
                >
                  {TEAM_OPTIONS.map(
                    (team) => (
                      <option
                        key={team}
                        value={team}
                      >
                        {team}
                      </option>
                    )
                  )}
                </select>
              </label>


              <label>
                <span>Venue</span>

                <select
                  value={coachVenue}
                  onChange={(e) =>
                    setCoachVenue(
                      e.target.value
                    )
                  }
                >
                  {VENUES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>


              <label>
                <span>Pitch</span>

                <select
                  value={coachPitch}
                  onChange={(e) =>
                    setCoachPitch(
                      e.target.value
                    )
                  }
                >
                  <option>Fast</option>
                  <option>Balanced</option>
                  <option>Spin</option>
                  <option>Seam</option>
                </select>
              </label>


              <label>
                <span>Opponent Country</span>

                <select
                  value={coachCountry}
                  onChange={(e) =>
                    setCoachCountry(
                      e.target.value
                    )
                  }
                >
                  <option>India</option>
                  <option>Australia</option>
                  <option>England</option>
                  <option>South Africa</option>
                  <option>New Zealand</option>
                  <option>Pakistan</option>
                </select>
              </label>

            </div>


            <button
              className="btn-primary"
              onClick={
                analyzeCoach
              }
            >
              GENERATE AI COACH REPORT →
            </button>

          </div>


          {coachReport && (

            <div className="ai-bento coach-result-grid">

              <div className="bento-card coach-verdict">

                <span className="card-label">
                  FINAL DECISION
                </span>

                <h2>
                  {coachReport.recommendation}
                </h2>

                <p>
                  {coachPlayer} is being evaluated
                  against {coachOpponent}.
                </p>

                <div className="decision-score">
                  {coachReport.confidence}%
                </div>

                <span>
                  AI CONFIDENCE
                </span>

              </div>


              <div className="bento-card coach-stat-card">

                <span>
                  EXPECTED RUNS
                </span>

                <strong>
                  {coachReport.expectedRuns}
                </strong>

              </div>


              <div className="bento-card coach-stat-card">

                <span>
                  CAREER AVG
                </span>

                <strong>
                  {coachReport.battingAverage}
                </strong>

              </div>


              <div className="bento-card coach-stat-card">

                <span>
                  RECENT FORM
                </span>

                <strong>
                  {coachReport.formAverage}
                </strong>

              </div>


              <div className="bento-card coach-stat-card">

                <span>
                  MATCHUP RATING
                </span>

                <strong>
                  {coachReport.matchupRating}
                </strong>

              </div>


              <div className="bento-card coach-insight-card">

                <span className="card-label">
                  AI INSIGHTS
                </span>

                <ul>

                  <li>
                    {coachReport.condition}
                  </li>

                  <li>
                    {coachReport.opponentInsight}
                  </li>

                  <li>
                    Data source:
                    {" "}
                    {coachReport.dataSource}
                  </li>

                </ul>

              </div>

            </div>

          )}


          {/* =================================================
              INJURY
          ================================================= */}

          <div className="bento-card injury-card">

            <div>

              <span className="card-label">
                WORKLOAD INTELLIGENCE
              </span>

              <h2>
                🩺 AI Injury Risk Predictor
              </h2>

              <p>
                Estimate workload-related risk
                before selection decisions.
              </p>

            </div>


            <div className="injury-input-grid">

              <label>
                <span>Age</span>

                <input
                  type="number"
                  value={playerAge}
                  onChange={(e) =>
                    setPlayerAge(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </label>


              <label>
                <span>
                  Matches / 30 Days
                </span>

                <input
                  type="number"
                  value={recentMatches}
                  onChange={(e) =>
                    setRecentMatches(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </label>


              <label>
                <span>
                  Previous Injury
                </span>

                <select
                  value={
                    previousInjury
                  }
                  onChange={(e) =>
                    setPreviousInjury(
                      e.target.value
                    )
                  }
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </label>

            </div>


            <button
              className="btn-primary"
              onClick={
                analyzeInjury
              }
            >
              CALCULATE RISK →
            </button>


            {injuryReport && (

              <div className="injury-result">

                <div className="fatigue-meter">

                  <div className="fatigue-head">

                    <span>
                      FATIGUE SCORE
                    </span>

                    <strong>
                      {injuryReport.fatigue}
                      /100
                    </strong>

                  </div>

                  <div className="probability-bar">
                    <div
                      style={{
                        width: `${injuryReport.fatigue}%`,
                      }}
                    />
                  </div>

                </div>


                <div className="injury-grid">

                  <div>
                    <span>
                      RISK
                    </span>

                    <strong>
                      {injuryReport.risk}
                    </strong>
                  </div>

                  <div>
                    <span>
                      RECOVERY
                    </span>

                    <strong>
                      {injuryReport.recovery}
                    </strong>
                  </div>

                  <div>
                    <span>
                      REPLACEMENT
                    </span>

                    <strong>
                      {
                        injuryReport
                          .replacement
                      }
                    </strong>
                  </div>

                </div>


                <div className="decision-banner">
                  {injuryReport.recommendation}
                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default AILab;