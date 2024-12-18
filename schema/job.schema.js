const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    companyName: {
      type: String,
      required: true,
    },
    logoUrl: {
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
    remoteOffice: {
      type: String,
      required: true,
      enum: ["remote", "office"],
    },
    location: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
  
    companyDescription: {
      type: String,
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
    },
    additionalInfo: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  });

  module.exports = mongoose.model("Job", jobSchema)