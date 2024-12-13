const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    jobPosition: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    jobType: {
        type: String,
        required: true,
        enum: ["full-time", "part-time", "contract", "internship", "freelance"],
    },
    skills: {
        type: Array,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

module.exports = mongoose.model("Job", jobSchema);

// Homework,add missing fields in schema and udapte the apis accordingly