import { useState } from "react";
import { TEAM_STRENGTHS } from "../data/mockData";
import "./StrategyEngine.css";
import html2pdf from "html2pdf.js";

const TEAM_OPTIONS = Object.keys(TEAM_STRENGTHS);

// Demo squad data for the teams available in TEAM_STRENGTHS.
const TEAM_SQUADS = {
  India: {
    playingXI: ["Rohit Sharma", "Shubman Gill", "Virat Kohli", "KL Rahul", "Hardik Pandya", "Ravindra Jadeja", "Axar Patel", "Jasprit Bumrah", "Mohammed Shami", "Mohammed Siraj", "Kuldeep Yadav"],
    battingOrder: ["Rohit Sharma", "Shubman Gill", "Virat Kohli", "KL Rahul", "Hardik Pandya"],
    bowlingPlan: ["Jasprit Bumrah: attack during the powerplay and at the death.", "Mohammed Shami: use seam movement with the new ball.", "Kuldeep Yadav: attack for wickets in the middle overs.", "Ravindra Jadeja: control the run rate and build pressure."],
    leadBowler: "Jasprit Bumrah",
  },

  Australia: {
    playingXI: ["Travis Head", "David Warner", "Mitchell Marsh", "Steve Smith", "Marnus Labuschagne", "Glenn Maxwell", "Josh Inglis", "Pat Cummins", "Mitchell Starc", "Adam Zampa", "Josh Hazlewood"],
    battingOrder: ["Travis Head", "David Warner", "Mitchell Marsh", "Steve Smith", "Glenn Maxwell"],
    bowlingPlan: ["Mitchell Starc: attack with left-arm pace and swing.", "Josh Hazlewood: hit consistent hard lengths.", "Pat Cummins: use pace changes in the middle and death overs.", "Adam Zampa: attack for wickets through middle overs."],
    leadBowler: "Mitchell Starc",
  },

  England: {
    playingXI: ["Jos Buttler", "Phil Salt", "Ben Duckett", "Joe Root", "Harry Brook", "Liam Livingstone", "Sam Curran", "Chris Woakes", "Jofra Archer", "Adil Rashid", "Mark Wood"],
    battingOrder: ["Phil Salt", "Jos Buttler", "Ben Duckett", "Joe Root", "Harry Brook"],
    bowlingPlan: ["Jofra Archer: use pace and bounce in the powerplay.", "Chris Woakes: swing the new ball.", "Adil Rashid: attack with leg-spin in the middle overs.", "Sam Curran: vary pace at the death."],
    leadBowler: "Jofra Archer",
  },

  Pakistan: {
    playingXI: ["Babar Azam", "Mohammad Rizwan", "Fakhar Zaman", "Saim Ayub", "Iftikhar Ahmed", "Shadab Khan", "Mohammad Nawaz", "Shaheen Afridi", "Haris Rauf", "Naseem Shah", "Abrar Ahmed"],
    battingOrder: ["Babar Azam", "Mohammad Rizwan", "Fakhar Zaman", "Saim Ayub", "Iftikhar Ahmed"],
    bowlingPlan: ["Shaheen Afridi: target early wickets with left-arm swing.", "Naseem Shah: maintain attacking line and length.", "Haris Rauf: use pace and hard lengths.", "Shadab Khan: take wickets with leg-spin in the middle overs."],
    leadBowler: "Shaheen Afridi",
  },

  "South Africa": {
    playingXI: ["Quinton de Kock", "Aiden Markram", "Temba Bavuma", "Rassie van der Dussen", "Heinrich Klaasen", "David Miller", "Marco Jansen", "Keshav Maharaj", "Kagiso Rabada", "Anrich Nortje", "Tabraiz Shamsi"],
    battingOrder: ["Quinton de Kock", "Aiden Markram", "Temba Bavuma", "Rassie van der Dussen", "Heinrich Klaasen"],
    bowlingPlan: ["Kagiso Rabada: attack with pace in the powerplay.", "Anrich Nortje: use extra pace and bounce.", "Marco Jansen: exploit bounce and left-arm angle.", "Keshav Maharaj: control the middle overs with spin."],
    leadBowler: "Kagiso Rabada",
  },

  "New Zealand": {
    playingXI: ["Devon Conway", "Finn Allen", "Kane Williamson", "Daryl Mitchell", "Glenn Phillips", "Tom Latham", "Mitchell Santner", "Matt Henry", "Tim Southee", "Lockie Ferguson", "Ish Sodhi"],
    battingOrder: ["Devon Conway", "Finn Allen", "Kane Williamson", "Daryl Mitchell", "Glenn Phillips"],
    bowlingPlan: ["Matt Henry: swing the new ball and attack the stumps.", "Tim Southee: use seam movement early.", "Lockie Ferguson: use pace and bounce.", "Mitchell Santner: control the middle overs with spin."],
    leadBowler: "Matt Henry",
  },
};

