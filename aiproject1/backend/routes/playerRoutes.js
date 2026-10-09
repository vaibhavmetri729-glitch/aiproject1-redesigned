import express from "express";
import Player from "../models/Player.js";

const router = express.Router();

// Get all players
router.get("/", async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


// Add a player
router.post("/", async (req, res) => {
    try {
        const player = new Player(req.body);
        const savedPlayer = await player.save();

        res.json(savedPlayer);

    } catch (error) {
        res.status(400).json({message: error.message});
    }
});


export default router;