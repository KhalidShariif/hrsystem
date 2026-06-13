const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getSettings, updateSettings, getBranding, updateBranding } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (PNG, JPG, SVG) are allowed'));
  },
});

router.route('/').get(protect, getSettings).post(protect, updateSettings);
router.route('/branding')
  .get(getBranding) // Publicly accessible for global branding
  .put(protect, upload.single('logo'), updateBranding);

module.exports = router;
