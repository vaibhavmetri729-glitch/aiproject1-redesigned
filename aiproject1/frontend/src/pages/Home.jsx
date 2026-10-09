import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { LIVE_MATCH } from "../data/mockData";
import "./Home.css";

/* ------------------------------------------------------------------
   IMAGE SLOTS
   All images are inside /public/
------------------------------------------------------------------- */

/* IMPORTANT:
   public/players/vort.png
   is accessed as:
   /players/vort.png
*/
const DEFAULT_BG = "/players/vort.png";

const MATCHES = [
  {
    id: "live",
    live: true,
    format: "T20I",
    team1: LIVE_MATCH.team1,
    team2: LIVE_MATCH.team2,
    venue: LIVE_MATCH.venue,
    when: "Live now",
    img: "/players/live.png",
  },
  {
    id: "m2",
    format: "ODI",
    team1: "India",
    team2: "Australia",
    venue: "Wankhede, Mumbai",
    when: "Sat, 10 Oct · 1:30 PM",
    img: "/players/indaus.png",
  },
  {
    id: "m3",
    format: "Test",
    team1: "England",
    team2: "Pakistan",
    venue: "Lord's, London",
    when: "Mon, 12 Oct · 3:30 PM",
    img: "/players/pakeng.png",
  },
  {
    id: "m4",
    format: "T20I",
    team1: "South Africa",
    team2: "New Zealand",
    venue: "Newlands, Cape Town",
    when: "Wed, 14 Oct · 8:00 PM",
    img: "/players/nzsa.png",
  },
  {
    id: "m5",
    format: "ODI",
    team1: "Sri Lanka",
    team2: "Bangladesh",
    venue: "R. Premadasa, Colombo",
    when: "Fri, 16 Oct · 2:00 PM",
    img: "/players/bansri.png",
  },
];

const SERIES = [
  {
    title: "India tour of England",
    sub: "5 T20Is · Jul 2027",
    img: "/players/indvseng.jpg",
  },
  {
    title: "The Ashes 2027",
    sub: "5 Tests · Nov 2027",
    img: "/players/ases.png",
  },
  {
    title: "ICC World Cup 2027",
    sub: "48 matches · Oct 2027",
    img: "/players/wcc.png",
  },
  {
    title: "Asia Cup",
    sub: "13 matches · Sep 2027",
    img: "/players/ais.png",
  },
  {
    title: "Women's World T20",
    sub: "23 matches · Feb 2027",
    img: "/players/wwc.png",
  },
];

const STORIES = [
  {
    tag: "AI match brief",
    title: "India's pace attack could dominate Lord's conditions",
    time: "4 min read",
    img: "/players/bgi.png",
  },
  {
    tag: "Tactics",
    title: "Why wrist spin is England's biggest weakness",
    time: "3 min read",
    img: "/players/indeng.png",
  },
  {
    tag: "World Cup",
    title: "AI ranks the top contenders for 2027",
    time: "5 min read",
    img: "/players/wc.png",
  },
  {
    tag: "Analysis",
    title: "Powerplay trends: who scores fastest in the first six",
    time: "4 min read",
    img: "/players/6hit.png",
  },
];

const PLAYERS = [
  {
    name: "Jasprit Bumrah",
    role: "Fast bowler",
    form: 91,
    img: "/players/bum.png",
    slug: "jasprit-bumrah",
  },
  {
    name: "Rohit Sharma",
    role: "Batter",
    form: 88,
    img: "/players/ro.png",
    slug: "rohit-sharma",
  },
  {
    name: "KL Rahul",
    role: "Batter / WK",
    form: 85,
    img: "/players/kl.png",
    slug: "kl-rahul",
  },
  {
    name: "Rishabh Pant",
    role: "WK batter",
    form: 83,
    img: "/players/pnt.png",
    slug: "rishabh-pant",
  },
  {
    name: "Hardik Pandya",
    role: "All Rounder",
    form: 89,
    img: "/players/hrd.png",
    slug: "hardik-pandya",
  },
];

const BROWSE = [
  { name: "T20", img: "/players/t20.png" },
  { name: "ODI", img: "/players/odi.png" },
  { name: "Test", img: "/players/test.png" },
  { name: "IPL", img: "/players/ipl.png" },
  { name: "Women's", img: "/players/womens.png" },
  { name: "Domestic", img: "/players/bcci.png" },
];

const AI_TOOLS = [
  {
    title: "Win predictor",
    text: "Live win probability, ball by ball.",
    to: "/ai-lab",
  },
  {
    title: "Injury risk",
    text: "Workload alerts for every fast bowler.",
    to: "/ai-lab",
  },
  {
    title: "AI coach",
    text: "Targets, field settings and bowling plans.",
    to: "/ai-lab",
  },
  {
    title: "Fantasy XI",
    text: "Picks built from form and venue data.",
    to: "/ai-lab",
  },
];

