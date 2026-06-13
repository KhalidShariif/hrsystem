const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const User = require('../models/User');

const getEmployees = async (req, res, next) => {
  try {
    const query = {};

    // HR manager restriction: Only see employees in assigned hub/district
    if (req.user.role === 'hr_manager') {
      query.hub = req.user.region;
      if (req.user.district) {
        query.district = req.user.district;
      }
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex }
      ];
    }

    if (req.query.city && req.query.city !== 'all') {
      query.city = req.query.city;
    }

    if (req.query.district && req.query.district !== 'all') {
      query.district = req.query.district;
    }

    if (req.query.hub && req.query.hub !== 'all') {
      query.hub = req.query.hub;
    }

    let employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('user', 'firstName lastName email');

    // Post-populate department name filter
    if (req.query.department && req.query.department !== 'all') {
      employees = employees.filter(
        e => e.department?.name === req.query.department
      );
    }

    res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('user', 'firstName lastName email');
    
    if (employee) {
      // Fetch stats
      const [attendance, leaves, payrolls] = await Promise.all([
        Attendance.find({ employee: req.params.id }),
        Leave.find({ employee: req.params.id }),
        Payroll.find({ employeeId: req.params.id })
      ]);

      const attendanceCount = attendance.length;
      const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const attendancePercentage = attendanceCount > 0 ? ((presentCount / attendanceCount) * 100).toFixed(0) : 0;
      
      const leaveCount = leaves.filter(l => l.status === 'approved').length;
      const latestPayroll = payrolls.sort((a, b) => b.createdAt - a.createdAt)[0];

      res.json({
        ...employee._doc,
        stats: {
          attendancePercentage,
          leaveCount,
          payrollStatus: latestPayroll ? latestPayroll.status : 'N/A',
          performanceScore: attendancePercentage // Simple mapping for now
        }
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { email, password, loginRole } = req.body;

    // 1. Basic validation
    if (!password) {
      return res.status(400).json({ message: 'Password is required for employee login' });
    }

    // 2. Check if email already exists in either Employee or User collection
    const existingEmployee = await Employee.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingEmployee || existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 3. Create Employee
    const employee = new Employee(req.body);
    const createdEmployee = await employee.save();

    // 4. Create User account
    const user = await User.create({
      firstName: createdEmployee.firstName,
      lastName: createdEmployee.lastName,
      email: createdEmployee.email,
      password: password,
      role: loginRole || 'employee',
      region: createdEmployee.hub,
      district: createdEmployee.district,
      employeeIdRef: createdEmployee._id
    });
    
    // 5. Link User back to Employee
    createdEmployee.user = user._id;
    await createdEmployee.save();

    // 6. Auto-sync payroll entry
    if (createdEmployee.status === 'active') {
      const now = new Date();
      const month = now.toLocaleString('en-US', { month: 'long' });
      const year = now.getFullYear();
      const basicSalary = createdEmployee.salary || 0;
      await Payroll.create({
        employeeId: createdEmployee._id,
        month,
        year,
        basicSalary,
        allowances: 0,
        deductions: 0,
        netSalary: basicSalary,
        status: 'pending'
      });
    }

    res.status(201).json(createdEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(400).json({ message: error.message });
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      // Delete related records
      await Attendance.deleteMany({ employee: req.params.id });
      await Leave.deleteMany({ employee: req.params.id });
      await Payroll.deleteMany({ employeeId: req.params.id });
      
      await employee.deleteOne();
      res.json({ message: 'Employee and related records removed' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
