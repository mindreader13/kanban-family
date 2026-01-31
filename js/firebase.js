/**
 * Firebase Configuration & Initialization
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const firebaseConfig = {
    apiKey: "AIzaSyDz-q39YiAtniSIKpJlZBjE-NaMm07vEtg",
    authDomain: "kanban-family.firebaseapp.com",
    projectId: "kanban-family",
    storageBucket: "kanban-family.firebasestorage.app",
    messagingSenderId: "96900774326",
    appId: "1:96900774326:web:7c9d379c64b8d061d1e917"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();