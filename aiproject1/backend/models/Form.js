import mongoose from "mongoose";

const formSchema = new mongoose.Schema({

    team: {
        type: String,
        required: true
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
    },

    lastFiveMatches: {
        type: [String],
        default: []
    },

    formScore: {
        type: Number,
        default: 0
    }

});


const Form = mongoose.model("Form", formSchema);

export default Form;