const RANKINGS = {
  "Top run-scorers": [
    ["Virat Kohli", "India", "642"],
    ["Joe Root", "England", "598"],
    ["Babar Azam", "Pakistan", "571"],
    ["Steve Smith", "Australia", "540"],
    ["Rohit Sharma", "India", "526"],
  ],
  "Top wicket-takers": [
    ["Jasprit Bumrah", "India", "31"],
    ["Pat Cummins", "Australia", "28"],
    ["Shaheen Afridi", "Pakistan", "26"],
    ["Rashid Khan", "Afghanistan", "24"],
    ["Kagiso Rabada", "South Africa", "22"],
  ],
};

const FILTERS = ["All", "Live", "Upcoming", "T20I", "ODI", "Test"];

const FOOTER_COLS = [
  {
    title: "Watch and follow",
    links: [
      ["Live matches", "/matches"],
      ["Highlights", "/matches"],
      ["Series and tournaments", "/matches"],
      ["Stories", "/matches"],
    ],
  },
  {
    title: "Teams and players",
    links: [
      ["India", "/teams/india"],
      ["Australia", "/teams/australia"],
      ["England", "/teams/england"],
      ["Pakistan", "/teams/pakistan"],
      ["All players", "/players"],
    ],
  },
  {
    title: "AI Lab",
    links: [
      ["Win predictor", "/ai-lab"],
      ["Injury risk", "/ai-lab"],
      ["AI coach", "/ai-lab"],
      ["Fantasy XI", "/ai-lab"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Contact us", "/contact"],
      ["FAQs", "/faq"],
      ["Terms of use", "/terms"],
      ["Privacy policy", "/privacy"],
    ],
  },
];

const SOCIALS = [
  ["X", "https://x.com/"],
  ["Instagram", "https://instagram.com/"],
  ["YouTube", "https://youtube.com/"],
  ["Facebook", "https://facebook.com/"],
];

/* ---------- Horizontal rail ---------- */

function Rail({ title, to, children, size = "md" }) {
  const ref = useRef(null);

  const move = (dir) => {
    const el = ref.current;

    if (el) {
      el.scrollBy({
        left: dir * el.clientWidth * 0.85,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="dz-rail">
      <div className="dz-rail-head">
        <h2>{title}</h2>

        {to && <Link to={to}>See all</Link>}
      </div>

      <div className="dz-rail-frame">
        <button
          className="dz-arrow dz-arrow--l"
          onClick={() => move(-1)}
          aria-label={`Scroll ${title} left`}
        >
          ‹
        </button>

        <div className={`dz-track dz-track--${size}`} ref={ref}>
          {children}
        </div>

        <button
          className="dz-arrow dz-arrow--r"
          onClick={() => move(1)}
          aria-label={`Scroll ${title} right`}
        >
          ›
        </button>
      </div>
    </section>
  );
}

function Home() {
  const [filter, setFilter] = useState("All");

  const shown = MATCHES.filter((m) => {
    if (filter === "All") return true;

    if (filter === "Live") return m.live;

    if (filter === "Upcoming") return !m.live;

    return m.format === filter;
  });

  return (
    <div className="home-shell dz">

      {/* =========================================================
          CONSTANT FIXED BACKGROUND
          Image:
          public/players/vort.png
      ========================================================== */}

      <div
        className="dz-bg"
        style={{
          backgroundImage: `url("${DEFAULT_BG}")`,
        }}
      />

      <div className="dz-bg-shade" />

      <div className="dz-fg">

        {/* =====================================================
            HERO
        ====================================================== */}

        <div className="dz-intro dz-wrap">
          <span className="dz-live">
            <i />
            Live now · {LIVE_MATCH.venue}
          </span>

          <h1 className="dz-match-title">
  <span className="team-india">{LIVE_MATCH.team1}</span>
  <span className="vs-text"> vs </span>
  <span className="team-australia">{LIVE_MATCH.team2}</span>
</h1>

          <p className="dz-score">
            {LIVE_MATCH.team1} {LIVE_MATCH.team1Score} (
            {LIVE_MATCH.team1Overs} ov)

            <span> · </span>

            {LIVE_MATCH.team2} {LIVE_MATCH.team2Score}
          </p>

          <p className="dz-status">
            {LIVE_MATCH.status}
          </p>

          <div className="dz-prob">
            <div className="dz-prob-top">
              <span>AI win probability</span>

              <strong>
                India {LIVE_MATCH.winProb.India}%
              </strong>
            </div>

            <div className="dz-prob-bar">
              <div
                style={{
                  width: `${LIVE_MATCH.winProb.India}%`,
                }}
              />
            </div>
          </div>

          <div className="dz-cta">
            <Link
              to="/matches"
              className="dz-btn dz-btn--solid"
            >
              Open match centre
            </Link>

            <Link
              to="/ai-lab"
              className="dz-btn dz-btn--ghost"
            >
              Launch AI Lab
            </Link>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="dz-content">
          <div className="dz-wrap">

            {/* Filters */}

            <div
              className="dz-chips"
              role="tablist"
              aria-label="Filter matches"
            >
              {FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  className={`dz-chip ${
                    filter === f ? "is-on" : ""
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Live and upcoming */}

            <Rail
              title="Live and upcoming"
              to="/matches"
              size="lg"
            >
              {shown.length === 0 && (
                <p className="dz-empty">
                  No matches in this filter. Try All.
                </p>
              )}

              {shown.map((m) => (
                <Link
                  to="/matches"
                  key={m.id}
                  className="dz-card dz-card--match"
                >
                  <img
                    src={m.img}
                    alt=""
                    loading="lazy"
                  />

                  <div className="dz-card-shade" />

                  {m.live ? (
                    <span className="dz-pill dz-pill--live">
                      Live
                    </span>
                  ) : (
                    <span className="dz-pill">
                      {m.format}
                    </span>
                  )}

                  <div className="dz-card-body">
                    <small>{m.when}</small>

                    <h3>
                      {m.team1} vs {m.team2}
                    </h3>

                    <span>{m.venue}</span>
                  </div>
                </Link>
              ))}
            </Rail>

            {/* Featured series */}

            <Rail title="Featured series" to="/matches">
              {SERIES.map((s) => (
                <Link
                  to="/matches"
                  key={s.title}
                  className="dz-card dz-card--series"
                >
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                  />

                  <div className="dz-card-shade" />

                  <div className="dz-card-body">
                    <h3>{s.title}</h3>
                    <span>{s.sub}</span>
                  </div>
                </Link>
              ))}
            </Rail>

            {/* Browse */}

            <Rail title="Browse by format" size="sm">
              {BROWSE.map((b) => (
                <Link
                  to="/matches"
                  key={b.name}
                  className="dz-card dz-card--format"
                >
                  <img
                    src={b.img}
                    alt=""
                    loading="lazy"
                  />

                  <div className="dz-card-shade" />

                  <h3>{b.name}</h3>
                </Link>
              ))}
            </Rail>

            {/* Stories */}

            <Rail
              title="Stories and analysis"
              to="/matches"
            >
              {STORIES.map((s) => (
                <Link
                  to="/matches"
                  key={s.title}
                  className="dz-card dz-card--story"
                >
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                  />

                  <div className="dz-story-text">
                    <small>
                      {s.tag} · {s.time}
                    </small>

                    <h3>{s.title}</h3>
                  </div>
                </Link>
              ))}
            </Rail>

            {/* Players */}

            <Rail
              title="Player spotlight"
              to="/players"
              size="sm"
            >
              {PLAYERS.map((p) => (
                <Link
                  to={`/players/${p.slug}`}
                  key={p.slug}
                  className="dz-card dz-card--player"
                >
                  <div className="dz-player-img">
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                    />
                  </div>

                  <span
                    className="dz-form"
                    title="Form score"
                  >
                    {p.form}
                  </span>

                  <div className="dz-player-info">
                    <strong>{p.name}</strong>
                    <span>{p.role}</span>
                  </div>
                </Link>
              ))}
            </Rail>

            {/* Rankings */}

            <section className="dz-rail">
              <div className="dz-rail-head">
                <h2>Series leaders</h2>
              </div>

              <div className="dz-boards">
                {Object.entries(RANKINGS).map(
                  ([name, rows]) => (
                    <div
                      className="dz-board"
                      key={name}
                    >
                      <h3>{name}</h3>

                      <ol>
                        {rows.map(
                          ([player, team, val], i) => (
                            <li key={player}>
                              <span className="dz-rank">
                                {i + 1}
                              </span>

                              <span className="dz-pname">
                                {player}

                                <small>{team}</small>
                              </span>

                              <strong>{val}</strong>
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* AI tools */}

            <Rail
              title="AI tools"
              to="/ai-lab"
              size="sm"
            >
              {AI_TOOLS.map((t) => (
                <Link
                  to={t.to}
                  key={t.title}
                  className="dz-card dz-card--tool"
                >
                  <h3>{t.title}</h3>

                  <p>{t.text}</p>

                  <span>Try it</span>
                </Link>
              ))}
            </Rail>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="dz-footer">
          <div className="dz-wrap">
            <div className="dz-foot-grid">

              <div className="dz-foot-brand">
                <strong>SmartCricket.com</strong>

                <p>
                  Live scores, highlights and
                  AI-powered match analysis for
                  every format of cricket.
                </p>

                <div className="dz-foot-contact">
                  <a href="tel:+910000000000">
                    +91 00000 00000
                  </a>

                  <a href="mailto:hello@smartcricket.ai">
                    hello@smartcricket.ai
                  </a>
                </div>
              </div>

              {FOOTER_COLS.map((col) => (
                <nav
                  key={col.title}
                  aria-label={col.title}
                >
                  <h4>{col.title}</h4>

                  <ul>
                    {col.links.map(([label, to]) => (
                      <li key={label}>
                        <Link to={to}>
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <div className="dz-foot-bottom">
              <span>
                © {new Date().getFullYear()} SmartCricket.com
                {" "}· All rights reserved.
              </span>

              <div className="dz-socials">
                {SOCIALS.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;