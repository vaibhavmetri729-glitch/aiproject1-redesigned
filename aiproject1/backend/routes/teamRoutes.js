import express from "express";
import Team from "../models/Team.js";

const router = express.Router();

// Get all teams
router.get("/", async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Add a team
router.post("/", async (req, res) => {
    try {
        const team = new Team(req.body);
        const savedTeam = await team.save();

        res.json(savedTeam);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


export default router;