import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Matches.css";
import Footer from "./Footer";

/* =====================================================
   EASY SETTINGS – change links / images here
   ===================================================== */

const API_URL = "http://localhost:5000/api/matches";

// Banner image – paste your image link/path here
const BANNER_IMG = "/players/bgii.png";

// Country logos – paste your image links/paths here.
// Key = team name (lowercase). If a logo is missing, a letter badge shows.
const TEAM_LOGOS = {
  india: "/players/indl.png",
  australia: "/players/ausl.png",
  england: "/players/engl.png",
  pakistan: "/players/pakl.png",
  "south africa": "/players/sal.png",
  "new zealand": "/players/nz.png",
  "sri lanka": "/players/sri.png",
  "west indies": "/players/wi.png",
  bangladesh: "/players/bangl.png",
  afghanistan: "/players/afg.png",
};

// Only matches with these teams are shown by default
const TOP_TEAMS = Object.keys(TEAM_LOGOS);

const PREVIEW_LIMIT = 8; // rows shown on the default (top matches) view
const PAGE_SIZE = 12; // rows per page in "all matches"
const CACHE_MS = 60 * 1000; // keep fetched pages for 60 seconds

// Page tabs
const TABS = [
  { key: "schedule", label: "Match Schedules" },
  { key: "fixtures", label: "Fixtures" },
  { key: "results", label: "Results" },
];

// Partners strips – add logo image links + website links

const PARTNERS = {
  "Official Partners": [
    {
      name: "Cricket Australia",
      logo: "/players/caus.png",
      link: "https://www.cricket.com.au",
    },
    {
      name: "MongoDB",
      logo: "/players/mongo.png",
      link: "https://www.mongodb.com",
    },
    {
      name: "Pinterest",
      logo: "/players/pin.png",
      link: "https://www.pinterest.com",
    },
    {
      name: "Claude AI",
      logo: "/players/cla.png",
      link: "https://claude.ai",
    },
  ],

  "Technical Partners": [
    {
      name: "VAIBHAV METRI",
      logo: "",
      link: "#",
    },
    {
      name: "JK MARIYA KEERTHAN",
      logo: "",
      link: "#",
    },
  ],
};



/* =====================================================
   HELPERS
   ===================================================== */

const norm = (v = "") => String(v).toLowerCase().trim();

const getLogo = (name) => {
  const n = norm(name);
  const key = Object.keys(TEAM_LOGOS).find((k) => n.includes(k));
  return key ? TEAM_LOGOS[key] : null;
};

const isTopTeam = (name) => TOP_TEAMS.some((t) => norm(name).includes(t));

const toTime = (v) => {
  const t = new Date(v).getTime();
  return isNaN(t) ? 0 : t;
};

const dateParts = (v) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return { day: "--", mon: "TBA", group: "DATE TBA" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    group: d
      .toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      .toUpperCase(),
  };
};

// adds id + live/upcoming/completed type
const withType = (match, index) => {
  let type = "completed";

  if (match.status === "live" || match.isLive) type = "live";
  else if (new Date(match.date) > new Date()) type = "upcoming";

  return {
    ...match,
    id: match.id || match.cricsheetId || match._id || `m${index}`,
    type,
  };
};

/* =====================================================
   DATA LAYER (paged + cached)
   ===================================================== */

const pageCache = new Map(); // key -> { time, result }
let normalizedAll = null; // only used if the backend isn't paginated yet

// Fallback when backend still returns the full array
function localQuery(all, { tab, scope, page, limit }) {
  let list = all;

  if (scope === "top") {
    const top = list.filter((m) => isTopTeam(m.team1) || isTopTeam(m.team2));
    if (top.length > 0) list = top;
  }

  const live = list.filter((m) => m.type === "live");
  const upcoming = list
    .filter((m) => m.type === "upcoming")
    .sort((a, b) => toTime(a.date) - toTime(b.date));
  const completed = list
    .filter((m) => m.type === "completed")
    .sort((a, b) => toTime(b.date) - toTime(a.date));

  const ordered =
    tab === "fixtures"
      ? [...live, ...upcoming]
      : tab === "results"
      ? completed
      : [...live, ...upcoming, ...completed];

  const start = (page - 1) * limit;
  return { matches: ordered.slice(start, start + limit), total: ordered.length };
}

