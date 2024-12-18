const express = require('express');
const router = express.Router();

const JobPosition = require("../schema/jobPosition.schema");


router.get('/jobPositions', async (req, res) => {
    try{
        const positionNames = await JobPosition.find({});
        res.status(200).json(positionNames);
    } catch (err) {
        res.status(400).json({message: "Error fetching job positions"});
    }
});

module.exports = router;