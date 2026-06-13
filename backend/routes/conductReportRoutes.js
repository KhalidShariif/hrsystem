const express = require('express');
const router = express.Router();
const {
  createConductReport,
  getConductReports,
  getConductReportById,
  updateReportStatus
} = require('../controllers/conductReportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createConductReport)
  .get(protect, getConductReports);

router.route('/:id')
  .get(protect, getConductReportById);

router.route('/:id/status')
  .patch(protect, authorize('admin'), updateReportStatus);

module.exports = router;