async function fetchPage({ tab, scope, page, signal }) {
  const limit = scope === "top" ? PREVIEW_LIMIT : PAGE_SIZE;
  const key = `${tab}|${scope}|${page}`;

  const hit = pageCache.get(key);
  if (hit && Date.now() - hit.time < CACHE_MS) return hit.result;

  let result;

  if (normalizedAll) {
    result = localQuery(normalizedAll, { tab, scope, page, limit });
  } else {
    const params = new URLSearchParams({
      tab,
      scope,
      page,
      limit,
      teams: TOP_TEAMS.join(","),
    });

    const response = await fetch(`${API_URL}?${params}`, { signal });
    if (!response.ok) throw new Error("Failed to fetch matches");

    const data = await response.json();

    if (Array.isArray(data)) {
      // old backend: everything came back, so keep it and page locally
      normalizedAll = data.map(withType);
      result = localQuery(normalizedAll, { tab, scope, page, limit });
    } else {
      const offset = (page - 1) * limit;
      result = {
        matches: (data.matches || []).map((m, i) => withType(m, offset + i)),
        total: data.total ?? 0,
      };
    }
  }

  pageCache.set(key, { time: Date.now(), result });
  return result;
}

/* =====================================================
   SMALL COMPONENTS
   ===================================================== */

