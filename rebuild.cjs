const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const oldBackend = path.join(rootDir, 'backend');
const backupDir = path.join(rootDir, 'backend_old_backup');
const newBackend = path.join(rootDir, 'backend');

// 1. Backup old backend
if (fs.existsSync(oldBackend)) {
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  fs.renameSync(oldBackend, backupDir);
  console.log('Backed up backend to backend_old_backup');
}

// 2. Create clean structure
const dirs = ['config', 'models', 'controllers', 'routes', 'middleware', 'uploads', 'scripts'];
fs.mkdirSync(newBackend);
dirs.forEach(d => fs.mkdirSync(path.join(newBackend, d)));

// 3. Write package.json
const pkg = {
  name: "hayaan-hr-backend",
  version: "1.0.0",
  main: "server.js",
  scripts: {
    start: "node server.js",
    dev: "nodemon server.js"
  },
  dependencies: {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.3",
    "multer": "^1.4.5-lts.1"
  },
  devDependencies: {
    "nodemon": "^2.0.22"
  }
};
fs.writeFileSync(path.join(newBackend, 'package.json'), JSON.stringify(pkg, null, 2));

// 4. Write .env
const envContent = `PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hayaan_hr
JWT_SECRET=supersecret123
`;
fs.writeFileSync(path.join(newBackend, '.env'), envContent);

// 5. Copy config, models, middleware, scripts
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath);
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir(path.join(backupDir, 'config'), path.join(newBackend, 'config'));
copyDir(path.join(backupDir, 'models'), path.join(newBackend, 'models'));
copyDir(path.join(backupDir, 'middleware'), path.join(newBackend, 'middleware'));
copyDir(path.join(backupDir, 'scripts'), path.join(newBackend, 'scripts'));

// 6. Process Controllers (Clean and rename userController to hrManagerController)
const controllersSrc = path.join(backupDir, 'controllers');
const controllersDest = path.join(newBackend, 'controllers');
const controllerFiles = fs.readdirSync(controllersSrc);

controllerFiles.forEach(file => {
  let content = fs.readFileSync(path.join(controllersSrc, file), 'utf8');
  
  // Enforce cleanup rule: replace next(error) with return res.status(500)
  content = content.replace(/next\(\s*error\s*\)/g, "return res.status(500).json({ message: error.message })");
  content = content.replace(/next\(\s*err\s*\)/g, "return res.status(500).json({ message: err.message })");

  let destFile = file;
  if (file === 'userController.js') {
    destFile = 'hrManagerController.js';
  }
  fs.writeFileSync(path.join(controllersDest, destFile), content);
});

// 7. Process Routes (Rename userRoutes to hrManagerRoutes)
const routesSrc = path.join(backupDir, 'routes');
const routesDest = path.join(newBackend, 'routes');
const routeFiles = fs.readdirSync(routesSrc);

routeFiles.forEach(file => {
  let content = fs.readFileSync(path.join(routesSrc, file), 'utf8');
  
  // Remove express-async-handler
  content = content.replace(/const asyncHandler = require\('express-async-handler'\);/g, '');
  content = content.replace(/asyncHandler\(([^)]+)\)/g, '$1');
  
  if (file === 'userRoutes.js') {
    content = content.replace(/userController/g, 'hrManagerController');
    fs.writeFileSync(path.join(routesDest, 'hrManagerRoutes.js'), content);
  } else {
    fs.writeFileSync(path.join(routesDest, file), content);
  }
});

// 8. Write server.js
const serverContent = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/hr-managers', require('./routes/hrManagerRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server error"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
fs.writeFileSync(path.join(newBackend, 'server.js'), serverContent);

// 9. Update frontend to use /api/hr-managers instead of /api/users
const hrManagersPage = path.join(rootDir, 'src', 'pages', 'HRManagers.jsx');
if (fs.existsSync(hrManagersPage)) {
  let content = fs.readFileSync(hrManagersPage, 'utf8');
  content = content.replace(/\/users/g, '/hr-managers');
  fs.writeFileSync(hrManagersPage, content);
}

// 10. Also update HRManagers in Dashboard or other places if they fetch users
const dashboardPage = path.join(rootDir, 'src', 'pages', 'Dashboard.jsx');
if (fs.existsSync(dashboardPage)) {
  let content = fs.readFileSync(dashboardPage, 'utf8');
  content = content.replace(/\/users/g, '/hr-managers');
  fs.writeFileSync(dashboardPage, content);
}

console.log('Rebuild successful. Ready to npm install.');
