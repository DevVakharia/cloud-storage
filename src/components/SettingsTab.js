import React, { useEffect, useState } from "react";
import { getAuth, updateEmail, updatePassword, onAuthStateChanged, reauthenticateWithCredential, verifyBeforeUpdateEmail,EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import "./SettingsTab.css";
import {  sendEmailVerification } from "firebase/auth";
const SettingsTab = () => {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Required for reauthentication
  const [updateStatus, setUpdateStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Status message
  const [theme, setTheme] = useState("light"); // Light mode as default
  const [isEmailButtonDisabled, setIsEmailButtonDisabled] = useState(false);
  const [defaultView, setDefaultView] = useState("grid")
  const [activityLog, setActivityLog] = useState([
    { id: 1, activity: "Logged in", date: "2025-01-10" },
    { id: 2, activity: "Uploaded a file", date: "2025-01-09" },
  ]); // Example activity log
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.warn("⚠️ No user is signed in.");
          return;
        }
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            console.error("❌ No user document found!");
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      });
    };
    fetchUserDetails();
  }, [auth, db]);

  useEffect(() => {
    let timer;
    if (isEmailButtonDisabled) {
      timer = setTimeout(() => setIsEmailButtonDisabled(false), 30000); // 30 seconds
    }
    return () => clearTimeout(timer); // Cleanup on unmount
  }, [isEmailButtonDisabled]);

  const updateEmailHandler = async () => {
    if (!newEmail || !currentPassword) {
      alert("❌ Please provide both the new email and current password.");
      return;
    }
  
    try {
      const user = auth.currentUser;
  
      if (user) {
        // Reauthenticate the user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
  
        // Update the email
        await updateEmail(user, newEmail);
  
        // Optionally send a verification email to the new email address
        await sendEmailVerification(user);
  
        alert("✅ Email updated successfully. A verification email has been sent to the new address.");
      } else {
        alert("❌ No user is currently logged in.");
      }
    } catch (error) {
      console.error("❌ Error updating email:", error.message);
      alert(`❌ Error updating email: ${error.message}`);
    }
  };
 // Handle Email Update
 const handleEmailUpdate = async () => {
  if (!newEmail || !currentPassword) {
    setMessage("❌ Please provide both the new email and current password.");
    return;
  }

  try {
    const user = auth.currentUser;
    if (user) {
      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      setMessage("✅ User successfully reauthenticated.");

      // Send verification email
      await verifyBeforeUpdateEmail(user, newEmail);
      setMessage(
        `✅ A verification email has been sent to ${newEmail}. Please check your inbox and verify to complete the update.`
      );

      // Update email in Firestore database
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { email: newEmail });

      // Disable email button for 30 seconds
      setIsEmailButtonDisabled(true);
    } else {
      setMessage("❌ No user is currently logged in.");
    }
  } catch (error) {
    console.error("❌ Error during email update:", error.message);
    switch (error.code) {
      case "auth/wrong-password":
        setMessage("❌ Incorrect current password. Please try again.");
        break;
      case "auth/email-already-in-use":
        setMessage("❌ The new email is already in use. Please choose another.");
        break;
      case "auth/operation-not-allowed":
        setMessage("❌ Email updates are not allowed. Check Firebase settings.");
        break;
      case "auth/invalid-credential":
        setMessage("❌ Invalid credentials. Please try reauthenticating.");
        break;
      default:
        setMessage(`❌ Error updating email: ${error.message}`);
    }
  }
};
  // Handle Password Update
  const handlePasswordUpdate = async () => {
    if (!newPassword || !currentPassword) {
      setMessage("❌ Please provide both the new password and current password.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        // Reauthenticate the user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        setMessage("✅ User successfully reauthenticated.");

        // Update password
        await updatePassword(user, newPassword);
        setMessage("✅ Password updated successfully.");
        setNewPassword("");
        setCurrentPassword("");
      } else {
        setMessage("❌ No user is currently logged in.");
      }
    } catch (error) {
      console.error("❌ Error updating password:", error.message);
      switch (error.code) {
        case "auth/wrong-password":
          setMessage("❌ Incorrect current password. Please try again.");
          break;
        case "auth/weak-password":
          setMessage("❌ Password is too weak. Please use a stronger password.");
          break;
        default:
          setMessage(`❌ Error updating password: ${error.message}`);
      }
    }
  };

  // Handle theme change
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.className = newTheme; // Apply theme to the document
  };

  // Handle account deletion
  const deleteAccount = async () => {
    try {
      if (window.confirm("Are you sure you want to delete your account?")) {
        const user = auth.currentUser;
        if (user) {
          await deleteDoc(doc(db, "users", user.uid)); // Remove user from Firestore
          await user.delete(); // Delete user authentication
          alert("Account deleted successfully.");
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error.message);
    }
  };


  return (
    <div className="settings-tab">
      <h1>Settings</h1>
      {message && <p>{message}</p>}
      {/* Account Management Section */}
      <div className="section">
        <h2>Account Management</h2>
        <p>Note: Verification mail will be sent to this email.</p>
        <div className="field">
          <label>Change Email:</label>
          <input
            type="email"
            placeholder="Enter new email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
               <button onClick={handleEmailUpdate} disabled={isEmailButtonDisabled}>
          {isEmailButtonDisabled ? "Wait 30 seconds" : "Update Email"}
        </button>
          </div>
    
        <div className="field">
          <label>Change Password:</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button onClick={handlePasswordUpdate}>Update Password</button>
          </div>
        <button className="delete-btn" onClick={deleteAccount}>
          Delete Account
        </button>
      </div>

      {/* Application Preferences Section */}
      <div className="section">
        <h2>Application Preferences</h2>
        <div className="field">
          <label>Theme:</label>
          <button onClick={toggleTheme}>
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </button>
        </div>
        
        <div className="field">
          <label>Default View:</label>
          <select
            value={defaultView}
            onChange={(e) => setDefaultView(e.target.value)}
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
        </div>
      </div>

    

      {/* Security Section */}
      <div className="section">
        <h2>Security</h2>
        <div className="field">
          <label>Activity Log:</label>
          <ul>
            {activityLog.map((log) => (
              <li key={log.id}>
                {log.activity} - {log.date}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Support Section */}
      <div className="section">
        <h2>Support</h2>
        <div className="field">
          <label>Contact Support:</label>
          <p>Email: support@cloudstorage.com</p>
        </div>
        <div className="field">
          <label>FAQs:</label>
          <p>
            Visit our <a href="/faq">FAQ page</a> for answers to common
            questions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
