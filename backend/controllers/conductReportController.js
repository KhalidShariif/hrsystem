const ConductReport = require('../models/ConductReport');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Employee = require('../models/Employee');

// @desc    Create a new conduct report
// @route   POST /api/conduct-reports
// @access  Private (HR Manager)
const createConductReport = async (req, res) => {
  try {
    const { employeeId, title, conductType, description, priority, attachment } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if HR can submit for this employee (same region/hub)
    if (req.user.role === 'hr_manager' && req.user.region !== employee.hub) {
      return res.status(403).json({ message: 'Not authorized to submit reports for employees outside your branch' });
    }

    const report = await ConductReport.create({
      employeeId,
      submittedBy: req.user._id,
      title,
      conductType,
      description,
      priority,
      attachment,
      status: 'pending'
    });

    // Create notification for admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user._id,
        title: 'New Conduct Report',
        message: `HR submitted a conduct report for ${employee.firstName} ${employee.lastName}`,
        type: 'conduct_report',
        relatedId: report._id,
        link: `/admin/conduct-reports/${report._id}`,
        targetRole: 'admin'
      });
    }

    return res.status(201).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conduct reports
// @route   GET /api/conduct-reports
// @access  Private (Admin)
const getConductReports = async (req, res) => {
  try {
    let query = {};

    // If HR manager, only show reports they submitted or in their branch?
    // User request says Admin can see all. HR can submit.
    if (req.user.role === 'hr_manager') {
      query.submittedBy = req.user._id;
    }

    const reports = await ConductReport.find(query)
      .populate('employeeId', 'firstName lastName employeeId hub')
      .populate('submittedBy', 'firstName lastName role')
      .sort({ createdAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single conduct report
// @route   GET /api/conduct-reports/:id
// @access  Private
const getConductReportById = async (req, res) => {
  try {
    const report = await ConductReport.findById(req.params.id)
      .populate('employeeId', 'firstName lastName employeeId hub position department')
      .populate('submittedBy', 'firstName lastName role');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update report status
// @route   PATCH /api/conduct-reports/:id/status
// @access  Private (Admin)
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update report status' });
    }

    const report = await ConductReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createConductReport,
  getConductReports,
  getConductReportById,
  updateReportStatus
};
