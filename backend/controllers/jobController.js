const Job = require('../models/Job');
const Recruitment = require('../models/Recruitment');

const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    
    // Enrich jobs with applicant counts
    const enrichedJobs = await Promise.all(jobs.map(async (job) => {
      const applicantCount = await Recruitment.countDocuments({ job: job._id });
      return {
        ...job._doc,
        applicants: applicantCount
      };
    }));

    res.json(enrichedJobs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createJob = async (req, res, next) => {
  try {
    const job = new Job(req.body);
    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (job) res.json(job);
    else res.status(404).json({ message: 'Job not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob };
