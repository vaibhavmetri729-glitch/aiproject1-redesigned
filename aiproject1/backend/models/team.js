import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    captain: {
        type: String,
        required: true
    },

    coach: {
        type: String
    },

    ranking: {
        type: Number,
        default: 0
    },

    matchesPlayed: {
        type: Number,
        default: 0
    },

    wins: {
        type: Number,
        default: 0
    },

    losses: {
        type: Number,
        default: 0
    }

});

const Team = mongoose.model("Team", teamSchema);

export default Team;