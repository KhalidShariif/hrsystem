const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { getUsers, createUser, getUserById, updateUser, deleteUser, uploadProfileImage, toggleStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const fs = require('fs');
    const dir = 'uploads/profiles/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    const userId = req.user ? req.user._id : 'anonymous';
    cb(null, `profile-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Images only! (jpg, jpeg, png)'));
    }
  },
});

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

// Standardized profile image upload route
router.put('/me/profile-image', protect, upload.single('profileImage'), uploadProfileImage);

// Legacy route for compatibility if needed, but redirects to controller
router.post('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.patch('/:id/toggle-status', protect, authorize('admin'), toggleStatus);

module.exports = router;
