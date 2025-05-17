import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import './ProfilePage.css'; // Ensure your profile page styles are applied
import tick from './tick.png';
function ProfilePage() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    occupation: '',
    age: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('');

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
  
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('✅ User Authenticated:', user.uid);
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
  
            if (userDoc.exists()) {
              console.log('✅ Fetched User Data:', userDoc.data());
              setUserData({
                name: userDoc.data().name || '',
                email: userDoc.data().email || user.email,
                occupation: userDoc.data().occupation || '',
                age: userDoc.data().age || '',
              });
            } else {
              console.error('❌ No such document!');
            }
          } catch (error) {
            console.error('❌ Error fetching document:', error);
          }
        } else {
          console.warn('⚠️ No user is signed in.');
        }
        setLoading(false);
      });
  
      // Cleanup listener on component unmount
      return unsubscribe;
    };
  
    fetchUserDetails();
  }, [auth, db]);
  

  const handleSave = async () => {
    setLoading(true);
    try {
        const user = auth.currentUser;
        const userDocRef = doc(db, 'users', user.uid);

        await updateDoc(userDocRef, {
            name: userData.name,
            occupation: userData.occupation,
            age: userData.age,
            email: userData.email,
        });

        await updateProfile(user, {
            displayName: userData.name,
        });

        setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        setUpdateStatus({ type: 'error', message: 'Failed to update profile.' });
    }
    setIsEditing(false);
    setLoading(false);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

 
  if (loading) return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </div>
    </div>
  );

  return (
      <div className="pp-container">
          {/* Premium Background Elements */}
          <div className="pp-background-elements">
              <div className="pp-geo-shape" style={{
                  width: '150px',
                  top: '10%',
                  left: '5%',
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50 50 100 0 50 50 0' fill='%230073e6'/%3E%3C/svg%3E")`
              }}></div>
              
              <div className="pp-connection-line" style={{
                  top: '30%',
                  width: '120%',
                  animationDelay: '3s'
              }}></div>
              
              <div className="pp-geo-shape" style={{
                  width: '80px',
                  bottom: '15%',
                  right: '5%',
                  animationDelay: '8s',
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='45' fill='%230059b3'/%3E%3C/svg%3E")`
              }}></div>
          </div>
  
          <div className="pp-card">
              <div className="pp-header">
                  <h1 className="pp-title">Profile Settings</h1>
                  {updateStatus && (
                      <div className={`pp-status ${updateStatus.includes('✅') ? 'pp-status-success' : 'pp-status-error'}`}>
                          {updateStatus}
                      </div>
                  )}
              </div>
  
              <form className="pp-form">
                <div className="pp-form-group">
                    <input
                        type="text"
                        className="pp-input"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder=" "
                    />
                    <label className="pp-label">Full Name</label>
                </div>

                <div className="pp-form-group">
                    <input
                        type="email"
                        className="pp-input"
                        value={userData.email}
                        disabled
                        placeholder=" "
                    />
                    <label className="pp-label">Email Address</label>
                </div>

                <div className="pp-form-group">
                    <input
                        type="text"
                        className="pp-input"
                        name="occupation"
                        value={userData.occupation}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder=" "
                    />
                    <label className="pp-label">Occupation</label>
                </div>

                <div className="pp-form-group">
                    <input
                        type="number"
                        className="pp-input"
                        name="age"
                        value={userData.age}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder=" "
                    />
                    <label className="pp-label">Age</label>
                </div>

                <div className="pp-button-group">
                    {!isEditing ? (
                        <button
                            type="button"
                            className="pp-button pp-button-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="pp-button pp-button-primary"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                className="pp-button pp-button-secondary"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    </div>
);
}

export default ProfilePage;

