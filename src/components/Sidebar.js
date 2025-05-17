import React, { useState, useContext } from 'react';

import { FaUser, FaCog, FaDatabase, FaSignOutAlt, FaBars } from 'react-icons/fa';
import './Sidebar.css'; // Import Sidebar styles
import { Link, useNavigate } from 'react-router-dom';

import { Outlet } from 'react-router-dom';

function Sidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Initially set to true if the user is logged in
 
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
  const confirmation = window.confirm("Are you sure you want to logout?");
  if (confirmation) {
    onLogout(); // Call logout after confirmation
    setIsLoggedIn(false); // Update state to reflect that the user is logged out
    navigate('/login');
  } else {
    alert("Logout canceled!");
    setIsLoggedIn(true); // Ensure the user stays logged in
  }
};


  return (
    
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>{isOpen && <Link to="/dashboard"className="link-style">Dashboard</Link>}</h3>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/profile"className="link-style">
              <FaUser />
              {isOpen && <span>Profile</span>}
            </Link>
          </li>
          <li>
          <Link to="/setting"className="link-style">
            <FaCog />
            {isOpen && <span>Settings</span>}
          </Link>
          </li>
          <li>
          <Link to="/Storage"className="link-style">
            <FaDatabase />
            {isOpen && <span>Storage</span>}
            </Link>
          </li>
          <li onClick={handleLogout}className="link-style">
            <FaSignOutAlt />
            {isOpen && <span>Logout</span>}
          </li>
        </ul>
   
      </div>
      
    
  );
}

export default Sidebar;
