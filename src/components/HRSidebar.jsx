import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useBranding } from '../context/BrandingContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { 
  UserSquare2, 
  Building2, 
  CalendarCheck2, 
  CalendarClock, 
  UserSearch, 
  Settings,
  Briefcase,
  X,
  Megaphone
} from 'lucide-react';
import { API_URL } from '../utils/api';

import SidebarItem from './ui/SidebarItem';

const navItems = [
  { name: 'Employees', path: '/hr/employees', icon: <UserSquare2 /> },
  { name: 'Departments', path: '/hr/departments', icon: <Building2 /> },
  { name: 'Attendance', path: '/hr/attendance', icon: <CalendarCheck2 /> },
  { name: 'Leave Management', path: '/hr/leave-management', icon: <CalendarClock /> },
  { name: 'Recruitment', path: '/hr/recruitment', icon: <UserSearch /> },
  { name: 'Announcements', path: '/hr/announcements', icon: <Megaphone /> },
  { name: 'Settings', path: '/hr/settings', icon: <Settings /> },
];

const HRSidebar = () => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const { isSidebarOpen, closeSidebar } = useMobileMenu();

  return (
    <aside className={`
      z-[50] h-screen sidebar-gradient text-white flex flex-col overflow-y-auto shadow-2xl
      transition-all duration-300 ease-in-out
      fixed left-0 top-0 w-72 p-7 items-stretch
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:sticky lg:top-0 lg:translate-x-0 lg:w-[72px] lg:p-3 lg:items-center lg:rounded-r-2xl
      xl:w-72 xl:p-7 xl:items-stretch xl:rounded-r-2xl
    `}>

      {/* Header: Logo + Title */}
      <div className="flex items-center justify-between mb-10 lg:mb-6 xl:mb-12 w-full">
        <div className="flex items-center gap-4 lg:gap-0 xl:gap-4 min-w-0">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 overflow-hidden shrink-0">
            {branding.logo ? (
              <img 
                src={branding.logo.startsWith('http') ? branding.logo : `${API_URL.replace('/api', '')}${branding.logo}`} 
                alt="Logo" 
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <Briefcase size={22} className="text-white stroke-[2.5]" />
            )}
          </div>
          <div className="block lg:hidden xl:block min-w-0">
            <div className="text-xl font-bold tracking-tight text-white leading-none font-headline truncate">HR System</div>
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-black mt-1 font-label">HR Panel</div>
          </div>
        </div>
        <button onClick={closeSidebar} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1 w-full">
        {navItems.map((item) => (
          <SidebarItem key={item.name} item={item} onClick={closeSidebar} />
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 w-full lg:pt-4 xl:pt-8">
        <div className="flex items-center gap-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group
                        lg:justify-center lg:p-1 lg:gap-0
                        xl:justify-start xl:p-2 xl:gap-4">
          <div className="relative shrink-0">
            <img
              className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-white transition-colors object-cover"
              alt="HR Manager"
              src={user?.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : 'http://localhost:5000' + user.profileImage) : 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=00236F&color=fff'}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1e3a8a] rounded-full"></div>
          </div>
          {/* Text: hidden on tablet */}
          <div className="overflow-hidden block lg:hidden xl:block">
            <p className="text-sm font-bold text-white truncate font-headline tracking-tight capitalize">{user?.fullName || user?.name || 'HR Manager'}</p>
            <p className="text-[10px] text-white/50 font-bold truncate uppercase tracking-widest font-label mt-0.5">{user?.role === "hr_manager" ? "HR Manager" : user?.role === "admin" ? "Super Admin" : "Employee"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default HRSidebar;
