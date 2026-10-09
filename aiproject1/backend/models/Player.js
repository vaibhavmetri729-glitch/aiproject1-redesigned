import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    team: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true
    },

    runs: {
        type: Number,
        default: 0
    },

    wickets: {
        type: Number,
        default: 0
    },

    average: {
        type: Number,
        default: 0
    },

    strikeRate: {
        type: Number,
        default: 0
    }
});

const Player = mongoose.model("Player", playerSchema);

export default Player;