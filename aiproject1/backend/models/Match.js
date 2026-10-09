import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    cricsheetId: {
      type: String,
      unique: true,
      index: true,
    },

    teams: [String],

    venue: String,

    date: String,

    format: String,

    gender: String,

    toss: {
      winner: String,
      decision: String,
    },

    outcome: {
      winner: String,
      result: String,
    },

    players: mongoose.Schema.Types.Mixed,

    innings: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model("Match", matchSchema);

export default Match;