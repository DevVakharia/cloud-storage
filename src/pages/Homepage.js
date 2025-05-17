// Homepage.js - Updated Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import logo from './logo.png';
import { FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';

function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <img src={logo} alt="Cloud Storage Logo" className="logo" />
          <h2 className="logo-text">Cloud Storage</h2>
        
        <ul className="nav-links">
          <li><a href="/Homepage">Home</a></li>
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

      {/* Hero Section */}
      <header className="hero">
       <div > <h1 className='heading'>Secure Cloud Storage for the Modern Era</h1></div>
        <p>
          Protect your data with military-grade encryption while enjoying seamless access
          across all your devices. Start with 15GB free storage.
        </p>
        <div className="hero-buttons">
          <button onClick={() => navigate('/login')} className="primary-btn">
            Sign In
          </button>
          <button onClick={() => navigate('/signup')} className="secondary-btn">
            Free Trial
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Enterprise-Grade Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Advanced Security</h3>
            <p>
              AES-256 encryption with zero-knowledge protocol ensures your data remains
              private, even from us.
            </p>
          </div>
          <div className="feature-card">
            <h3>Global CDN</h3>
            <p>
              Lightning-fast file access worldwide through our content delivery network
              with 99.99% uptime.
            </p>
          </div>
          <div className="feature-card">
            <h3>Smart Sync</h3>
            <p>
              Automatic synchronization across all devices with real-time collaboration
              features.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CloudStorage</h4>
            <p>Secure. Reliable. Future-proof.</p>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><a href="/about">About Us</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/press">Press</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/security">Security Overview</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="https://twitter.com"><FiTwitter /></a>
              <a href="https://linkedin.com"><FiLinkedin /></a>
              <a href="https://github.com"><FiGithub /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 CloudStorage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;