import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PLAYERS } from "../data/mockData";
import { playerProfiles } from "../data/playerProfiles";
import PlayerAvatar from "../components/PlayerAvatar";
import "./Players.css";

const getForm = (p) => p.form || p.aiForm || 80;

// HERO SETTINGS: only these players appear in the hero.
// heroImage is used ONLY in the hero. The cards below keep using playerProfiles images.
const HERO_PLAYERS = [
  {
    slug: "virat-kohli",
    name: "Virat Kohli",
    heroImage: "/players/vir.png",
    overrides: { jersey: 18 }, // optional: quote, jersey, nextMatch
  },
  {
    slug: "hardik-pandya",
    name: "Hardik Pandya",
    heroImage: "/players/hp.png",
    overrides: { jersey: 33 },
  },
];

const metricRows = (p) =>
  p.role === "Batter"
    ? [
        ["Runs", p.runs || 0, 15000],
        ["Average", p.avg || 0, 65],
        ["Strike Rate", p.sr || 0, 100],
      ]
    : [
        ["Wickets", p.wickets || 0, 320],
        ["Average", p.avg || 0, 30],
        ["Economy", p.econ || 0, 6],
      ];

/* ---------- Player card (defined outside so it doesn't remount on every render) ---------- */
function PlayerCard({ slug, p, index }) {
  return (
    <Link to={`/players/${slug}`} className="pc">
      <div className="pc-media">
        <span className="pc-rank">{String(index + 1).padStart(2, "0")}</span>

        <div className="pc-avatar">
          <PlayerAvatar src={p.image} name={p.name} team={p.team} size="lg" />
        </div>

        <span className="pc-form" title="AI form">
          {getForm(p)}
        </span>
      </div>

      <div className="pc-body">
        <span className="pc-role">{p.role}</span>
        <h3>{p.name}</h3>
        <div className="pc-meta">
          <span>{p.team}</span>
          <span className="pc-go">View profile →</span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Top hero profile ---------- */
function HeroProfile({
  slug,
  p,
  heroImage,
  index,
  total,
  dbCount,
  onPrev,
  onNext,
}) {
  const name = p.name.toUpperCase();
  // fit the name to the card width, whatever its length
  const nameSize = `min(220px, ${(100 / (name.length * 0.66)).toFixed(2)}cqw)`;
  const jersey = p.jersey ?? p.number;
  const next = p.nextMatch || {};

  const imgSrc = heroImage || p.image;
  const fallback = (e) => {
    if (e.currentTarget.src.endsWith(p.image)) return;
    e.currentTarget.src = p.image; // falls back if the hero image is missing
  };

  return (
    <section className="pl-hero-wrap">
      <div className="container">
        <div className="pl-hero" key={slug}>
          {/* top bar */}
          <header className="pl-hero-top">
            <div className="pl-brand">
              <span className="pl-logo">
                SC
                <br />
                AI
              </span>
              <span className="pl-divider" />
              <span className="pl-brand-text">
                <strong>{p.team}</strong> <span>{p.role}</span>
              </span>
            </div>

            <nav className="pl-nav">
              <Link to="/teams">Teams</Link>
              <Link to="/matches">Matches</Link>
              <span className="pl-count">{dbCount} players</span>
              <span className="pl-pager">
                {index + 1}/{total}
              </span>
              <button onClick={onPrev} aria-label="Previous player">
                ‹
              </button>
              <button onClick={onNext} aria-label="Next player">
                ›
              </button>
            </nav>
          </header>

          {/* quote / scout note */}
          <blockquote className="pl-quote">
            <span className="pl-qmark">“</span>
            <p>
              {p.quote ||
                `Rated ${getForm(p)} on AI form. ${p.team}'s ${p.role} to watch.`}
            </p>
            <cite>{p.quote ? p.name : "SmartCricket AI"}</cite>
          </blockquote>

          {/* jersey number */}
          <div className="pl-number">{jersey ?? getForm(p)}</div>

          {/* giant name behind the player */}
          <h1 className="pl-name" style={{ fontSize: nameSize }}>
            {name}
          </h1>

          {/* player cut-out sits in front of the name */}
          <Link to={`/players/${slug}`} className="pl-photo-link">
            <img
              className="pl-photo"
              src={imgSrc}
              alt={p.name}
              onError={fallback}
            />
          </Link>

          {/* video-style thumbnail */}
          <Link
            to={`/players/${slug}`}
            className="pl-thumb"
            aria-label={`Open ${p.name} profile`}
          >
            <img src={imgSrc} alt="" onError={fallback} />
            <span className="pl-play">▶</span>
          </Link>

          {/* next game card */}
          <div className="pl-next">
            <div className="pl-next-top">
              <span className="pl-next-tag">NEXT GAME</span>
              <span className="pl-next-date">{next.date || "To be announced"}</span>
            </div>
            <div className="pl-next-teams">
              <span>{p.team}</span>
              <i>VS</i>
              <span>{next.opponent || "TBA"}</span>
            </div>
            <div className="pl-next-foot">
              <span>{next.competition || "Upcoming fixture"}</span>
              <span>{next.stage || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Players() {
  const [playerA, setPlayerA] = useState(PLAYERS[0]?.name || "");
  const [playerB, setPlayerB] = useState(PLAYERS[1]?.name || "");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("Any team");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const a = PLAYERS.find((p) => p.name === playerA) || PLAYERS[0];
  const b = PLAYERS.find((p) => p.name === playerB) || PLAYERS[1];

  const profiles = Object.entries(playerProfiles);

  const teams = useMemo(
    () => [
      "Any team",
      ...new Set(profiles.map(([, p]) => p.team).filter(Boolean)),
    ],
    []
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter(([, p]) => {
      const matchesSearch = p.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesTeam = teamFilter === "Any team" || p.team === teamFilter;
      const matchesRole = roleFilter === "All" || p.role === roleFilter;
      return matchesSearch && matchesTeam && matchesRole;
    });
  }, [search, teamFilter, roleFilter]);

  const topBatters = useMemo(
    () =>
      profiles
        .filter(([, p]) => p.role === "Batter")
        .sort((x, y) => (y[1].career?.runs || 0) - (x[1].career?.runs || 0))
        .slice(0, 6),
    []
  );

  const topBowlers = useMemo(
    () =>
      profiles
        .filter(([, p]) => p.role === "Bowler")
        .sort(
          (x, y) => (y[1].career?.wickets || 0) - (x[1].career?.wickets || 0)
        )
        .slice(0, 6),
    []
  );

  const topAllRounders = useMemo(
    () => profiles.filter(([, p]) => p.role === "Allrounder").slice(0, 6),
    []
  );

  // hero players (Virat Kohli + Hardik Pandya) with their own hero images
  const spotlight = useMemo(
    () =>
      HERO_PLAYERS.map((h) => {
        const entry = profiles.find(
          ([slug, p]) =>
            slug === h.slug || p.name?.toLowerCase() === h.name.toLowerCase()
        );
        return entry
          ? {
              slug: entry[0],
              p: { ...entry[1], ...h.overrides },
              heroImage: h.heroImage,
            }
          : null;
      }).filter(Boolean),
    []
  );

  const hero = spotlight[heroIndex];

  const prevHero = () =>
    setHeroIndex((i) => (i - 1 + spotlight.length) % spotlight.length);
  const nextHero = () => setHeroIndex((i) => (i + 1) % spotlight.length);

  return (
    <div className="players-page">
      {/* HERO PROFILE */}
      {hero && (
        <HeroProfile
          slug={hero.slug}
          p={hero.p}
          heroImage={hero.heroImage}
          index={heroIndex}
          total={spotlight.length}
          dbCount={profiles.length}
          onPrev={prevHero}
          onNext={nextHero}
        />
      )}

      {/* TOP BATTERS */}
      <section className="players-section">
        <div className="container">
          <div className="pl-head">
            <h2>Top Batters</h2>
            <span className="pl-chip">Batting</span>
          </div>

          <div className="modern-player-grid">
            {topBatters.map(([slug, p], index) => (
              <PlayerCard key={slug} slug={slug} p={p} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* TOP BOWLERS */}
      <section className="players-section dark-section">
        <div className="container">
          <div className="pl-head">
            <h2>Top Bowlers</h2>
            <span className="pl-chip">Bowling</span>
          </div>

          <div className="modern-player-grid">
            {topBowlers.map(([slug, p], index) => (
              <PlayerCard key={slug} slug={slug} p={p} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ALL ROUNDERS */}
      <section className="players-section">
        <div className="container">
          <div className="pl-head">
            <h2>All-Rounders</h2>
            <span className="pl-chip">Impact</span>
          </div>

          <div className="modern-player-grid">
            {topAllRounders.map(([slug, p], index) => (
              <PlayerCard key={slug} slug={slug} p={p} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* FULL DATABASE */}
      <section className="player-database">
        <div className="container">
          <div className="database-header">
            <div className="pl-head">
              <h2>Explore Every Player</h2>
              <span className="pl-chip">Database</span>
            </div>

            <button
              className="database-toggle"
              onClick={() => setShowAllPlayers((value) => !value)}
            >
              {showAllPlayers ? "Close database ↑" : "Open database →"}
            </button>
          </div>

          {showAllPlayers && (
            <>
              <div className="modern-player-filters">
                <input
                  placeholder="Search player..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                >
                  {teams.map((team) => (
                    <option key={team}>{team}</option>
                  ))}
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Batter</option>
                  <option>Bowler</option>
                  <option>Allrounder</option>
                  <option>Wicketkeeper</option>
                </select>
              </div>

              <div className="database-grid modern-player-grid">
                {filteredProfiles.map(([slug, p], index) => (
                  <PlayerCard key={slug} slug={slug} p={p} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="comparison-section">
        <div className="container">
          <div className="pl-head light-head">
            <h2>Head-to-Head</h2>
            <span className="pl-chip">AI analysis</span>
          </div>

          <div className="comparison-panel">
            <div className="comparison-selects">
              <select
                value={playerA}
                onChange={(e) => setPlayerA(e.target.value)}
              >
                {PLAYERS.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </select>

              <span>VS</span>

              <select
                value={playerB}
                onChange={(e) => setPlayerB(e.target.value)}
              >
                {PLAYERS.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="comparison-names">
              <div>
                <small>{a?.team}</small>
                <h3>{a?.name}</h3>
              </div>

              <strong>VS</strong>

              <div>
                <small>{b?.team}</small>
                <h3>{b?.name}</h3>
              </div>
            </div>

            {a && b && a.role === b.role ? (
              metricRows(a).map(([label], index) => {
                const rowA = metricRows(a)[index];
                const rowB = metricRows(b)[index];

                const valA = rowA[1];
                const valB = rowB[1];

                const max = Math.max(rowA[2], rowB[2], valA, valB);

                return (
                  <div className="comparison-row" key={label}>
                    <strong>{valA}</strong>

                    <div className="comparison-bar left">
                      <div style={{ width: `${(valA / max) * 100}%` }} />
                    </div>

                    <span>{label}</span>

                    <div className="comparison-bar right">
                      <div style={{ width: `${(valB / max) * 100}%` }} />
                    </div>

                    <strong>{valB}</strong>
                  </div>
                );
              })
            ) : (
              <p className="comparison-note">
                Select players with the same role for a detailed statistical
                comparison.
              </p>
            )}

            <div className="comparison-form">
              <span>AI form</span>

              <strong>{a?.form}</strong>

              <div>
                <i style={{ width: `${a?.form || 0}%` }} />
              </div>

              <div>
                <i className="alt-form" style={{ width: `${b?.form || 0}%` }} />
              </div>

              <strong>{b?.form}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Players;