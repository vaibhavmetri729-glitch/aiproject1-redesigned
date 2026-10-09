import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "./MatchCenter.css";

const API_URL = "http://localhost:5000/api/matches";

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInningsTeam(innings, match) {
  if (!innings) return "Unknown team";

  // Cricsheet innings commonly use team names in innings[].team.
  if (innings.team) return innings.team;

  // Some datasets may use team names in innings[].teamName.
  if (innings.teamName) return innings.teamName;

  // Fallback: match innings order to the teams array.
  const index = match.innings?.indexOf(innings) ?? -1;

  return match.teams?.[index] || "Unknown team";
}

function getOvers(innings) {
  if (!innings) return "—";

  // If your stored data has a direct overs value, use it.
  if (innings.overs !== undefined && innings.overs !== null) {
    return innings.overs;
  }

  // Otherwise, calculate overs from Cricsheet deliveries.
  const deliveries = innings.oversData || innings.deliveries;

  if (!Array.isArray(deliveries)) {
    return "—";
  }

  let legalBalls = 0;

  deliveries.forEach((over) => {
    const balls = Array.isArray(over)
      ? over
      : Object.values(over || {}).flat();

    balls.forEach((ball) => {
      const extras = ball?.extras || {};

      if (!extras.wides && !extras.noballs) {
        legalBalls += 1;
      }
    });
  });

  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function getScore(innings) {
  if (!innings) return "—";

  if (innings.runs !== undefined && innings.runs !== null) {
    return `${innings.runs}/${innings.wickets ?? 0}`;
  }

  return "—";
}

function MatchCenter() {
  const { id } = useParams();
  const location = useLocation();

  const [match, setMatch] = useState(location.state?.match || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMatch() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/${encodeURIComponent(id)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load this match.");
        }

        setMatch(data);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Match details error:", err);
        setError(err.message || "Failed to load match details.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchMatch();
    } else {
      setError("No match ID was provided.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="match-center-page">
        <div className="mc-container">
          <div className="mc-message">
            <div className="mc-spinner" />
            <h2>Loading match details...</h2>
            <p>Fetching the selected match from the database.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !match) {
    return (
      <main className="match-center-page">
        <div className="mc-container">
          <div className="mc-message mc-error">
            <h2>Unable to load match</h2>
            <p>{error || "Match data was not found."}</p>
            <Link to="/matches" className="mc-back-button">
              ← Back to Matches
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const teams = match.teams || [];

  const team1 = teams[0] || match.team1 || "Team 1";
  const team2 = teams[1] || match.team2 || "Team 2";

  const innings = Array.isArray(match.innings) ? match.innings : [];

  const winner =
    match.outcome?.winner ||
    match.winner ||
    null;

  const isCompleted = Boolean(winner);

  const status = isCompleted ? "COMPLETED" : "MATCH DETAILS";

  const tossWinner =
    match.toss?.winner ||
    match.tossWinner ||
    "Not available";

  const tossDecision =
    match.toss?.decision ||
    match.tossDecision ||
    "";

  const outcomeText =
    match.outcome?.by?.runs !== undefined
      ? `Won by ${match.outcome.by.runs} runs`
      : match.outcome?.by?.wickets !== undefined
      ? `Won by ${match.outcome.by.wickets} wickets`
      : "";

  return (
    <main className="match-center-page">
      <div className="mc-container">
        {/* HEADER */}

        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">SMARTCRICKET AI</span>
            <h1>Match Centre</h1>
            <p>Complete details of your selected cricket match.</p>
          </div>

          <Link to="/matches" className="mc-back-button">
            ← All Matches
          </Link>
        </header>

        {/* SCOREBOARD */}

        <section className="mc-scoreboard">
          <div className="mc-scoreboard-top">
            <span className="mc-format">
              {match.format || "Cricket"} MATCH
            </span>

            <span
              className={`mc-status ${
                isCompleted ? "completed" : "upcoming"
              }`}
            >
              {status}
            </span>
          </div>

          <p className="mc-series">
            {match.event || match.series || "International Cricket"}
          </p>

          <div className="mc-teams">
            <div className="mc-team">
              <div className="mc-team-badge">
                {team1.charAt(0)}
              </div>

              <h2>{team1}</h2>

              <strong>
                {innings[0]
                  ? getScore(innings[0])
                  : match.team1Score || "—"}
              </strong>

              {innings[0] && (
                <span className="mc-overs">
                  Overs: {getOvers(innings[0])}
                </span>
              )}
            </div>

            <div className="mc-vs">VS</div>

            <div className="mc-team">
              <div className="mc-team-badge">
                {team2.charAt(0)}
              </div>

              <h2>{team2}</h2>

              <strong>
                {innings[1]
                  ? getScore(innings[1])
                  : match.team2Score || "—"}
              </strong>

              {innings[1] && (
                <span className="mc-overs">
                  Overs: {getOvers(innings[1])}
                </span>
              )}
            </div>
          </div>

          <div className="mc-result">
            {winner ? (
              <>
                <strong>{winner} won the match</strong>
                {outcomeText && <span>{outcomeText}</span>}
              </>
            ) : (
              <span>
                Winner not recorded. The match may be upcoming or in progress.
              </span>
            )}
          </div>
        </section>

        {/* MATCH INFORMATION */}

        <section className="mc-info-grid">
          <article className="mc-card">
            <span className="mc-card-label">MATCH DATE</span>
            <h3>{formatDate(match.date)}</h3>
          </article>

          <article className="mc-card">
            <span className="mc-card-label">VENUE</span>
            <h3>{match.venue || "Venue not available"}</h3>
          </article>

          <article className="mc-card">
            <span className="mc-card-label">FORMAT</span>
            <h3>{match.format || "Not available"}</h3>
          </article>

          <article className="mc-card">
            <span className="mc-card-label">GENDER</span>
            <h3>{match.gender || "Not available"}</h3>
          </article>
        </section>

        {/* INNINGS */}

        <section className="mc-section">
          <div className="mc-section-heading">
            <div>
              <span className="mc-eyebrow">SCORECARD</span>
              <h2>Innings Summary</h2>
            </div>
          </div>

          {innings.length > 0 ? (
            <div className="mc-innings-list">
              {innings.map((inn, index) => (
                <article
                  className="mc-innings-card"
                  key={`${getInningsTeam(inn, match)}-${index}`}
                >
                  <div className="mc-innings-team">
                    <div>
                      <h3>{getInningsTeam(inn, match)}</h3>
                      <p>Innings {index + 1}</p>
                    </div>

                    <div className="mc-innings-score">
                      <strong>{getScore(inn)}</strong>
                      <span>Overs: {getOvers(inn)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mc-empty">
              <p>No innings scorecard is available for this match.</p>
            </div>
          )}
        </section>

        {/* TOSS */}

        <section className="mc-section">
          <div className="mc-section-heading">
            <div>
              <span className="mc-eyebrow">MATCH INFORMATION</span>
              <h2>Toss Details</h2>
            </div>
          </div>

          <div className="mc-card mc-toss-card">
            <div>
              <span className="mc-card-label">TOSS WINNER</span>
              <h3>{tossWinner}</h3>
            </div>

            <div>
              <span className="mc-card-label">DECISION</span>
              <h3>
                {tossDecision
                  ? tossDecision.charAt(0).toUpperCase() +
                    tossDecision.slice(1)
                  : "Not available"}
              </h3>
            </div>
          </div>
        </section>

        {/* AI SECTION */}

        <section className="mc-ai-card">
          <div>
            <span className="mc-ai-label">SMARTCRICKET AI</span>
            <h2>Want to analyse this match?</h2>
            <p>
              Open the strategy engine to explore cricket strategies and
              match insights.
            </p>
          </div>

          <Link to="/strategy" className="mc-ai-button">
            Explore AI Strategy →
          </Link>
        </section>
      </div>
    </main>
  );
}

export default MatchCenter;