function TeamLogo({ name, logo }) {
  const [failed, setFailed] = useState(false);
  const src = logo || getLogo(name);

  if (!src || failed) {
    return <div className="team-logo fallback">{name?.charAt(0)}</div>;
  }

  return (
    <img
      className="team-logo"
      src={src}
      alt={`${name} logo`}
      width="48"
      height="48"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

const MatchRow = memo(function MatchRow({ match }) {
  const { day, mon } = dateParts(match.date);
  const live = match.type === "live";
  const done = match.type === "completed";

  const status = live ? "LIVE" : done ? "RESULT" : "FIXTURE";
  const resultText =
    match.result || (match.winner ? `${match.winner} won` : "");

  return (
    <Link
      to={`/match/${match.id}`}
      state={{ match }}
      className={`sch-row ${live ? "is-live" : ""}`}
    >
      <div className="sch-date">
        <strong>{day}</strong>
        <span>{mon}</span>
      </div>

      <div className="sch-body">
        <div className="sch-meta">
          <span className={`sch-status ${status.toLowerCase()}`}>
            {live && <i />}
            {status}
          </span>
          <span className="sch-series">
            {match.series || match.event || match.format || "Cricket Match"}
            {match.series && match.format ? ` • ${match.format}` : ""}
          </span>
        </div>

        <div className="sch-teams">
          <div className="sch-team">
            <TeamLogo name={match.team1} logo={match.team1Logo} />
            <span className="sch-team-name">{match.team1}</span>
            {(done || live) && (
              <b className="sch-score">{match.team1Score || "—"}</b>
            )}
          </div>

          <span className="sch-vs">VS</span>

          <div className="sch-team right">
            {(done || live) && (
              <b className="sch-score">{match.team2Score || "—"}</b>
            )}
            <span className="sch-team-name">{match.team2}</span>
            <TeamLogo name={match.team2} logo={match.team2Logo} />
          </div>
        </div>

        <div className="sch-foot">
          <span>📍 {match.venue || "Venue TBA"}</span>
          {done && resultText && <em>{resultText}</em>}
        </div>

        {live && (
          <div className="sch-prob">
            <span>AI WIN PROBABILITY</span>
            <div className="sch-prob-bar">
              <div
                style={{ width: `${match.winProb?.[match.team1] ?? 50}%` }}
              />
            </div>
            <b>
              {match.team1} {match.winProb?.[match.team1] ?? 50}%
            </b>
          </div>
        )}
      </div>

      <div className="sch-cta">
        <span className="sch-btn">
          {live ? "WATCH LIVE" : done ? "MATCH CENTRE" : "PREVIEW"}
        </span>
      </div>
    </Link>
  );
});

function SkeletonRows({ count = 5 }) {
  return (
    <div className="sch-list">
      {Array.from({ length: count }).map((_, i) => (
        <div className="sch-row skeleton" key={i}>
          <div className="sch-date" />
          <div className="sch-body" />
          <div className="sch-cta" />
        </div>
      ))}
    </div>
  );
}

const Partners = memo(function Partners() {
  return (
    <section className="partners">
      <div className="container">
        {Object.entries(PARTNERS).map(([title, list]) => (
          <div className="partners-group" key={title}>
            <h4>{title}</h4>
            <div className="partners-logos">
              {list.map((p) => (
                <a
                  key={p.name}
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="partner"
                >
                  {p.logo ? (
                    <img
                      src={p.logo}
                      alt={`${p.name} logo`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span>{p.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

/* =====================================================
   PAGE
   ===================================================== */

function Matches() {
  const [tab, setTab] = useState("schedule");
  const [scope, setScope] = useState("top"); // "top" | "all"
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  /* ---------- LOAD FIRST PAGE (on tab / scope change) ---------- */

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");
    setItems([]);
    setPage(1);

    fetchPage({ tab, scope, page: 1, signal: controller.signal })
      .then(({ matches, total }) => {
        setItems(matches);
        setTotal(total);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Match API Error:", err);
        setError("Could not load matches. Check that the server is running.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [tab, scope, reloadKey]);

  /* ---------- LOAD MORE ---------- */

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);

    try {
      const { matches, total } = await fetchPage({ tab, scope, page: next });
      setItems((prev) => [...prev, ...matches]);
      setTotal(total);
      setPage(next);
    } catch (err) {
      console.error("Match API Error:", err);
      setError("Could not load more matches.");
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = scope === "all" && items.length < total;

  // group rows by month heading
  const groups = useMemo(() => {
    const out = [];
    items.forEach((m) => {
      const g = dateParts(m.date).group;
      const last = out[out.length - 1];
      if (last && last.title === g) last.items.push(m);
      else out.push({ title: g, items: [m] });
    });
    return out;
  }, [items]);

  /* ---------- RENDER ---------- */

  return (
    <div className="matches-page">
      {/* BANNER – small image card with curved border */}

      <section className="matches-banner-wrap">
        <div className="container">
          <div className="matches-banner">
            <img src={BANNER_IMG} alt="Banner" />
          </div>
        </div>
      </section>

      {/* TABS */}

      <div className="matches-tabs-wrap">
        <div className="container matches-tabs">
          <div className="tabs-left">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={tab === t.key ? "active" : ""}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            className="tabs-viewall"
            onClick={() => setScope((s) => (s === "top" ? "all" : "top"))}
          >
            {scope === "all" ? "← TOP MATCHES" : "ALL MATCHES →"}
          </button>
        </div>
      </div>

      <main className="container matches-content">
        {/* LOADING */}

        {loading && <SkeletonRows count={scope === "top" ? 5 : 6} />}

        {/* ERROR */}

        {!loading && error && items.length === 0 && (
          <div className="matches-empty">
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <div className="viewall-wrap">
              <button
                className="viewall-btn"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && groups.length === 0 && (
          <div className="matches-empty">
            <h2>No matches found</h2>
            <p>There are no matches available in this section.</p>
          </div>
        )}

        {/* LIST */}

        {!loading &&
          groups.map((g) => (
            <section className="sch-group" key={g.title}>
              <h3 className="sch-group-title">{g.title}</h3>
              <div className="sch-list">
                {g.items.map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))}

        {/* VIEW ALL / LOAD MORE */}

        {!loading && groups.length > 0 && (
          <div className="viewall-wrap">
            {scope === "top" && (
              <button className="viewall-btn" onClick={() => setScope("all")}>
                VIEW ALL MATCHES →
              </button>
            )}

            {hasMore && (
              <button
                className="viewall-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "LOADING..." : "LOAD MORE ↓"}
              </button>
            )}

            {scope === "all" && (
              <button
                className="viewall-btn outline"
                onClick={() => setScope("top")}
              >
                ← BACK TO TOP MATCHES
              </button>
            )}
          </div>
        )}
      </main>

      <Partners />

      {/* FOOTER – shared footer from yesterday's page */}
      <Footer />
    </div>
  );
}

export default Matches;