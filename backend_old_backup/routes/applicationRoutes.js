const express = require('express');
const router = express.Router();
const {
  getApplications,
  getRecentApplications,
  getApplicationById,
  updateApplicationStage,
  deleteApplication,
  createApplication
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getApplications)
  .post(createApplication); // POST might be public for candidates

router.get('/recent', protect, getRecentApplications);

router.get('/:id', protect, getApplicationById);

router.put('/:id/stage', protect, authorize('admin', 'hr_manager'), updateApplicationStage);

router.delete('/:id', protect, authorize('admin', 'hr_manager'), deleteApplication);

module.exports = router;
