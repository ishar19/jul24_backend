const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
    skills:{
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("Skill", skillsSchema);