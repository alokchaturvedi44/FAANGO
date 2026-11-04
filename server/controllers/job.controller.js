import { Job } from "../models/job.model.js";

// post a job - for admin
export const postJob = async (req, res) => {
    try{
        const {title, description, requirements, salary, location, jobType, experienceLevel, position, companyId} = req.body;
        const userId = req.id;

        if(!title || !description || !requirements || salary == null || !location || !jobType || experienceLevel == null || !position || !companyId){
            return res.status(400).json({
                message: "Something is missing...",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(",").map(req => req.trim()).filter(req => req.length > 0),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(experienceLevel),
            position,
            company: companyId,
            created_by: userId
        });

        return res.status(200).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// get all jobs - for students
export const getAllJobs = async (req, res) => {
    try{
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                {title: {$regex: keyword, $options: "i"}},
                {description: {$regex: keyword, $options: "i"}}
            ]
        };

        const jobs = await Job.find(query)
                    .populate({
                        path: "company",
                        select: "name description website"
                    })
                    .sort({ createdAt: -1 });  // this will return newest jobs first

        if(jobs.length == 0){
            return res.status(404).json({
                message: "Jobs not found",
                success: false
            });
        }

        return res.status(200).json({
            jobs,
            success: true
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// get job by ID - for students
export const getJobById = async (req, res) => {
    try{
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                message: "No jobs found!",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// get job created by admin
export const getAdminJobs = async (req, res) => {
    try{
        const adminId = req.id;
        const jobs = await Job.find({created_by: adminId})
                              .populate({ path: "company" })
                              .sort({ createdAt: -1 });
        if(!jobs){
            return res.status(404).json({
                message: "No jobs found!",
                success: false
            });
        }

        return res.status(200).json({
            jobs,
            success: true
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}