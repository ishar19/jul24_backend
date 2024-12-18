const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");

const Skill = require("../schema/skills.schema");
const JobPosition = require('../schema/jobPosition.schema');
const Job = require("../schema/job.schema");
const auth = require("../middleware/auth");
const { default: mongoose } = require("mongoose");


dotenv.config();

const sanitize = (keyword) => {
    return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res) => {
    const {limit, offset, q, jobPosition, minSalary, maxSalary, jobType, remoteOffice, skills } = req.query;

    let searchConditions = [];
    if (q) {
        const keywords = q.split(' ');
        keywords.forEach(keyword => {
            const sanitized = sanitize(keyword);
            searchConditions.push(
                { companyName: {$regex: new RegExp(keyword, 'i')}},
                {jobPosition: {$regex: new RegExp(keyword, 'i')}},
                {location: {$regex: new RegExp(keyword, 'i')}},
            );
        });
    };


    const filters = {
        ...(searchConditions.length > 0 && {$or:searchConditions}),
        ...(jobType && {jobType: {$regex: new RegExp(`^${jobType}$`, 'i')}}),
        ...(jobPosition && {jobPosition: {$regex: new RegExp(`^${jobPosition}$`, 'i')}}),
        ...((minSalary && !maxSalary) && {salary: { $gte: Number(minSalary)}}),
        ...((!minSalary && maxSalary) && {salary: { $lte: Number(maxSalary)}}),
        ...((minSalary && maxSalary) && {salary: {$gte: Number(minSalary), $lte: Number(maxSalary)}}),
        ...(remoteOffice && {remoteOffice: {$regex: new RegExp(`^${remoteOffice}$`, 'i')}}),
        ...(skills && {skills: { $in: skills.split(',').map(skill => skill.trim()) }}),
    }
    console.log(filters);
    const jobs = await Job.find(filters).skip(Number(offset) || 0).limit(Number(limit));
    const count =await Job.countDocuments(filters);
    return res.status(200).json({jobs, count});
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


    try {
        const userID = req.user.id;

        for (const skill of skillsRequired) {
            const existingSkill = await Skill.findOne({skills: skill});
            if (!existingSkill) {
                await Skill.create({skills: skill});
            }
        }

        if(jobPosition){
            const existingPosition = await JobPosition.findOne({positionNames: jobPosition});
            if (!existingPosition) {
                await JobPosition.create({positionNames: jobPosition});
            }
        }

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