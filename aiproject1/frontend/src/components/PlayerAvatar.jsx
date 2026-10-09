import { useState } from "react";
import "./PlayerAvatar.css";

const TEAM_COLORS = {
  India: "#1B3A80",
  Australia: "#FFC72C",
  England: "#0C6B3D",
  "South Africa": "#0c6b3d",
  Pakistan: "#0c6b3d",
  "New Zealand": "#0a1226",
};

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Renders the player's real photo when available; if the file is missing
// (no photo dropped into public/players/ yet), falls back to a styled
// initials avatar instead of a broken-image icon.
function PlayerAvatar({ src, name, team, size = "md" }) {
  const [failed, setFailed] = useState(!src);
  const color = TEAM_COLORS[team] || "#1B3A80";

  if (failed) {
    return (
      <div className={`avatar-fallback avatar-${size}`} style={{ background: color }}>
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`avatar-img avatar-${size}`}
      onError={() => setFailed(true)}
    />
  );
}

export default PlayerAvatar;
