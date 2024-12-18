const mongoose = require('mongoose');

const jobPositionSchema = new mongoose.Schema({
    positionNames:{
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("JobPosition", jobPositionSchema);