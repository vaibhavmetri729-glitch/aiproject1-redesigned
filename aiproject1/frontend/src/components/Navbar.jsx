import { useState } from "react";
import { NavLink } from "react-router-dom";
import { TICKER_MATCHES } from "../data/mockData";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/matches", label: "Matches" },
    { to: "/teams", label: "Teams" },
    { to: "/players", label: "Players" },
    { to: "/ai-lab", label: "AI Lab" },
    
  ];

  return (
    <header className="site-header">
      {/* Signature: scrolling live scoreboard ticker */}
      <div className="ticker" aria-label="Live scores ticker">
        <div className="ticker-track">
          {[...TICKER_MATCHES, ...TICKER_MATCHES].map((m, i) => (
            <span className="ticker-item" key={`${m.id}-${i}`}>
              {m.live && <span className="ticker-dot" />}
              <strong>{m.teams}</strong>
              <span className="ticker-sep">·</span>
              <span>{m.note}</span>
            </span>
          ))}
        </div>
      </div>

      <nav className="navbar">
        <div className="container navbar-inner">
          <NavLink to="/" className="logo">
            <span className="logo-mark"></span>
            <span>
              SmartCricket<span className="logo-ai">.com</span>
            </span>
          </NavLink>

          <div className={`nav-links ${open ? "is-open" : ""}`}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <button
            className="nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