const DEFAULT_SQUAD = TEAM_SQUADS.India;

const VENUES = [
  "Mumbai",
  "Delhi",
  "Melbourne",
  "Sydney",
  "London",
];

const VENUE_INTELLIGENCE = {
  Mumbai: {
    pitch: "Batting paradise with dew in night matches",
    average: "300+ ODI / 180+ T20",
    tactic: "Bat first if possible and preserve wickets for the final 10 overs.",
  },

  Delhi: {
    pitch: "Dry surface that helps spin as the match progresses",
    average: "280+ ODI / 165+ T20",
    tactic: "Play an extra spinner and attack in the middle overs.",
  },

  Melbourne: {
    pitch: "Fast and bouncy wicket with carry for pacers",
    average: "290+ ODI / 170+ T20",
    tactic: "Use pace and bounce early with attacking fielders.",
  },

  Sydney: {
    pitch: "Balanced surface with assistance for spin later",
    average: "285+ ODI / 168+ T20",
    tactic: "Use wrist spin after the powerplay and target square boundaries.",
  },

  London: {
    pitch: "Seam-friendly conditions with swing under cloudy weather",
    average: "270+ ODI / 160+ T20",
    tactic: "Pick an extra seamer and bowl full with attacking slips.",
  },
};

const OPPONENT_ANALYSIS = {
  Australia: {
    weakness: "Middle order can be pressured by quality wrist spin.",
    powerplay: "Attack with swing and keep attacking fielders early.",
    middle: "Introduce wrist spin immediately after the powerplay.",
    death: "Use yorkers and slower balls against the finishers.",
    target: "175+ in T20 • 300+ in ODI • 380+ in Test",
    matchup: "Kuldeep vs Steve Smith • Bumrah vs Travis Head",
  },

  England: {
    weakness: "Aggressive top order can collapse under sustained pressure.",
    powerplay: "Use pace and bounce with attacking fields.",
    middle: "Slow the scoring rate with spin and squeeze singles.",
    death: "Wide yorkers outside off stump.",
    target: "170+ in T20 • 290+ in ODI • 360+ in Test",
    matchup: "Bumrah vs Buttler • Jadeja vs Root",
  },

  Pakistan: {
    weakness: "Middle overs scoring can drop against quality spin.",
    powerplay: "Attack with swing and seam movement.",
    middle: "Bring spinners immediately after the powerplay.",
    death: "Mix slower balls with hard lengths.",
    target: "165+ in T20 • 285+ in ODI • 350+ in Test",
    matchup: "Kuldeep vs Babar • Bumrah vs Rizwan",
  },

  India: {
    weakness: "Early wickets can expose the middle order.",
    powerplay: "Use swing and aggressive seam bowling.",
    middle: "Attack right-handers with leg spin.",
    death: "Target the stumps with yorkers.",
    target: "180+ in T20 • 305+ in ODI • 390+ in Test",
    matchup: "Starc vs Rohit • Zampa vs Kohli",
  },

  "South Africa": {
    weakness: "Can struggle against quality wrist spin.",
    powerplay: "Attack with pace and bounce.",
    middle: "Use spin to slow the scoring rate.",
    death: "Back-of-length slower balls.",
    target: "170+ in T20 • 295+ in ODI • 370+ in Test",
    matchup: "Kuldeep vs Markram • Bumrah vs Klaasen",
  },

  "New Zealand": {
    weakness: "Lower middle order can struggle against spin.",
    powerplay: "Swing the new ball aggressively.",
    middle: "Attack with left-arm and wrist spin.",
    death: "Use cutters and slower deliveries.",
    target: "165+ in T20 • 285+ in ODI • 355+ in Test",
    matchup: "Jadeja vs Williamson • Bumrah vs Conway",
  },
};

