import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword} from 'firebase/auth';
import { getStorage,ref, uploadBytes, uploadBytesResumable,getDownloadURL} from "firebase/storage";
import { getFirestore } from "firebase/firestore";  // Correct Firestore import

const firebaseConfig = {
    apiKey: "AIzaSyAtJ17yrAYzjo6qnpM1Wqh3dT5_UA5U3cA",
    authDomain: "cloudstorage-6bfb0.firebaseapp.com",
    projectId: "cloudstorage-6bfb0",
    storageBucket: "cloudstorage-6bfb0.firebasestorage.app",
    messagingSenderId: "678428635314",
    appId: "1:678428635314:web:069e9f8dca0ce84f9059ab",
    measurementId: "G-NDTJGPJN84"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
export const db = getFirestore(app); // Firestore export
export {auth, storage,ref, uploadBytes, uploadBytesResumable,getDownloadURL,signInWithEmailAndPassword, createUserWithEmailAndPassword};
