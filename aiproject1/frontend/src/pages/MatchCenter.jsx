import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "./MatchCenter.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aiproject1-redesigned.onrender.com";

const MATCHES_API = `${API_BASE.replace(/\/$/, "")}/api/matches`;

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getOversInBalls(overs) {
  if (!overs) return 0;

  const [completedOvers, balls] = String(overs).split(".").map(Number);

  return (completedOvers || 0) * 6 + (balls || 0);
}

function calculateRunRate(runs, overs) {
  const balls = getOversInBalls(overs);

  if (!balls) return "0.00";

  return ((Number(runs) / balls) * 6).toFixed(2);
}

function calculateExtras(innings) {
  const batterRuns = (innings.batting || []).reduce(
    (total, player) => total + Number(player.runs || 0),
    0
  );

  const difference = Number(innings.runs || 0) - batterRuns;

  return Math.max(0, difference);
}

function getResult(match) {
  if (match.outcome?.winner) {
    return `${match.outcome.winner} won the match`;
  }

  if (match.outcome?.result) {
    return match.outcome.result;
  }

  return "Match result unavailable";
}

function ScorecardTable({ innings, match }) {
  const batting = innings.batting || [];
  const bowling = innings.bowling || [];

  const extras = calculateExtras(innings);

  return (
    <div className="mc-scorecard-content">

      {/* BATTING SCORECARD */}

      <section className="mc-table-section">
        <div className="mc-section-heading">
          <div>
            <span className="mc-section-label">INNINGS SCORECARD</span>
            <h3>{innings.team} Batting</h3>
          </div>

          <div className="mc-innings-total">
            {innings.runs}/{innings.wickets}
            <span>{innings.overs} overs</span>
          </div>
        </div>

        <div className="mc-table-wrapper">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th>Dismissal</th>
                <th>R</th>
                <th>B</th>
                <th>4s</th>
                <th>6s</th>
                <th>SR</th>
              </tr>
            </thead>

            <tbody>
              {batting.length > 0 ? (
                batting.map((player, index) => (
                  <tr key={`${player.name}-${index}`}>
                    <td className="mc-player-name">
                      {player.name}
                    </td>

                    <td className="mc-dismissal">
                      {player.dismissal || "Not available"}
                    </td>

                    <td className="mc-highlight-number">
                      {player.runs ?? 0}
                    </td>

                    <td>{player.balls ?? 0}</td>
                    <td>{player.fours ?? 0}</td>
                    <td>{player.sixes ?? 0}</td>

                    <td>
                      {Number(player.strikeRate || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="mc-empty">
                    Batting information is not available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mc-extras">
          <span>Extras</span>
          <strong>{extras}</strong>
          <small>
            Total extras inferred from innings and batter totals;
            breakdown unavailable.
          </small>
        </div>

        <div className="mc-total-row">
          <span>Total</span>
          <strong>
            {innings.runs}/{innings.wickets}
          </strong>
          <span>{innings.overs} overs</span>
        </div>
      </section>

      {/* BOWLING SCORECARD */}

      <section className="mc-table-section mc-bowling-section">
        <div className="mc-section-heading">
          <div>
            <span className="mc-section-label">BOWLING FIGURES</span>
            <h3>{getOpposition(match, innings.team)} Bowling</h3>
          </div>
        </div>

        <div className="mc-table-wrapper">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th>O</th>
                <th>M</th>
                <th>R</th>
                <th>W</th>
                <th>ECON</th>
              </tr>
            </thead>

            <tbody>
              {bowling.length > 0 ? (
                bowling.map((player, index) => (
                  <tr key={`${player.name}-${index}`}>
                    <td className="mc-player-name">
                      {player.name}
                    </td>

                    <td>{player.overs || "0"}</td>
                    <td>{player.maidens ?? 0}</td>
                    <td>{player.runs ?? 0}</td>

                    <td className="mc-highlight-number">
                      {player.wickets ?? 0}
                    </td>

                    <td>
                      {Number(player.economy || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="mc-empty">
                    Bowling information is not available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FALL OF WICKETS */}

      <section className="mc-extra-information">
        <h3>Fall of Wickets</h3>
        <p>
          Fall-of-wicket details are not stored in the current
          database record.
        </p>
      </section>

    </div>
  );
}

function getOpposition(match, team) {
  return (match.teams || []).find((item) => item !== team) || "Opposition";
}

export default function MatchCenter() {
  const { id } = useParams();
  const location = useLocation();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeInnings, setActiveInnings] = useState(0);

  const aiData = location.state?.aiData;
  const isUpcoming = location.state?.isUpcoming;

  useEffect(() => {
    let cancelled = false;

    async function fetchMatch() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${MATCHES_API}/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Match not found in the database."
              : "Unable to fetch match details."
          );
        }

        const payload = await response.json();

        const actualMatch =
          payload.match ||
          payload.data ||
          payload;

        if (!actualMatch.innings) {
          throw new Error("This match has no innings scorecard.");
        }

        if (!cancelled) {
          setMatch(actualMatch);
          setActiveInnings(0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) fetchMatch();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const innings = match?.innings || [];

  const currentInnings = innings[activeInnings];

  const topPerformers = useMemo(() => {
    if (!innings.length) return [];

    const players = innings.flatMap((inning) =>
      (inning.batting || []).map((player) => ({
        ...player,
        team: inning.team,
      }))
    );

    return players
      .sort((a, b) => Number(b.runs || 0) - Number(a.runs || 0))
      .slice(0, 3);
  }, [innings]);

  if (loading) {
    return (
      <div className="mc-page mc-state">
        <div className="mc-loader"></div>
        <h2>Loading Match Centre</h2>
        <p>Fetching match details from MongoDB...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="mc-page mc-state">
        <h2>Match unavailable</h2>
        <p>{error || "Match details could not be loaded."}</p>
        <Link to="/matches" className="mc-back-button">
          Back to Matches
        </Link>
      </div>
    );
  }

  return (
    <main className="mc-page">

      {/* TOP NAVIGATION */}

      <div className="mc-topbar">
        <Link to="/matches" className="mc-back">
          ← Back to Matches
        </Link>

        <span className="mc-brand">
          SMARTCRICKET <b>AI</b>
        </span>
      </div>

      {/* MATCH HEADER */}

      <section className="mc-hero">
        <div className="mc-hero-top">
          <span className="mc-format">
            {match.format || "CRICKET"} · {(match.gender || "male").toUpperCase()}
          </span>

          <span className="mc-status">
            {match.outcome?.winner ? "COMPLETED" : "MATCH DETAILS"}
          </span>
        </div>

        <div className="mc-match-title">
          <h1>{match.teams?.[0] || "Team 1"}</h1>

          <div className="mc-vs">VS</div>

          <h1>{match.teams?.[1] || "Team 2"}</h1>
        </div>

        <div className="mc-match-meta">
          <span>📍 {match.venue || "Venue unavailable"}</span>
          <span>📅 {formatDate(match.date)}</span>
        </div>

        {/* TEAM SCORE SUMMARY */}

        <div className="mc-score-summary">
          {innings.map((inning, index) => (
            <div className="mc-team-score" key={`${inning.team}-${index}`}>
              <span>{inning.team}</span>

              <strong>
                {inning.runs}/{inning.wickets}
              </strong>

              <small>
                {inning.overs} overs · RR{" "}
                {calculateRunRate(inning.runs, inning.overs)}
              </small>
            </div>
          ))}
        </div>

        {match.outcome?.winner && (
          <div className="mc-result">
            🏆 {getResult(match)}
          </div>
        )}
      </section>

      {/* MATCH INFORMATION */}

      <section className="mc-info-grid">
        <div className="mc-info-card">
          <span>DATE</span>
          <strong>{formatDate(match.date)}</strong>
        </div>

        <div className="mc-info-card">
          <span>VENUE</span>
          <strong>{match.venue || "Not available"}</strong>
        </div>

        <div className="mc-info-card">
          <span>TOSS WINNER</span>
          <strong>{match.toss?.winner || "Not available"}</strong>
        </div>

        <div className="mc-info-card">
          <span>TOSS DECISION</span>
          <strong>
            {match.toss?.decision
              ? match.toss.decision.toUpperCase()
              : "Not available"}
          </strong>
        </div>
      </section>

      {/* SCORECARD */}

      <section className="mc-main-section">
        <div className="mc-main-heading">
          <div>
            <span className="mc-section-label">FULL MATCH DETAILS</span>
            <h2>Match Scorecard</h2>
          </div>

          <span className="mc-match-id">
            ID: {match.cricsheetId || id}
          </span>
        </div>

        {/* INNINGS TABS */}

        <div className="mc-innings-tabs">
          {innings.map((inning, index) => (
            <button
              key={`${inning.team}-${index}`}
              className={
                activeInnings === index ? "active" : ""
              }
              onClick={() => setActiveInnings(index)}
            >
              {inning.team}
              <span>
                {inning.runs}/{inning.wickets}
              </span>
            </button>
          ))}
        </div>

        {currentInnings ? (
          <ScorecardTable
            innings={currentInnings}
            match={match}
          />
        ) : (
          <div className="mc-empty">No innings information available.</div>
        )}
      </section>

      {/* TOP BATTERS */}

      <section className="mc-main-section">
        <div className="mc-main-heading">
          <div>
            <span className="mc-section-label">PLAYER PERFORMANCE</span>
            <h2>Top Batting Performances</h2>
          </div>
        </div>

        <div className="mc-performer-grid">
          {topPerformers.map((player, index) => (
            <div className="mc-performer-card" key={`${player.name}-${index}`}>
              <span className="mc-performer-rank">
                #{index + 1}
              </span>

              <h3>{player.name}</h3>

              <p>{player.team}</p>

              <strong>{player.runs} <small>runs</small></strong>

              <div>
                {player.balls} balls · {player.fours} fours ·{" "}
                {player.sixes} sixes
              </div>

              <span className="mc-performer-sr">
                Strike Rate: {Number(player.strikeRate || 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PLAYER SQUADS */}

      <section className="mc-main-section">
        <div className="mc-main-heading">
          <div>
            <span className="mc-section-label">MATCH SQUADS</span>
            <h2>Playing Players</h2>
          </div>
        </div>

        <div className="mc-squad-grid">
          {(match.teams || []).map((team) => (
            <div className="mc-squad-card" key={team}>
              <h3>{team}</h3>

              {(match.players?.[team] || []).map((player, index) => (
                <div className="mc-squad-player" key={`${player}-${index}`}>
                  <span>{index + 1}</span>
                  {player}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* AI ANALYSIS */}

      {aiData && isUpcoming && (
        <section className="mc-main-section mc-ai-section">
          <span className="mc-section-label">SMARTCRICKET AI</span>
          <h2>AI Match Prediction</h2>

          <pre>
            {JSON.stringify(aiData, null, 2)}
          </pre>
        </section>
      )}

      <footer className="mc-footer">
        SMARTCRICKET AI · MATCH CENTRE
      </footer>

    </main>
  );
}