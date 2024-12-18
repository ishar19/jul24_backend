const express = require('express');
const router = express.Router();

const Skill = require("../schema/skills.schema");


router.get('/skills', async (req, res) => {
    try{
        const skills = await Skill.find({});
        res.status(200).json({skills: skills});
    } catch (err) {
        res.status(400).json({message: "Error fetching skills"})
    }
});

module.exports = router;