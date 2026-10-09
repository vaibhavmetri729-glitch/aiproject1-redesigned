import express from "express";
import Match from "../models/Match.js";

const router = express.Router();

// GET ALL MATCHES
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find({})
      .select(
        "cricsheetId teams venue date format gender toss outcome innings"
      )
      .sort({ date: -1 });

    const formattedMatches = matches.map((match) => ({
      id: match.cricsheetId,

      team1: match.teams?.[0] || "Unknown",
      team2: match.teams?.[1] || "Unknown",

      venue: match.venue || "Venue TBA",
      date: match.date || "",
      format: match.format || "ODI",

      gender: match.gender || "male",

      tossWinner: match.toss?.winner || null,
      tossDecision: match.toss?.decision || null,

      winner: match.outcome?.winner || null,

      team1Score: match.innings?.[0]
        ? `${match.innings[0].runs}/${match.innings[0].wickets}`
        : null,

      team2Score: match.innings?.[1]
        ? `${match.innings[1].runs}/${match.innings[1].wickets}`
        : null,

      team1Overs: match.innings?.[0]?.overs || null,
      team2Overs: match.innings?.[1]?.overs || null,

      type: match.outcome?.winner
        ? "completed"
        : "upcoming",
    }));

    res.json(formattedMatches);

  } catch (error) {
    console.error("GET MATCHES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch matches",
    });
  }
});


// GET ONE MATCH
router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findOne({
      cricsheetId: req.params.id,
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    res.json(match);

  } catch (error) {
    console.error("GET MATCH ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch match",
    });
  }
});

export default router;