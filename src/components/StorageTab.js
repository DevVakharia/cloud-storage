import React, { useEffect, useState } from "react";
import { doc, getDoc,getDocs,collection, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "../firebase"; // Ensure correct Firebase imports
import "./StorageTab.css"; // Add custom styling here

const StorageTab = () => {
  const [usedStorage, setUsedStorage] = useState(0); // Storage used (in bytes)
  const [totalStorage, setTotalStorage] = useState(200 * 1024 * 1024); // Default: 200MB
  const [userId, setUserId] = useState(null);
  const [newStorageSize, setNewStorageSize] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(""); // Selected user ID
  const [users, setUsers] = useState([]); // List of all users for the admin to select
  const [upgradeMessage, setUpgradeMessage] = useState(""); // Store success or error message
  const [userName, setUserName] = useState(""); // Store the user's name

  // Fetch user storage data from Firestore
  const fetchStorageData = async () => {
    try {
      if (!userId) throw new Error("User ID is undefined!");

      const userDocRef = doc(db, "users", userId); // Use correct userId
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsedStorage(userData.usedStorage || 0); // Fallback to 0 if undefined
        setTotalStorage(userData.totalStorage || 200 * 1024 * 1024); // Fallback to 200MB
        setIsAdmin(userData.isAdmin || false); // Check if the user is an admin
        setUserName(userData.name || "User"); // Store the user's name, default to "User"
      } else {
        console.error("No user document found for the given ID.");
      }
    } catch (error) {
      console.error("Error fetching storage data:", error.message);
    }
  };
   // Fetch the list of users (for admin to select)
   const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs
        .filter((doc) => !doc.data().isAdmin) // Exclude admins
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unknown User", // You can adjust this based on your data
        }));

        console.log("Fetched users:", usersList); // Debugging line
        setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  // Update storage plan for the selected user (admin only)
  const increaseStoragePlan = async () => {
    if (!newStorageSize || newStorageSize <= 0 || !selectedUserId) {
      alert("Please select a user and enter a valid storage size.");
      return;
    }
  
    try {
      // Fetch the selected user's document to get their name
      const selectedUserDocRef = doc(db, "users", selectedUserId); // Reference the selected user
      const selectedUserDoc = await getDoc(selectedUserDocRef);
  
      if (selectedUserDoc.exists()) {
        const selectedUserData = selectedUserDoc.data();
        const selectedUserName = selectedUserData.name || "User"; // Get the selected user's name
  
        // Update the storage size
        const newStorageBytes = parseInt(newStorageSize) * 1024 * 1024; // Convert MB to bytes
        await updateDoc(selectedUserDocRef, {
          totalStorage: newStorageBytes,
        });
  
        console.log(`Storage plan updated for ${selectedUserId} to ${newStorageSize} MB`);
  
        // Set the confirmation message with the selected user's name
        setUpgradeMessage(`${selectedUserName}'s storage upgraded to ${newStorageSize} MB`);
      } else {
        console.error("Selected user not found.");
        setUpgradeMessage("Error: Selected user not found.");
      }
  
      fetchStorageData(); // Refresh storage data
    } catch (error) {
      console.error("Error updating storage plan:", error.message);
      setUpgradeMessage("Error upgrading storage. Please try again.");
    }
  };
  // Calculate percentage of storage used
  const getStoragePercentage = () => {
    return totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;
  };

  // Fetch current user and storage data on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Ensure the userId is set
      } else {
        console.error("User is not logged in.");
      }
    });
  
    return () => unsubscribe();
  }, []);

  // Fetch storage data after userId is set
  useEffect(() => {
    if (userId) {
      fetchStorageData();
      fetchUsers(); // Ensure users are fetched after userId is set
    }
  }, [userId]);

  return (
    <div className="storage-tab">
      <h1>Storage Details</h1>

      <div className="storage-bar-container">
        <div className="storage-bar">
          <div
            className="used-storage-bar"
            style={{ width: `${getStoragePercentage()}%` }}
          ></div>
        </div>
        <p>
          Used: {(usedStorage / (1024 * 1024)).toFixed(2)} MB /{" "}
          {(totalStorage / (1024 * 1024)).toFixed(2)} MB
        </p>
      </div>

      {isAdmin && (
          <div className="admin-controls">
          <label htmlFor="userSelect">Select User to Upgrade Storage:</label>
          <select
            id="userSelect"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}>
          
            <option value="">--Select a User--</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        
          <label htmlFor="newStorageSize">Set New Storage Plan (in MB):</label>
          <input
            type="number"
            id="newStorageSize"
            min="200"
            placeholder="Enter storage size (e.g., 500 MB)"
            value={newStorageSize}
            onChange={(e) => setNewStorageSize(e.target.value)}
          />
          <button
            onClick={increaseStoragePlan}
            className="upgrade-btn"
          >
            Update Storage Plan
          </button>
        </div>
      )}
     {upgradeMessage && (
      <div className="upgrade-message">
        <p>{upgradeMessage}</p>
      </div>
    )}
      <div className="upgrade-section">
        {usedStorage >= totalStorage ? (
          <p className="upgrade-message">
            <strong>Storage limit exceeded!</strong> Upgrade your plan to
            increase storage.
          </p>
        ) : (
          <p>You are within your storage limit.</p>
        )}
      </div>
    </div>
  );
};

export default StorageTab;
