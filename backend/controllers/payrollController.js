const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

const populateOptions = { path: 'employeeId', select: 'firstName lastName employeeId position salary employeeType status hub district', populate: { path: 'department', select: 'name' } };

const getPayrolls = async (req, res, next) => {
  try {
    let payrolls = await Payroll.find().populate(populateOptions).sort({ createdAt: -1 });
    
    if (payrolls.length === 0) {
      const employees = await Employee.find({ status: 'active' });
      if (employees.length > 0) {
        const now = new Date();
        const month = now.toLocaleString('en-US', { month: 'long' });
        const year = now.getFullYear();
        const newRecords = [];
        for (const emp of employees) {
          const basicSalary = emp.salary || 0;
          newRecords.push({
            employeeId: emp._id,
            month,
            year,
            basicSalary,
            allowances: 0,
            deductions: 0,
            netSalary: basicSalary,
            status: 'pending'
          });
        }
        await Payroll.insertMany(newRecords);
        payrolls = await Payroll.find().populate(populateOptions).sort({ createdAt: -1 });
      }
    }
    
    // HR manager restriction: Only see payroll in assigned hub/district
    if (req.user.role === 'hr_manager') {
      payrolls = payrolls.filter(p => {
        const matchesHub = p.employeeId?.hub === req.user.region;
        const matchesDistrict = !req.user.district || p.employeeId?.district === req.user.district;
        return matchesHub && matchesDistrict;
      });
    }

    res.json(payrolls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPayrollById = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(populateOptions);
    if (payroll) res.json(payroll);
    else res.status(404).json({ message: 'Payroll not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createPayroll = async (req, res, next) => {
  try {
    const payroll = new Payroll(req.body);
    const created = await payroll.save();
    res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePayroll = async (req, res, next) => {
  try {
    const existing = await Payroll.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Payroll not found' });

    const basicSalary = existing.basicSalary;
    const allowances = req.body.allowances !== undefined ? Number(req.body.allowances) : existing.allowances;
    const deductions = req.body.deductions !== undefined ? Number(req.body.deductions) : existing.deductions;
    const netSalary = basicSalary + allowances - deductions;

    if (netSalary < 0) {
      return res.status(400).json({ message: 'Deductions cannot exceed basic salary + allowances. Net salary cannot be negative.' });
    }

    const updates = { ...req.body, allowances, deductions, netSalary };
    if (updates.status === 'paid' && !updates.paidDate) {
      updates.paidDate = new Date();
    }

    const payroll = await Payroll.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate(populateOptions);
    res.json(payroll);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (payroll) {
      await payroll.deleteOne();
      res.json({ message: 'Payroll removed' });
    } else {
      res.status(404).json({ message: 'Payroll not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const generatePayroll = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();

    const query = {};
    if (req.user.role === 'hr_manager') {
      query.hub = req.user.region;
      if (req.user.district) query.district = req.user.district;
    }

    const employees = await Employee.find(query);
    const created = [];
    const skipped = [];

    for (const emp of employees) {
      const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
      if (existing) { skipped.push(emp._id); continue; }

      if (!emp.salary) console.warn(`Warning: Employee ${emp.firstName} ${emp.lastName} has no salary set`);

      const basicSalary = emp.salary || 0;
      const allowances = 0;
      const deductions = 0;
      const netSalary = basicSalary + allowances - deductions;

      const payroll = await Payroll.create({
        employeeId: emp._id,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status: 'pending'
      });
      created.push(payroll);
    }

    res.status(201).json({
      message: `Payroll generated: ${created.length} created, ${skipped.length} skipped (already exist)`,
      created: created.length,
      skipped: skipped.length
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPayrollStats = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();

    const records = await Payroll.find({ month, year });
    
    const totalNetPaid = records.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.netSalary || 0), 0);
    const pendingApproval = records.filter(r => r.status === 'pending').length;
    const fiscalDeductions = records.reduce((sum, r) => sum + (r.deductions || 0), 0);
    const totalGenerated = records.reduce((sum, r) => sum + (r.netSalary || 0), 0);

    res.json({
      totalNetPaid,
      pendingApproval,
      fiscalDeductions,
      totalGenerated,
      month,
      year
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getPayrolls, getPayrollById, createPayroll, updatePayroll, deletePayroll, generatePayroll, getPayrollStats };
