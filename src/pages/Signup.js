// Signup.js (updated)
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import logo from './logo.png'; // Your logo file
import './Signup.css';

function Signup() {
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [age, setAge] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevents multiple clicks
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, id, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user, {
        url: `${window.location.origin}/email-verified`,
      });

      await updateProfile(user, { displayName: name });

      // Save user info to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { name, occupation, age, email: user.email, uid: user.uid });

      // Sign out immediately to prevent unverified access
      await signOut(auth);

      setSignupSuccess(true);
      setIsEmailSent(true);
      setResendCooldown(45);
      setErrorMessage("");
    } catch (error) {
      console.error("Error during signup:", error.message);
      setSignupSuccess(false);
      setIsEmailSent(false);

      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email is already in use. Please use a different email.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsSubmitting(false); // Re-enable button after process
    }
  };

  const handleResendEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/email-verified`,
        });
        setResendCooldown(45);
        setErrorMessage("");
        setSignupSuccess(true);
      }
    } catch (error) {
      setErrorMessage("Failed to resend verification email: " + error.message);
    }
  };

  return (
    <div className="signup-container">
  <div className="signup-card">
        <div className="brand-section">
          <div className="brand-content">
            <img src={logo}alt="Logo" className="logo-auth" />
            <h2 className="signup-title">Create Your Cloud Storage Account</h2>
            <p className="brand-tagline">
              Join millions who trust us with their data. 
              Start with 15GB free storage.
            </p>
          </div>
        </div>
        <div className="form-section">
        <form className="signup-form" onSubmit={handleSignup}>
          <div className="form-group">
            <input
              className="form-input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="text"
              placeholder="Occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="email"
              placeholder="Email Address"
              value={id}
              onChange={(e) => setId(e.target.value)}
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

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Get Started"}
          </button>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {signupSuccess && (
            <div className="success-messages">
              <p>Verification email sent! Please check your inbox.</p>
              <button
                className="resend-btn"
                type="button" 
                onClick={handleResendEmail}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : "Resend Email"}
              </button>
            </div>
          )}

<p className="auth-links">
            Already have an account?{" "}
            <Link to="/login">Sign in here</Link>
          </p>
        </form>
      </div>
      </div>
    </div>
  );
}

export default Signup;