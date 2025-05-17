import React from "react";
import { useNavigate } from "react-router-dom";

function EmailVerified() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Email Verified Successfully! 🎉</h2>
      <p>Your email address has been verified. You can now log in to your account.</p>
      <button onClick={() => navigate("/login")}>Go to Login</button>
    </div>
  );
}

export default EmailVerified;
