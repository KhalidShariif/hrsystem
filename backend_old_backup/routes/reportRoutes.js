const express = require('express');
const router = express.Router();
const { getReportSummary, getReportBrief } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/summary', protect, authorize('admin', 'hr_manager'), getReportSummary);
router.get('/brief', protect, authorize('admin', 'hr_manager'), getReportBrief);
router.get('/tactical', protect, authorize('admin', 'hr_manager'), getReportSummary);

module.exports = router;

