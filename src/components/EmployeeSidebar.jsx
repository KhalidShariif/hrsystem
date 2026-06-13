import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  CalendarCheck, 
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useMobileMenu } from '../context/MobileMenuContext';

import SidebarItem from './ui/SidebarItem';

const menuItems = [
  { name: 'Dashboard', path: '/employee/dashboard', icon: <LayoutDashboard /> },
  { name: 'My Profile', path: '/employee/profile', icon: <User /> },
  { name: 'Attendance', path: '/employee/attendance', icon: <CalendarCheck /> },
  { name: 'Announcements', path: '/employee/events', icon: <Megaphone /> },
  { name: 'Settings', path: '/employee/settings', icon: <Settings /> },
];

const EmployeeSidebar = () => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const { isSidebarOpen, closeSidebar } = useMobileMenu();
  const { logout } = useAuth();
  
  const API_URL = 'http://localhost:5000/api';

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
              <span className="text-xl font-bold text-white">H</span>
            )}
          </div>
          <div className="block lg:hidden xl:block min-w-0">
            <h1 className="text-xl font-bold tracking-tight leading-none truncate">{branding.name || 'Hayaan HR'}</h1>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mt-1 truncate">Employee Portal</p>
          </div>
        </div>
        <button onClick={closeSidebar} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 w-full">
        {menuItems.map((item) => (
          <SidebarItem key={item.path} item={item} onClick={closeSidebar} />
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="pt-8 border-t border-white/10 mt-auto w-full">
        <button 
          onClick={logout}
          className="flex items-center gap-4 px-4 py-4 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-200 transition-all duration-300 w-full group lg:px-0 lg:justify-center xl:px-4 xl:justify-start"
        >
          <LogOut size={20} className="stroke-[2.5] group-hover:rotate-12 transition-transform" />
          <span className="font-headline font-bold text-sm tracking-tight lg:hidden xl:block truncate">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
