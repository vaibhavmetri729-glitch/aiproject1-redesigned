import express from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";

const router = express.Router();

// GET ALL MATCHES
router.get("/", async (req, res) => {
try {
const matches = await Match.find({})
.select(
"_id cricsheetId teams venue date format gender toss outcome innings"
)
.sort({ date: -1 })
.lean();


const formattedMatches = matches.map((match) => ({
  ...match,

  id: match.cricsheetId || String(match._id),

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
    ? `${match.innings[0].runs ?? 0}/${match.innings[0].wickets ?? 0}`
    : null,

  team2Score: match.innings?.[1]
    ? `${match.innings[1].runs ?? 0}/${match.innings[1].wickets ?? 0}`
    : null,

  team1Overs: match.innings?.[0]?.overs ?? null,
  team2Overs: match.innings?.[1]?.overs ?? null,

  type: match.outcome?.winner
    ? "completed"
    : "upcoming",
}));

res.status(200).json(formattedMatches);


} catch (error) {
console.error("GET MATCHES ERROR:", error);

res.status(500).json({
  success: false,
  message: "Failed to fetch matches",
  error: error.message,
});


}
});

// GET COMPLETE MATCH DETAILS
router.get("/:id", async (req, res) => {
try {
const { id } = req.params;


const conditions = [
  { cricsheetId: id }
];

// Also support MongoDB ObjectId
if (mongoose.Types.ObjectId.isValid(id)) {
  conditions.push({ _id: id });
}

const match = await Match.findOne({
  $or: conditions,
}).lean();

if (!match) {
  return res.status(404).json({
    success: false,
    message: `Match not found for ID: ${id}`,
  });
}

// Return the COMPLETE imported MongoDB document.
res.status(200).json({
  success: true,
  match,
});


} catch (error) {
console.error("GET MATCH DETAILS ERROR:", error);


res.status(500).json({
  success: false,
  message: "Failed to fetch match details",
  error: error.message,
});


}
});

export default router;
