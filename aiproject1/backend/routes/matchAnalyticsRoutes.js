import express from "express";
import Match from "../models/Match.js";

const router = express.Router();


// Head to Head Analysis
router.post("/head-to-head", async (req, res) => {

    try {

        const { team1, team2 } = req.body;


        const matches = await Match.find({
            $or: [
                {
                    team1: team1,
                    team2: team2
                },
                {
                    team1: team2,
                    team2: team1
                }
            ]
        });


        let team1Wins = 0;
        let team2Wins = 0;


        matches.forEach(match => {

            if(match.winner === team1)
                team1Wins++;

            if(match.winner === team2)
                team2Wins++;

        });


        res.json({

            teams:
            `${team1} vs ${team2}`,

            totalMatches:
            matches.length,

            [team1 + "_Wins"]:
            team1Wins,

            [team2 + "_Wins"]:
            team2Wins

        });


    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});


export default router;