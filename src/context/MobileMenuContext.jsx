import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MobileMenuContext = createContext();

export const MobileMenuProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <MobileMenuContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </MobileMenuContext.Provider>
  );
};

export const useMobileMenu = () => useContext(MobileMenuContext);
