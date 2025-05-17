import React from "react";
import "./PricingPage.css";
import Navbar from "../components/Navbar"; // Import Navbar

const PricingPage = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      storage: "5GB",
      features: ["Basic File Storage", "Limited Uploads", "Standard Security"],
      color: "#007bff",
    },
    {
      name: "Standard",
      price: "$5/month",
      storage: "100GB",
      features: ["Fast Uploads", "Priority Support", "Advanced Security"],
      color: "#28a745",
    },
    {
      name: "Premium",
      price: "$15/month",
      storage: "1TB",
      features: ["Unlimited Uploads", "End-to-End Encryption", "VIP Support"],
      color: "#ff9800",
    },
  ];

  return (
    <div className="pricing-page">
             <Navbar /> {/* Add Navbar */}
             <div className="hero-pricing">
      <h1>Choose the Perfect Plan</h1>
      <p>Upgrade your storage and enjoy premium features.</p>
      
      <div className="pricing-container">
        {plans.map((plan, index) => (
          <div key={index} className="pricing-card" style={{ borderColor: plan.color }}>
            <h2>{plan.name}</h2>
            <h3>{plan.price}</h3>
            <p>{plan.storage} Storage</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button style={{ backgroundColor: plan.color }}>Upgrade Now</button>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default PricingPage;
