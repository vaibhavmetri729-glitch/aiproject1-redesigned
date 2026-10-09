import express from "express";
import Form from "../models/Form.js";

const router = express.Router();


// Get all team forms
router.get("/", async (req, res) => {

    try {

        const forms = await Form.find();
        res.json(forms);

    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// Add team form
router.post("/", async (req, res) => {

    try {

        const form = new Form(req.body);

        const savedForm = await form.save();

        res.json(savedForm);

    } catch(error) {

        res.status(400).json({
            message: error.message
        });

    }

});


export default router;