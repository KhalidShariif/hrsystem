import React from 'react';
import { Plus } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { MobileMenuProvider, useMobileMenu } from '../context/MobileMenuContext';

const LayoutContent = () => {
  const { isSidebarOpen, closeSidebar } = useMobileMenu();
  const location = useLocation();

  // Global reset on route change to prevent stuck modals/overlays
  React.useEffect(() => {
    closeSidebar();
    // Forcefully remove any backdrop related body styles
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar />
      
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
      
      {/* Mobile Action Button */}
      <div className="fixed bottom-8 right-8 lg:hidden z-40">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 ring-4 ring-white">
          <Plus size={24} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

const MainLayout = () => {
  return (
    <MobileMenuProvider>
      <LayoutContent />
    </MobileMenuProvider>
  );
};

export default MainLayout;
