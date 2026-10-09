import express from "express";
import Team from "../models/Team.js";
import Player from "../models/Player.js";

const router = express.Router();

router.get("/team-performance", async (req, res) => {

    try {
        const teams = await Team.find();

        const performance = teams.map(team => ({
            team: team.name,
            winPercentage:
                ((team.wins / team.matchesPlayed) * 100).toFixed(2)
        }));

        res.json(performance);

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }

});
router.get("/player-performance", async (req, res) => {

    try {

        const players = await Player.find();

        const performance = players.map(player => ({
            player: player.name,
            runs: player.runs,
            average: player.average,
            strikeRate: player.strikeRate,

            performanceScore:
            (
                player.average * 0.5 +
                player.strikeRate * 0.3 +
                (player.runs / 200) * 0.2
            ).toFixed(2)

        }));

        res.json(performance);

    } catch(error) {
        res.status(500).json({
            message:error.message
        });
    }

});

export default router;