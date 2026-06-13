import React from 'react';
import { Plus } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Navbar from '../components/Navbar';
import { MobileMenuProvider, useMobileMenu } from '../context/MobileMenuContext';

const LayoutContent = () => {
  const { isSidebarOpen, closeSidebar } = useMobileMenu();
  const location = useLocation();

  React.useEffect(() => {
    closeSidebar();
    // Forcefully remove any backdrop related body styles
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      
      {/* Mobile/Tablet Backdrop — only visible below lg where sidebar is an overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}

      <main className="flex flex-col min-w-0 h-full overflow-y-auto">
        <Navbar />
        <div className="p-4 md:p-6 lg:p-8 space-y-8 w-full pb-24 lg:pb-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const EmployeeLayout = () => {
  return (
    <MobileMenuProvider>
      <LayoutContent />
    </MobileMenuProvider>
  );
};

export default EmployeeLayout;
