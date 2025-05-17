import React, { useState, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import "./Layout.css";

// Create Context for Sidebar state
export const SidebarContext = createContext();

function Layout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Track sidebar state

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className="layout-container">
        {/* Sidebar (Remains Constant) */}
        <Sidebar onLogout={onLogout} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main Content Adjusts Dynamically */}
        <div className="layout-content">
          <Outlet /> {/* Dashboard & other pages will receive sidebar state */}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export default Layout;
