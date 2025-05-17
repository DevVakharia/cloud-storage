import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../pages/logo.png";  // Make sure to import your logo

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="homepage">
    {/* Navbar */}
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} alt="Cloud Storage Logo" className="logo" />
        <h2 className="logo-text">Cloud Storage</h2>
      
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About Us</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li>
          <button onClick={() => navigate('/signup')} className="signup-btn">
            Get Started
          </button>
        </li>
      </ul>
      </div>
    </nav>
</div>
  );
};

export default Navbar;
