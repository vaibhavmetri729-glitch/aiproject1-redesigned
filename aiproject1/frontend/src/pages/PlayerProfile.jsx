import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { playerProfiles } from "../data/playerProfiles";
import PlayerAvatar from "../components/PlayerAvatar";
import "./PlayerProfile.css";

function formColor(score, isPureBowler) {
  if (isPureBowler) {
    if (score >= 4) return "great";
    if (score >= 2) return "good";
    return "poor";
  }

  if (score >= 75) return "great";
  if (score >= 40) return "good";
  return "poor";
}

function PlayerProfile() {
  const { id } = useParams();

  const player = playerProfiles[id];

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [selectedFormat, setSelectedFormat] = useState("ODI");

  // =====================================================
  // FETCH REAL PLAYER ANALYTICS FROM MONGODB
  // =====================================================

  useEffect(() => {
    if (!player?.name) return;

    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        setAnalyticsError("");

        const encodedName = encodeURIComponent(player.name);

        const response = await fetch(
          `http://localhost:5000/api/player-analytics/${encodedName}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch player analytics");
        }

        const data = await response.json();

        setAnalytics(data);

      } catch (error) {
        console.error("PLAYER ANALYTICS ERROR:", error);

        setAnalyticsError(
          "Unable to load live statistics from MongoDB."
        );
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [player?.name]);

  // =====================================================
  // PLAYER NOT FOUND
  // =====================================================

  if (!player) {
    return (
      <div className="profile-page">
        <div className="container profile-notfound">
          <Link to="/players" className="back-link">
            ← Back to Players
          </Link>

          <h1>Player not found</h1>

          <p>
            We don't have a profile for this player yet.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // OLD PROFILE DATA
  // Used for identity/UI information
  // =====================================================

  const c = player.career || {};

  const hasBatting =
    c.runs !== undefined ||
    c.battingAverage !== undefined;

  const hasBowling =
    c.wickets !== undefined ||
    c.bowlingAverage !== undefined;

  const hasKeeping =
    c.catches !== undefined;

  const isPureBowler =
    hasBowling && !hasBatting;

  const pred =
    player.aiPrediction || {};

  const hasBattingPrediction =
    pred.expectedRuns !== undefined;

  const hasBowlingPrediction =
    pred.expectedWickets !== undefined;

  // =====================================================
  // REAL FORMAT DATA
  // =====================================================

  const formatData =
    analytics?.formats?.[selectedFormat];

  const formatBatting =
    formatData?.batting || {};

  const formatBowling =
    formatData?.bowling || {};

  return (
    <div className="profile-page">

      {/* =================================================
          HERO
      ================================================= */}

      <div className="profile-hero">

        <div className="container">

          <Link
            to="/players"
            className="back-link back-link-light"
          >
            ← Back to Players
          </Link>

          <div className="profile-hero-row">

            <PlayerAvatar
              src={player.image}
              name={player.name}
              team={player.team}
              size="lg"
            />

            <div>

              <span className="eyebrow eyebrow-light">
                {player.team}
              </span>

              <h1>
                {player.name}
              </h1>

              <div className="profile-tags">

                <span className="tag">
                  {player.role}
                </span>

                <span className="tag">
                  {player.battingStyle}
                </span>

                {player.bowlingStyle &&
                  player.bowlingStyle !== "—" && (
                    <span className="tag">
                      {player.bowlingStyle}
                    </span>
                  )}

                <span className="tag">
                  Age {player.age}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      <div className="container">

        {/* =================================================
            REAL MONGODB STATISTICS
        ================================================= */}

        <section className="section">

          <div className="section-head">

            <h2>
              Career Statistics
            </h2>

            {analytics && (
              <span className="pill pill-ai">
                Live Match Data
              </span>
            )}

          </div>


          {/* LOADING */}

          {loadingAnalytics && (
            <div className="ai-result">
              <p>
                Loading statistics from MongoDB...
              </p>
            </div>
          )}


          {/* ERROR */}

          {!loadingAnalytics &&
            analyticsError && (
              <div className="ai-result">
                <p>
                  ⚠️ {analyticsError}
                </p>

                <p>
                  Showing profile information instead.
                </p>
              </div>
            )}


          {/* FORMAT TABS */}

          {!loadingAnalytics &&
            analytics && (

              <>

                <div
                  className="ai-tabs"
                  style={{
                    marginBottom: "25px"
                  }}
                >

                  <button
                    className={
                      selectedFormat === "ODI"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedFormat("ODI")
                    }
                  >
                    ODI
                  </button>

                  <button
                    className={
                      selectedFormat === "Test"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedFormat("Test")
                    }
                  >
                    Test
                  </button>

                  <button
                    className={
                      selectedFormat === "T20"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedFormat("T20")
                    }
                  >
                    T20
                  </button>

                </div>


                {/* =================================================
                    BATTING
                ================================================= */}

                {formatBatting.innings > 0 && (

                  <>

                    <span className="stat-group-label">
                      Batting — {selectedFormat}
                    </span>

                    <div className="stat-grid">

                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.matches}
                        </span>

                        <span>
                          Matches
                        </span>
                      </div>


                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.innings}
                        </span>

                        <span>
                          Innings
                        </span>
                      </div>


                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.runs}
                        </span>

                        <span>
                          Runs
                        </span>
                      </div>


                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.average}
                        </span>

                        <span>
                          Average
                        </span>
                      </div>


                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.strikeRate}
                        </span>

                        <span>
                          Strike Rate
                        </span>
                      </div>


                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.fours}
                        </span>

                        <span>
                          Fours
                        </span>
                      </div>


                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.sixes}
                        </span>

                        <span>
                          Sixes
                        </span>
                      </div>


                      <div className="stat-tile">
                        <span className="num">
                          {formatBatting.notOuts}
                        </span>

                        <span>
                          Not Outs
                        </span>
                      </div>

                    </div>

                  </>

                )}


                {/* =================================================
                    BOWLING
                ================================================= */}

                {formatBowling.innings > 0 && (

                  <>

                    <span className="stat-group-label">
                      Bowling — {selectedFormat}
                    </span>

                    <div className="stat-grid">

                      <div className="stat-tile">

                        <span className="num">
                          {formatBowling.matches}
                        </span>

                        <span>
                          Matches
                        </span>

                      </div>


                      <div className="stat-tile">

                        <span className="num">
                          {formatBowling.innings}
                        </span>

                        <span>
                          Innings
                        </span>

                      </div>


                      <div className="stat-tile">

                        <span className="num">
                          {formatBowling.wickets}
                        </span>

                        <span>
                          Wickets
                        </span>

                      </div>


                      <div className="stat-tile">

                        <span className="num">
                          {formatBowling.runs}
                        </span>

                        <span>
                          Runs Conceded
                        </span>

                      </div>


                      <div className="stat-tile">

                        <span className="num">
                          {formatBowling.bowlingAverage}
                        </span>

                        <span>
                          Bowling Average
                        </span>

                      </div>


                      <div className="stat-tile">

                        <span className="num">
                          {formatBowling.economy}
                        </span>

                        <span>
                          Economy
                        </span>

                      </div>

                    </div>

                  </>

                )}


                {/* NO DATA */}

                {formatBatting.innings === 0 &&
                  formatBowling.innings === 0 && (

                    <div className="ai-result">

                      <h3>
                        No {selectedFormat} data found
                      </h3>

                      <p>
                        This player may not have played
                        this format in the imported
                        Cricsheet dataset.
                      </p>

                    </div>

                  )}

              </>

            )}

        </section>


        {/* =================================================
            OVERALL REAL DATABASE STATS
        ================================================= */}

        {!loadingAnalytics &&
          analytics && (

            <section className="section">

              <div className="section-head">

                <h2>
                  Overall Database Performance
                </h2>

                <span className="pill pill-ai">
                  {analytics.totalMatches} Matches
                </span>

              </div>


              <div className="stat-grid">

                <div className="stat-tile">

                  <span className="num">
                    {analytics.batting.runs}
                  </span>

                  <span>
                    Total Runs
                  </span>

                </div>


                <div className="stat-tile">

                  <span className="num">
                    {analytics.batting.average}
                  </span>

                  <span>
                    Batting Average
                  </span>

                </div>


                <div className="stat-tile">

                  <span className="num">
                    {analytics.batting.strikeRate}
                  </span>

                  <span>
                    Strike Rate
                  </span>

                </div>


                <div className="stat-tile">

                  <span className="num">
                    {analytics.batting.fifties}
                  </span>

                  <span>
                    50s
                  </span>

                </div>


                <div className="stat-tile">

                  <span className="num">
                    {analytics.batting.hundreds}
                  </span>

                  <span>
                    100s
                  </span>

                </div>


                <div className="stat-tile">

                  <span className="num">
                    {analytics.batting.fours}
                  </span>

                  <span>
                    Fours
                  </span>

                </div>


                <div className="stat-tile">

                  <span className="num">
                    {analytics.batting.sixes}
                  </span>

                  <span>
                    Sixes
                  </span>

                </div>


                <div className="stat-tile">

                  <span className="num">
                    {analytics.bowling.wickets}
                  </span>

                  <span>
                    Wickets
                  </span>

                </div>

              </div>

            </section>

          )}


        {/* =================================================
            RECENT FORM
        ================================================= */}

        <section className="section two-col">

          <div>

            <div className="section-head">

              <h2>
                Recent Form
              </h2>

            </div>

            <div className="form-circles">

              {(player.recentForm || []).map(
                (score, index) => (

                  <div
                    key={index}
                    className={`form-circle form-${formColor(
                      score,
                      isPureBowler
                    )}`}
                  >

                    <span className="num">
                      {score}
                    </span>

                    <span className="form-circle-label">
                      {isPureBowler
                        ? "wkts"
                        : "runs"}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>


          {/* =================================================
              AI PREDICTION
          ================================================= */}

          <div>

            <div className="section-head">

              <h2>
                AI Prediction
              </h2>

              <span className="pill pill-ai">
                Next Match
              </span>

            </div>


            <div className="ai-predict-box">

              {hasBattingPrediction && (

                <>

                  <div className="predict-row">

                    <span>
                      Expected Runs
                    </span>

                    <span className="num">
                      {pred.expectedRuns}
                    </span>

                  </div>


                  <div className="predict-row">

                    <span>
                      50+ Probability
                    </span>

                    <div className="bar">

                      <div
                        className="bar-fill"
                        style={{
                          width: `${pred.fiftyProbability || 0}%`
                        }}
                      />

                    </div>

                    <span className="num">
                      {pred.fiftyProbability || 0}%
                    </span>

                  </div>


                  <div className="predict-row">

                    <span>
                      100+ Probability
                    </span>

                    <div className="bar">

                      <div
                        className="bar-fill gold"
                        style={{
                          width: `${pred.centuryProbability || 0}%`
                        }}
                      />

                    </div>

                    <span className="num">
                      {pred.centuryProbability || 0}%
                    </span>

                  </div>

                </>

              )}


              {hasBowlingPrediction && (

                <>

                  <div className="predict-row">

                    <span>
                      Expected Wickets
                    </span>

                    <span className="num">
                      {pred.expectedWickets}
                    </span>

                  </div>


                  <div className="predict-row">

                    <span>
                      Wicket Probability
                    </span>

                    <div className="bar">

                      <div
                        className="bar-fill gold"
                        style={{
                          width: `${pred.wicketProbability || 0}%`
                        }}
                      />

                    </div>

                    <span className="num">
                      {pred.wicketProbability || 0}%
                    </span>

                  </div>

                </>

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            AI INSIGHTS
        ================================================= */}

        <section className="section">

          <div className="section-head">

            <h2>
              AI Insights
            </h2>

          </div>


          <div className="insights-list">

            {(player.strengths || []).map(
              (s, index) => (

                <div
                  className="insight-item"
                  key={index}
                >

                  <span className="insight-icon">
                    ✓
                  </span>

                  {s}

                </div>

              )
            )}

          </div>

        </section>

      </div>

    </div>
  );
}

export default PlayerProfile;