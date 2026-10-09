import { useParams, Link } from "react-router-dom";
import { playerProfiles } from "../data/playerProfiles";
import PlayerAvatar from "../components/PlayerAvatar";
import "./TeamProfile.css";

// Team details only (players come from playerProfiles)
const TEAMS = {
  india: {
    name: "India",
    short: "IND",
    captain: "Rohit Sharma",
    coach: "Gautam Gambhir",
    ranking: 1,
    strength: 92,
    form: ["W", "W", "L", "W", "W"],
    fixtures: ["India vs England", "India vs Australia"],
    insights: ["Bat first at Mumbai", "Use Bumrah in powerplay"],
  },
  australia: {
    name: "Australia",
    short: "AUS",
    captain: "Pat Cummins",
    coach: "Andrew McDonald",
    ranking: 2,
    strength: 89,
    form: ["W", "L", "W", "W", "W"],
    fixtures: ["Australia vs Pakistan", "Australia vs India"],
    insights: ["Attack with pace early", "Use Zampa in middle overs"],
  },
  england: {
    name: "England",
    short: "ENG",
    captain: "Jos Buttler",
    coach: "Brendon McCullum",
    ranking: 3,
    strength: 85,
    form: ["L", "W", "W", "L", "W"],
    fixtures: ["England vs India", "England vs New Zealand"],
    insights: ["Aggressive powerplay batting", "Rotate seamers frequently"],
  },
  pakistan: {
    name: "Pakistan",
    short: "PAK",
    captain: "Babar Azam",
    coach: "Aaqib Javed",
    ranking: 4,
    strength: 84,
    form: ["W", "L", "L", "W", "W"],
    fixtures: ["Pakistan vs Australia", "Pakistan vs India"],
    insights: ["Exploit reverse swing", "Keep attacking field in middle overs"],
  },
};

const ROLE_ORDER = ["Batter", "Wicketkeeper", "Allrounder", "Bowler"];

const norm = (v) => String(v ?? "").trim().toLowerCase();
const getForm = (p) => p.form || p.aiForm || 80;

function TeamProfile() {
  const { id } = useParams();
  const data = TEAMS[id];

  if (!data) {
    return (
      <div className="team-profile-page">
        <div className="container team-notfound">
          <Link to="/teams" className="team-back">
            ← Back to Teams
          </Link>
          <h1>Team not found</h1>
          <p>We don't have a profile for this team yet.</p>
        </div>
      </div>
    );
  }

  // All players of this team, straight from the players database
  const squad = Object.entries(playerProfiles).filter(([, p]) => {
    const t = norm(p.team);
    return t === norm(id) || t === norm(data.name) || t === norm(data.short);
  });

  // Best XI = top 11 by AI form
  const bestXI = [...squad]
    .sort((x, y) => getForm(y[1]) - getForm(x[1]))
    .slice(0, 11);

  // Group the full squad by role
  const roles = [
    ...ROLE_ORDER,
    ...new Set(squad.map(([, p]) => p.role).filter((r) => r && !ROLE_ORDER.includes(r))),
  ];
  const groupedSquad = roles
    .map((role) => ({
      role,
      players: squad.filter(([, p]) => p.role === role),
    }))
    .filter((g) => g.players.length > 0);

  return (
    <div className="team-profile-page">
      {/* HERO */}
      <div className="team-profile-hero">
        <div className="container">
          <Link to="/teams" className="team-back">
            ← Back to Teams
          </Link>

          <div className="team-profile-header">
            <div className="team-profile-title">
              <div className="team-profile-swatch">{data.short}</div>
              <div>
                <h1>{data.name}</h1>
                <div className="team-profile-meta">
                  Captain: {data.captain} · Coach: {data.coach}
                </div>
              </div>
            </div>

            <div className="team-main-rating">
              <span>AI Team Strength</span>
              <strong>{data.strength}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="team-profile-section">
          <div className="team-profile-grid">
            {/* TEAM INFO */}
            <div className="team-profile-card">
              <h2>Team Information</h2>

              <div className="team-info-row">
                <span className="team-info-label">Captain</span>
                <span className="team-info-value">{data.captain}</span>
              </div>
              <div className="team-info-row">
                <span className="team-info-label">Coach</span>
                <span className="team-info-value">{data.coach}</span>
              </div>
              <div className="team-info-row">
                <span className="team-info-label">ICC Ranking</span>
                <span className="team-info-value">#{data.ranking}</span>
              </div>
              <div className="team-info-row">
                <span className="team-info-label">Players in database</span>
                <span className="team-info-value">{squad.length}</span>
              </div>

              <div className="team-strength">
                <div className="team-strength-head">
                  <span>AI Strength</span>
                  <strong>{data.strength}/100</strong>
                </div>
                <div className="team-strength-bar">
                  <div
                    className="team-strength-fill"
                    style={{ width: `${data.strength}%` }}
                  />
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="team-profile-card">
              <h2>Recent Form</h2>
              <div className="team-form">
                {data.form.map((result, index) => (
                  <div
                    key={index}
                    className={`team-form-dot ${result === "W" ? "win" : "loss"}`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>

            {/* BEST XI */}
            <div className="team-profile-card">
              <h2>Best Playing XI</h2>

              {bestXI.length === 0 ? (
                <p>No players found for this team yet.</p>
              ) : (
                <ul className="team-squad">
                  {bestXI.map(([slug, p]) => (
                    <li key={slug}>
                      <Link to={`/players/${slug}`}>{p.name}</Link>
                      <span className="team-squad-role">
                        {" "}
                        · {p.role} · Form {getForm(p)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* FIXTURES */}
            <div className="team-profile-card">
              <h2>Upcoming Fixtures</h2>
              <div className="team-fixtures">
                {data.fixtures.map((fixture) => (
                  <div className="team-fixture" key={fixture}>
                    {fixture}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FULL SQUAD */}
        <section className="team-profile-section">
          <div className="section-head">
            <h2>Full Squad ({squad.length})</h2>
            <Link to="/players" className="link-more">
              Player database →
            </Link>
          </div>

          {groupedSquad.length === 0 ? (
            <p>No players found for {data.name} yet.</p>
          ) : (
            groupedSquad.map((group) => (
              <div className="team-role-group" key={group.role}>
                <h3 className="team-role-title">
                  {group.role}s <span>{group.players.length}</span>
                </h3>

                <div className="team-player-grid">
                  {group.players.map(([slug, p]) => (
                    <Link
                      to={`/players/${slug}`}
                      className="team-player-card"
                      key={slug}
                    >
                      

                      <div className="team-player-info">
                        <strong>{p.name}</strong>
                        <span>{p.role}</span>
                      </div>

                      <span className="team-player-form">{getForm(p)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* AI STRATEGY */}
        <section className="team-profile-section">
          <div className="section-head">
            <h2>AI Strategy Suggestions</h2>
            <span className="pill pill-ai">AI Insights</span>
          </div>

          <div className="team-insights">
            {data.insights.map((insight) => (
              <div className="team-insight" key={insight}>
                <span className="team-insight-icon">✓</span>
                {insight}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default TeamProfile;