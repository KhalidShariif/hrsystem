const Recruitment = require('../models/Recruitment');

const getCandidates = async (req, res, next) => {
  try {
    const candidates = await Recruitment.find()
      .populate('job', 'title')
      .sort({ appliedDate: -1 });
    res.json(candidates);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createCandidate = async (req, res, next) => {
  try {
    const candidate = new Recruitment(req.body);
    const createdCandidate = await candidate.save();
    res.status(201).json(createdCandidate);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await Recruitment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (candidate) res.json(candidate);
    else res.status(404).json({ message: 'Candidate not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Recruitment.findById(req.params.id);
    if (candidate) {
      await candidate.deleteOne();
      res.json({ message: 'Candidate removed' });
    } else {
      res.status(404).json({ message: 'Candidate not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getCandidates, createCandidate, updateCandidate, deleteCandidate };
