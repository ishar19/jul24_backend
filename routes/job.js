const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");

const Job = require("../schema/job.schema");
const auth = require("../middleware/auth");
const { default: mongoose } = require("mongoose");


dotenv.config();


router.get('/', async (req, res) => {
    const {limit, offset, q, jobPosition, minSalary, maxSalary, jobType, remoteOffice, skillsRequired } = req.query;


    let searchConditions = [];
    if (q) {
        const keywords = q.split(' ');
        keywords.forEach(keyword => {
            searchConditions.push(
                { companyName: {$regex: new RegExp(keyword, 'i')}},
                {jobPosition: {$regex: new RegExp(keyword, 'i')}},
                {location: {$regex: new RegExp(keyword, 'i')}}
            );
        });
    };


    const filters = {
        ...(searchConditions.length > 0 && {$or:searchConditions}),
        ...(jobType && {jobType}),
        ...(jobPosition && {jobPosition}),
        ...((minSalary && !maxSalary) && {salary: { $gte: Number(minSalary)}}),
        ...((!minSalary && maxSalary) && {salary: { $lte: Number(maxSalary)}}),
        ...((minSalary && maxSalary) && {salary: {$gte: Number(minSalary), $lte: Number(maxSalary)}}),
        ...(remoteOffice && {remoteOffice}),
        ...(skillsRequired && {skillsRequired: { $in: skillsRequired.split(',') }}),
    }

    const jobs = await Job.find(filters).skip(Number(offset) || 0).limit(Number(limit) || 0);
    return res.status(200).json(jobs);
});



router.get("/:id", async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({ message: "Invalid job id" });
    }
    
    try{
        const job = await Job.findOne({_id: id});
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json(job);
    } catch (err) {
        return res.status(400).json({message: "Error fetching job details", err});
    }
})



router.delete('/:id', auth,  async (req, res) => {
    const {id} = req.params;
    const job = await Job.findById(id);
    const userId = req.user.id;

    if(!job){
        return res.status(400).json({message: "Job not found"});
    };

    if (userId !== job.user.toString()){
        return res.status(400).json({message: "Not authorized to delete"})
    }

        await Job.findByIdAndDelete(id);
        return res.status(200).json({message: "Job deleted successfully"});

});

router.post('/', auth, async (req, res) => {
    const {
        companyName,
        logoUrl,
        jobPosition,
        salary,
        jobType,
        remoteOffice,
        location,
        jobDescription,
        companyDescription,
        skillsRequired,
        additionalInfo
      } = req.body;

      if ( !companyName ||
        !logoUrl ||
        !jobPosition ||
        !salary ||
        !jobType ||
        !remoteOffice ||
        !location ||
        !jobDescription ||
        !companyDescription  ||
        !skillsRequired) {
            return res.status(400).json({message: "Missing required fields"});
        }
        console.log("Logged-in user ID:", req.user.id);

    try {
        const userID = req.user.id;
        const job = await Job.create({
            companyName,
            logoUrl,
            jobPosition,
            salary,
            jobType,
            remoteOffice,
            location,
            jobDescription,
            companyDescription,
            skillsRequired,
            additionalInfo,
            user: userID
        });

        return res.status(200).json({message: "Job created successfully"});
    } catch (err) {
        console.log(err)
        return res.status(400).json({message: "Error in creating job :", err: err});
    }
});


router.put("/:id", auth, async (req, res) => {
    const {id} = req.params;
    const {
        companyName,
        logoUrl,
        jobPosition,
        salary,
        jobType,
        remoteOffice,
        location,
        jobDescription,
        companyDescription,
        skillsRequired,
        additionalInfo,
      } = req.body;

    const job = await Job.findById(id);

    if (!job){
        return res.status(400).json({message : "Job not found"});
    }
    if (req.user.id !== job.user.toString()){
        return res.status(400).json({message : "Not authorized to edit this job"});
    }

    try {
        await Job.findByIdAndUpdate(id, {
            companyName,
            logoUrl,
            jobPosition,
            salary,
            jobType,
            remoteOffice,
            location,
            jobDescription,
            companyDescription,
            skillsRequired,
            additionalInfo,
          });
        return res.status(200).json({message: "Job updated successfully"});

    } catch (err) {
        return res.status(400).json({message: "Error in updating job"});
    }
})

module.exports = router;