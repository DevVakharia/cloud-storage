import React from "react";
import "./AboutUs.css";
import { useNavigate } from "react-router-dom";
import { FaCloud, FaLock, FaRocket, FaUsers, FaFolder, FaEye } from "react-icons/fa";
import Navbar from "../components/Navbar"; // Import Navbar


function AboutUs  () {
    const navigate = useNavigate();
  return (
    <div className="about-us">
             <Navbar /> {/* Add Navbar */}
      {/* Hero Section */}
      <section className="hero-section">
        <h1>Secure & Reliable Cloud Storage</h1>
        <p>Store, manage, and access your files anytime, anywhere with ease.</p>
        <button onClick={() => navigate('/signup')} className="cta-button">Get Started</button>
      </section>

      {/* Our Mission */}
      <section className="mission-section">
        <h2>Our Mission</h2>
        <p>
          Our mission is to provide a seamless, secure, and scalable cloud storage solution that
          empowers individuals and businesses to store, manage, and share their digital assets effortlessly.
        </p>
      </section>

      {/* Key Features */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {[
            { icon: <FaLock />, title: "Enterprise-Level Security", desc: "Your data is encrypted and safe." },
            { icon: <FaRocket />, title: "Blazing Fast Performance", desc: "Access your files instantly from anywhere." },
            { icon: <FaUsers />, title: "Multi-User Access", desc: "Seamlessly collaborate with your team." },
            { icon: <FaFolder />, title: "Organized Folder System", desc: "Upload, preview, and organize folders easily." },
            { icon: <FaCloud />, title: "Unlimited Cloud Storage", desc: "Upgrade your plan as per your needs." },
            { icon: <FaEye />, title: "Advanced File Previews", desc: "Preview PDFs, images, videos, and more." },
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="cta-section">
        <h2>Join Thousands of Happy Users Today!</h2>
        <button className="cta-button">Start Your Free Plan</button>
      </section>
    </div>
  );
};


export default AboutUs;
