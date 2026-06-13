const express = require('express');
const router = express.Router();
const { getCandidates, createCandidate, updateCandidate, deleteCandidate } = require('../controllers/recruitmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCandidates)
  .post(protect, authorize('admin', 'hr_manager'), createCandidate);

router.route('/:id')
  .put(protect, authorize('admin', 'hr_manager'), updateCandidate)
  .delete(protect, authorize('admin', 'hr_manager'), deleteCandidate);

module.exports = router;
