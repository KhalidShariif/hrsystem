const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src', 'components');

const sidebars = ['HRSidebar.jsx', 'Sidebar.jsx', 'EmployeeSidebar.jsx'];

sidebars.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('useAuth')) {
      content = content.replace(/import React from 'react';/, "import React from 'react';\nimport { useAuth } from '../context/AuthContext';");
    }

    if (!content.includes('const { user } = useAuth();')) {
      content = content.replace(/const { branding } = useBranding\(\);|const { isSidebarOpen/g, "const { user } = useAuth();\n  $&");
    }

    // Replace hardcoded names
    content = content.replace(/>Hodan Ali Farah<\/p>/g, ">{user?.fullName || user?.name || 'HR Manager'}</p>");
    content = content.replace(/>Ahmed Hassan Ali<\/p>/g, ">{user?.fullName || user?.name || 'Super Admin'}</p>");
    content = content.replace(/>Sarah Employee<\/p>/g, ">{user?.fullName || user?.name || 'Employee'}</p>");

    // Replace image
    const API_URL_BASE = "http://localhost:5000";
    const dynamicImg = `src={user?.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : 'http://localhost:5000' + user.profileImage) : 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=00236F&color=fff'}`;
    
    content = content.replace(/src="https:\/\/images\.unsplash\.com[^"]+"/g, dynamicImg);
    content = content.replace(/src="https:\/\/lh3\.googleusercontent\.com[^"]+"/g, dynamicImg);

    // Capitalize name
    content = content.replace(/className="text-sm font-bold text-white truncate font-headline tracking-tight"/g, 'className="text-sm font-bold text-white truncate font-headline tracking-tight capitalize"');

    // Replace hardcoded roles
    content = content.replace(/<p className="text-\[10px\] text-white\/50 font-bold truncate uppercase tracking-widest font-label mt-0\.5">HR Manager<\/p>/g, '<p className="text-[10px] text-white/50 font-bold truncate uppercase tracking-widest font-label mt-0.5">{user?.role === "hr_manager" ? "HR Manager" : user?.role === "admin" ? "Super Admin" : "Employee"}</p>');
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + file);
  }
});

const navbarPath = path.join(srcDir, 'Navbar.jsx');
if (fs.existsSync(navbarPath)) {
  let content = fs.readFileSync(navbarPath, 'utf8');
  content = content.replace(/{user\.firstName} {user\.lastName}/g, '{user?.fullName || user?.name}');
  content = content.replace(/className="block text-xs md:text-sm font-black text-primary font-headline leading-none"/g, 'className="block text-xs md:text-sm font-black text-primary font-headline leading-none capitalize"');
  fs.writeFileSync(navbarPath, content);
  console.log('Fixed Navbar.jsx');
}
