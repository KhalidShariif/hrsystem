const Application = require('../models/Application');
const Employee = require('../models/Employee');
const Job = require('../models/Job');
const Department = require('../models/Department');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find().sort('-createdAt');
    res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent applications
// @route   GET /api/applications/recent
// @access  Private
const getRecentApplications = async (req, res, next) => {
  try {
    const applications = await Application.find().sort('-createdAt').limit(10);
    res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (application) {
      res.status(200).json(application);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update application stage
// @route   PUT /api/applications/:id/stage
// @access  Private
const updateApplicationStage = async (req, res, next) => {
  const { stage } = req.body;
  
  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: `Application not found with id of ${req.params.id}` });
    }

    application.stage = stage;
    await application.save();

    // Workflow: Automatic Employee Creation on HIRED
    if (stage === 'HIRED') {
      const nameParts = application.fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

      // Attempt to find department ID
      let deptId = null;
      if (application.jobId) {
          const job = await Job.findById(application.jobId);
          if (job && job.department) {
              const dept = await Department.findOne({ name: new RegExp('^' + job.department + '$', 'i') });
              if (dept) deptId = dept._id;
          }
      }

      // Create Employee
      await Employee.create({
        firstName,
        lastName,
        email: application.email,
        phone: application.phone,
        position: application.appliedRole,
        department: deptId,
        status: 'active',
        hireDate: new Date()
      });
    }

    res.status(200).json(application);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: `Application not found with id of ${req.params.id}` });
    }

    await application.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create application (Public or Private)
// @route   POST /api/applications
// @access  Public/Private
const createApplication = async (req, res, next) => {
  const { fullName, email, appliedRole } = req.body;

  if (!fullName || !email || !appliedRole) {
    return res.status(400).json({ message: 'Deployment failure: fullName, email, and appliedRole are mandatory.' });
  }

  try {
    const application = await Application.create(req.body);
    
    // Trigger notification
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        title: 'New Job Application',
        message: `${application.fullName} has submitted an application for ${application.appliedRole}.`,
        type: 'application',
        targetRole: 'admin',
        referenceId: application._id
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getApplications,
  getRecentApplications,
  getApplicationById,
  updateApplicationStage,
  deleteApplication,
  createApplication
};
