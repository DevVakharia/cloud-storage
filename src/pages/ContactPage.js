import React, { useState } from "react";
import "./ContactPage.css";
import Navbar from "../components/Navbar"; // Import Navbar

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    
    <div className="contact-page">
        <Navbar /> {/* Add Navbar */}
       <div className="hero-contact"> 
      <h1>Contact Us</h1>
      <p>Have a question or need support? Reach out to us!</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Send Message</button>
      </form>

      <div className="contact-info">
        <h3>Support Email:</h3>
        <p>support@cloudstorage.com</p>
        <h3>Phone:</h3>
        <p>+1 (800) 123-4567</p>
        <h3>Office Address:</h3>
        <p>123 Cloud Street, Tech City, USA</p>
      </div>
    </div>
    </div>
  );
};

export default ContactPage;
