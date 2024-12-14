const express = require("express");
const router = express.Router();
const Job = require("../models/job.schema");
const dotenv = require("dotenv");
const authMiddleware = require("../middleware/auth");
dotenv.config();

//                      read the data
// /?limit=10&offset=1       offset,page,skip     limit,size,pageSize,count
router.get("/", async (req, res) => {
    try {
        const {offset, limit, name, monthlySalary} = req.query;
        const query = {}
        if(name) {
            query.companyName = {$regex: name, $options: "i"}
        }
        if(monthlySalary) {
            query.monthlySalary = {$gte: monthlySalary, $lte: monthlySalary};
        }
        const jobs = await Job.find(query).skip(offset || 0).limit(limit || 20);
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    // get me jobs with salary between 200 and 300
    // const jobs = await Job.find({ salary: { $gte: 200, $lte: 300 } }).skip(offset).limit(limit);
    // get me jobs with salary = salary
    // const jobs = await Job.find({ salary }).skip(offset).limit(limit);
    // get me jobs which includes comopany name with name and salary = salary
    // const jobs = await Job.find({ companyName: name, salary }).skip(offset).limit(limit);  // will exactly match the name

    // jobs company name should contain name   // Book book BOOK bOOK
    // const jobs = await Job.find({ companyName: { $regex: name, $options: "i" } }).skip(offset).limit(limit);

    // jobs company name should contain name and salary = salary
    // const jobs = await Job.find().skip(offset).limit(limit);
});

//          get the single job data
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
});

//              Create a job data
router.post("/", authMiddleware, async (req, res) => {
    const {companyName, addLogoUrl, jobPosition, monthlySalary, jobType, jobNature, location, jobDescription, aboutCompany, skillsRequired, information} = req.body;
    // Check if all required fields are present
    if(!companyName || !addLogoUrl || !jobPosition || !monthlySalary || !jobType || !jobNature || !location || !jobDescription || !aboutCompany || !skillsRequired || !information) {
        return res.status(400).json({message: "All fields are required"});
    }
    try {
        //              retrieve user from the verified token
        const user = req.user;
        //              create a new job
        const newJob = new Job({
            companyName,
            addLogoUrl,
            jobPosition,
            monthlySalary,
            jobType,
            jobNature,
            location,
            jobDescription,
            aboutCompany,
            skillsRequired,
            information,
            user: user.id        // associate the job with the logged-in user
        });
        await newJob.save();
        res.status(200).json({message: "Job posted"});
    } catch(err) {
        console.log(`Error posting job ${err}`);
        res.status(500).json({message: "Could not post the job"});
    }
})

//              update the data
router.put("/:id", authMiddleware, async (req, res) => {
    const {id} = req.params;
    const {companyName, addLogoUrl, jobPosition, monthlySalary, jobType, jobNature, location, jobDescription, aboutCompany, skillsRequired, information} = req.body;
    const job = await Job.findById(id);                //search the job posted by its id 
    //      check if the job post is present or not
    if(!job) {
        return res.status(404).json({message: "Job not found"});
    };
    //      check if the user is the actual owner of the job posted or not
    if(job.user.toString() !== req.user.id) {               //user.toString() -> converts the objectId of user who created the job into string and req.user.id(user associated with the request)
        res.status(401).json({message: "You are not authorized to modify this job"});
        return;
    };
    try {
        await Job.findByIdAndUpdate(id, {
            companyName,
            addLogoUrl,
            jobPosition,
            monthlySalary,
            jobType, 
            jobNature, 
            location, 
            jobDescription, 
            aboutCompany, 
            skillsRequired,
            information
        });
        res.status(200).json({ message: "Job updated" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in updating job" });
    }
})

//                                      delete the job
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;                          //retreive the id from the req params 
    const job = await Job.findById(id);            //search the job from the db by its id
    //                  assigning the req user id to the userId 
    const userId = req.user.id;
    //                  check if the job is present or not
    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }
    //                  check if the user is the job post owner or not
    if (userId !== job.user.toString()) {
        return res.status(401).json({ message: "You are not authorized to delete this job" });
    }
    // 
    await Job.deleteOne({ _id: id });
    res.status(200).json({ message: "Job deleted" });
});


module.exports = router;


// Pagination
// Searching 
// Filtering 


// Homework 
// make as sophisticated and complex filtering and searching as you can
// for ex: make it so that it can search by company name and job position and  salary and job type
// for ex: make it so that it can search by company name or job position or  salary or job type