import { useState } from "react";
import { TEAMS } from "../data/mockData";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "./Teams.css";

/* ------------------------------------------------------------------
   TEAM LOGOS - put each logo in /public/teams/ and edit the paths here.
   Square PNG/SVG with transparent background works best (256x256+).
   If a file is missing, the team's short code is shown instead.
------------------------------------------------------------------- */
const TEAM_LOGOS = {
  India: "/players/iind.png",
  Australia: "/players/aus.png",
  England: "/players/eng.png",
  Pakistan: "/players/pak.webp",
  "South Africa": "/players/sa.png",
  "New Zealand": "/players/nz.png",
  "Sri Lanka": "/teams/sri-lanka.png",
  Bangladesh: "/teams/bangladesh.png",
  Afghanistan: "/teams/afghanistan.png",
  "West Indies": "/teams/west-indies.png",
};

const logoFor = (team) =>
  team.logo ||
  TEAM_LOGOS[team.name] ||
  `/teams/${team.name.toLowerCase().replace(/\s+/g, "-")}.png`;

function TeamLogo({ team, size = "md" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`team-swatch team-swatch--${size}`} style={{ background: team.color || "#222" }}>
        {team.short || team.name.slice(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className={`team-logo team-logo--${size}`}
      src={logoFor(team)}
      alt={`${team.name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

const teamLink = (team) => `/teams/${team.name.toLowerCase()}`;

function Teams() {
  const [sortBy, setSortBy] = useState("rank");
  const [query, setQuery] = useState("");

  const sorted = [...TEAMS].sort((a, b) =>
    sortBy === "rank" ? a.rank - b.rank : b.rating - a.rating
  );

  const visibleCards = TEAMS.filter((t) =>
    t.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="teams-page">
      {/* Black banner */}
      <div className="teams-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Rankings and squads</span>
          <h1>Teams</h1>
          <p className="page-sub">
            All international teams, live rankings, and AI strength analysis.
          </p>

          {/* Logo strip: quick links to every team */}
          <div className="teams-strip" aria-label="Jump to a team">
            {TEAMS.map((t) => (
              <Link key={t.name} to={teamLink(t)} className="teams-strip-item" title={t.name}>
                <TeamLogo team={t} size="lg" />
                <span>{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <h2>ICC Points Table</h2>
            <div className="sort-toggle">
              <button className={sortBy === "rank" ? "active" : ""} onClick={() => setSortBy("rank")}>By rank</button>
              <button className={sortBy === "rating" ? "active" : ""} onClick={() => setSortBy("rating")}>By AI rating</button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="points-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Points</th>
                  <th>AI rating</th>
                  <th>Recent form</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t, i) => (
                  <tr key={t.name}>
                    <td className="num">{i + 1}</td>
                    <td>
                      <Link to={teamLink(t)} className="team-cell">
                        <TeamLogo team={t} size="sm" />
                        {t.name}
                      </Link>
                    </td>
                    <td className="num">{t.points}</td>
                    <td className="num">
                      <div className="rating-inline">
                        <div className="bar"><div className="bar-fill" style={{ width: `${t.rating}%` }} /></div>
                        {t.rating}
                      </div>
                    </td>
                    <td>
                      <div className="form-dots">
                        {(t.form || []).map((r, idx) => (
                          <span key={idx} className={`form-dot ${r === "W" ? "win" : "loss"}`}>{r}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Squad strength index</h2>
            <input
              className="team-search"
              type="search"
              placeholder="Search teams"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search teams"
            />
          </div>

          {visibleCards.length === 0 && (
            <p className="team-empty">No team matches "{query}". Try a different name.</p>
          )}

          <div className="grid-3">
            {visibleCards.map((team) => (
              <Link key={team.name} to={teamLink(team)} className="team-card">
                <div className="team-card-top">
                  <TeamLogo team={team} size="xl" />
                  <span className="team-rank">#{team.rank ?? team.ranking}</span>
                </div>

                <h3>{team.name}</h3>

                <dl className="team-facts">
                  {team.captain && (<><dt>Captain</dt><dd>{team.captain}</dd></>)}
                  {team.coach && (<><dt>Coach</dt><dd>{team.coach}</dd></>)}
                  {team.points != null && (<><dt>Points</dt><dd>{team.points}</dd></>)}
                </dl>

                {team.rating != null && (
                  <div className="team-card-rating">
                    <div className="bar"><div className="bar-fill" style={{ width: `${team.rating}%` }} /></div>
                    <span className="num">{team.rating}</span>
                  </div>
                )}
                <span className="team-card-caption">AI strength rating</span>

                <span className="team-cta">View team</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Teams;