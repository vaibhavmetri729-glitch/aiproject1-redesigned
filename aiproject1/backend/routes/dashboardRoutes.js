import express from "express";
import Player from "../models/Player.js";
import Team from "../models/Team.js";
import Match from "../models/Match.js";

const router = express.Router();


// Dashboard Data API
router.get("/", async (req, res) => {

    try {

        const players = await Player.find()
            .sort({ runs: -1 })
            .limit(5);


        const teams = await Team.find()
            .sort({ ranking: 1 });


        const matches = await Match.find()
            .sort({ date: -1 })
            .limit(5);


        res.json({

            topPlayers: players,

            teamRankings: teams,

            recentMatches: matches

        });


    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});


export default router;