import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import "./login.css";
import logo from './logo.png';

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setShowVerificationPopup(true); // Show the verification popup
      } else {
        setIsLoggedIn(true);
        navigate("/dashboard"); // Redirect to dashboard after login
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/email-verified`,
          handleCodeInApp: true,
        });

        setIsResendDisabled(true);
        setTimeout(() => setIsResendDisabled(false), 60000); // Disable button for 60 sec
        alert("Verification email resent. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error resending verification email:", error.message);
      setError("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-section">
          <div className="brand-content">
            <img src={logo} alt="Logo" className="logo-auth" />
            <h2 className="login-title">Welcome Back to Cloud Storage</h2>
            <p className="brand-tagline">
              Secure access to your files and documents
            </p>
          </div>
        </div>

        <div className="form-section">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input
                className="form-input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                className="form-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Login
            </button>

            {error && <div className="error-message">{error}</div>}

            <p className="auth-link">
              Don't have an account?{" "}
              <Link to="/signup">Create account</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationPopup && (
        <>
          <div className="overlay"></div>
          <div className="verification-popup">
            <h3>Email Verification Required</h3>
            <p>Please verify your email to access your account.</p>
            <div className="popup-buttons">
              <button
                onClick={handleResendVerification}
                disabled={isResendDisabled}
                className="resend-btn"
              >
                {isResendDisabled ? "Resend in 60s" : "Resend Email"}
              </button>
              <button 
                onClick={() => setShowVerificationPopup(false)} 
                className="close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