function StrategyEngine() {
  const [team1, setTeam1] = useState("India");
  const [team2, setTeam2] = useState("Australia");
  const [venue, setVenue] = useState("Mumbai");
  const [pitch, setPitch] = useState("Batting");
  const [format, setFormat] = useState("ODI");
  const [tossWinner, setTossWinner] = useState("India");

  const [strategy, setStrategy] = useState(null);

  // GENERATE STRATEGY
  const generateStrategy = () => {
    const opponent =
      OPPONENT_ANALYSIS[team2] ||
      OPPONENT_ANALYSIS.Australia;

    const venueData =
      VENUE_INTELLIGENCE[venue];

    const squad =
      TEAM_SQUADS[team1] || DEFAULT_SQUAD;

    const playingXI = [...squad.playingXI];

    const target =
      format === "T20"
        ? opponent.target.split("•")[0]
        : format === "ODI"
        ? opponent.target.split("•")[1]
        : opponent.target.split("•")[2];

    const confidence =
      venue === "Mumbai" && pitch === "Batting"
        ? 91
        : pitch === "Spin"
        ? 88
        : pitch === "Seam"
        ? 86
        : 84;

    setStrategy({
      playingXI,

      battingOrder: squad.battingOrder,

      bowlingPlan: squad.bowlingPlan,

      powerplay: opponent.powerplay,

      death: opponent.death,

      field:
        "Deep square leg • Long-on • Long-off • Third man • Fine leg • Cover",

      opponentWeakness: opponent.weakness,

      opponentPowerplay: opponent.powerplay,

      opponentMiddle: opponent.middle,

      opponentDeath: opponent.death,

      recommendedTarget: target,

      bestMatchup:
        `${squad.leadBowler} vs ${team2} top order`,

      venuePitch: venueData.pitch,

      venueAverage: venueData.average,

      venueTactic: venueData.tactic,

      confidence,

      ai:
        `${team1} should use its selected XI and ${squad.leadBowler} as a key bowling option against ${team2}. Adapt the batting and bowling plans to the ${venue} conditions, control the powerplay and preserve finishing resources for the final phase.`,

      tossDecision:
        tossWinner === team1
          ? `${team1} won the toss. Bat first is preferred under the current ${pitch.toLowerCase()} conditions.`
          : `${team2} won the toss. ${team1} should prepare for an early bowling challenge and preserve wickets during the chase.`,
    });
  };

  // DOWNLOAD A PROPER STYLED PDF
  const downloadStrategyReport = async () => {
    if (!strategy) {
      alert("Please generate a strategy first.");
      return;
    }

    const reportElement =
      document.querySelector(".strategy-bento");

    if (!reportElement) {
      alert("Strategy report not found.");
      return;
    }

    const options = {
      margin: [8, 8, 8, 8],

      filename: `${team1}_vs_${team2}_Strategy_Report.pdf`,

      image: {
        type: "jpeg",
        quality: 0.98,
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0a0c",
        logging: false,
        windowWidth: 1400,
      },

      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "landscape",
      },

      pagebreak: {
        mode: ["css", "legacy"],
        avoid: [
          ".bento-card",
          ".ai-winning-strategy",
          ".final-ai-card",
        ],
      },
    };

    try {
      await html2pdf()
        .set(options)
        .from(reportElement)
        .save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Unable to generate PDF. Please try again.");
    }
  };

  return (
    <div className="strategy-engine">

      {/* HEADER */}

      <div className="strategy-header bento-hero">
        <div>
          <span className="strategy-eyebrow">
            SMARTCRICKET AI • TACTICAL INTELLIGENCE
          </span>

          <h2>🧠 AI Strategy Engine</h2>

          <p>
            Multi-factor match intelligence combining venue,
            pitch, opponent weaknesses, team composition,
            toss conditions and tactical phases.
          </p>
        </div>

        <div className="ai-live-status">
          <span className="live-dot"></span>
          AI ENGINE READY
        </div>
      </div>

      {/* MATCH SETUP */}

      <div className="strategy-setup bento-card setup-card">

        <div className="bento-card-head">
          <span className="strategy-number">01</span>

          <div>
            <h3>Match Configuration</h3>
            <p>
              Configure the conditions before running
              tactical intelligence.
            </p>
          </div>
        </div>

        <div className="strategy-input-grid">

          <label>
            <span>TEAM 1</span>

            <select
              value={team1}
              onChange={(e) => {
                setTeam1(e.target.value);

                if (tossWinner !== team2) {
                  setTossWinner(e.target.value);
                }
              }}
            >
              {TEAM_OPTIONS.map((team) => (
                <option key={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>

          <div className="vs-badge">
            VS
          </div>

          <label>
            <span>TEAM 2</span>

            <select
              value={team2}
              onChange={(e) =>
                setTeam2(e.target.value)
              }
            >
              {TEAM_OPTIONS.map((team) => (
                <option key={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>VENUE</span>

            <select
              value={venue}
              onChange={(e) =>
                setVenue(e.target.value)
              }
            >
              {VENUES.map((v) => (
                <option key={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>PITCH</span>

            <select
              value={pitch}
              onChange={(e) =>
                setPitch(e.target.value)
              }
            >
              <option>Batting</option>
              <option>Bowling</option>
              <option>Spin</option>
              <option>Seam</option>
            </select>
          </label>

          <label>
            <span>FORMAT</span>

            <select
              value={format}
              onChange={(e) =>
                setFormat(e.target.value)
              }
            >
              <option>ODI</option>
              <option>T20</option>
              <option>Test</option>
            </select>
          </label>

          <label>
            <span>TOSS WINNER</span>

            <select
              value={tossWinner}
              onChange={(e) =>
                setTossWinner(e.target.value)
              }
            >
              <option>{team1}</option>
              <option>{team2}</option>
            </select>
          </label>

        </div>

        <button
          className="btn-primary strategy-generate-btn"
          onClick={generateStrategy}
        >
          ⚡ Generate Tactical Intelligence
        </button>
      </div>

      {/* RESULTS */}

      {strategy && (
        <>
          <div className="strategy-download-wrapper">
            <button
              type="button"
              className="strategy-download-btn"
              onClick={downloadStrategyReport}
            >
              ⬇ Download Strategy PDF
            </button>
          </div>

          <div className="strategy-bento">

            {/* AI EDGE */}

            <div className="bento-card ai-edge-card">

              <span className="strategy-eyebrow">
                AI EDGE
              </span>

              <h3>
                {team1} vs {team2}
              </h3>

              <p>
                {venue} • {pitch} • {format}
              </p>

              <div className="confidence-big">
                {strategy.confidence}%
              </div>

              <span className="confidence-label">
                STRATEGY CONFIDENCE
              </span>

              <div className="confidence-track">
                <div
                  style={{
                    width: `${strategy.confidence}%`,
                  }}
                />
              </div>

              <div className="edge-verdict">
                HIGH TACTICAL EDGE
              </div>
            </div>

            {/* VENUE */}

            <div className="bento-card venue-card">

              <span className="strategy-eyebrow">
                VENUE INTELLIGENCE
              </span>

              <h3>{venue}</h3>

              <p>{strategy.venuePitch}</p>

              <div className="mini-stat">
                <span>EXPECTED CONDITIONS</span>
                <strong>
                  {strategy.venueAverage}
                </strong>
              </div>

              <div className="mini-insight">
                💡 {strategy.venueTactic}
              </div>
            </div>

            {/* PLAYING XI */}

            <div className="bento-card xi-card">

              <div className="bento-card-head">
                <span className="strategy-number">
                  02
                </span>

                <div>
                  <h3>Best Playing XI</h3>
                  <p>
                    AI-selected squad for current conditions.
                  </p>
                </div>
              </div>

              <div className="player-grid">
                {strategy.playingXI.map(
                  (player, index) => (
                    <div
                      className="player-item"
                      key={player}
                    >
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <strong>{player}</strong>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* OPPONENT */}

            <div className="bento-card opponent-card">

              <span className="strategy-eyebrow">
                OPPOSITION SCOUT
              </span>

              <h3>
                {team2} Weakness Map
              </h3>

              <div className="scout-highlight">
                🎯 {strategy.opponentWeakness}
              </div>

              <div className="scout-row">
                <span>POWERPLAY</span>
                <p>
                  {strategy.opponentPowerplay}
                </p>
              </div>

              <div className="scout-row">
                <span>MIDDLE</span>
                <p>
                  {strategy.opponentMiddle}
                </p>
              </div>

              <div className="scout-row">
                <span>DEATH</span>
                <p>
                  {strategy.opponentDeath}
                </p>
              </div>

              <div className="best-matchup">
                ⚔️ {strategy.bestMatchup}
              </div>
            </div>

            {/* BATTING */}

            <div className="bento-card batting-card">

              <div className="bento-card-head">
                <span className="strategy-number">
                  03
                </span>

                <div>
                  <h3>Batting Blueprint</h3>
                  <p>Recommended batting sequence.</p>
                </div>
              </div>

              <div className="batting-order">
                {strategy.battingOrder.map(
                  (player, index) => (
                    <div
                      className="batting-player"
                      key={player}
                    >
                      <span>{index + 1}</span>
                      <strong>{player}</strong>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* BOWLING */}

            <div className="bento-card bowling-card">

              <div className="bento-card-head">
                <span className="strategy-number">
                  04
                </span>

                <div>
                  <h3>Bowling Blueprint</h3>
                  <p>Phase-by-phase bowling plan.</p>
                </div>
              </div>

              <div className="strategy-list">
                {strategy.bowlingPlan.map(
                  (plan, index) => (
                    <div
                      className="strategy-list-item"
                      key={index}
                    >
                      <span>✓</span>
                      <p>{plan}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* POWERPLAY */}

            <div className="bento-card tactic-card-large">

              <span className="strategy-eyebrow">
                POWERPLAY
              </span>

              <h3>⚡ Attack Early</h3>

              <p>{strategy.powerplay}</p>
            </div>

            {/* DEATH */}

            <div className="bento-card tactic-card-large">

              <span className="strategy-eyebrow">
                DEATH OVERS
              </span>

              <h3>🔥 Close the Game</h3>

              <p>{strategy.death}</p>
            </div>

            {/* TOSS */}

            <div className="bento-card toss-card">

              <span className="strategy-eyebrow">
                TOSS INTELLIGENCE
              </span>

              <h3>🪙 Decision Layer</h3>

              <p>{strategy.tossDecision}</p>
            </div>

            {/* FIELD */}

            <div className="bento-card field-card">

              <div className="bento-card-head">
                <span className="strategy-number">
                  05
                </span>

                <div>
                  <h3>Field Placement</h3>
                  <p>
                    Recommended attacking and defensive positions.
                  </p>
                </div>
              </div>

              <div className="field-box">
                {strategy.field}
              </div>
            </div>

            {/* FINAL AI */}

            <div className="ai-winning-strategy final-ai-card">

              <span className="strategy-eyebrow">
                FINAL AI RECOMMENDATION
              </span>

              <h3>
                🏆 Winning Game Plan
              </h3>

              <p>{strategy.ai}</p>

              <div className="final-ai-grid">

                <div>
                  <span>RECOMMENDED TARGET</span>
                  <strong>
                    {strategy.recommendedTarget}
                  </strong>
                </div>

                <div>
                  <span>BEST MATCHUP</span>
                  <strong>
                    {strategy.bestMatchup}
                  </strong>
                </div>

                <div>
                  <span>CONFIDENCE</span>
                  <strong>
                    {strategy.confidence}%
                  </strong>
                </div>

              </div>

              <div className="strategy-confidence">
                <span>
                  SMARTCRICKET AI VERDICT
                </span>

                <strong>
                  HIGH CONFIDENCE
                </strong>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default StrategyEngine;