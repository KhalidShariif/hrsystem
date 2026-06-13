const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getJobs)
  .post(protect, authorize('admin', 'hr_manager'), createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('admin', 'hr_manager'), updateJob)
  .delete(protect, authorize('admin', 'hr_manager'), deleteJob);

module.exports = router;
