import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, collection, doc, deleteDoc, getDoc, getDocs, addDoc, updateDoc, setDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment,
  arrayUnion, enableIndexedDbPersistence
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "PLACEHOLDER",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "PLACEHOLDER",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "team-ro-ko-hackathon-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "PLACEHOLDER",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "PLACEHOLDER",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "PLACEHOLDER",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Firebase persistence failed: multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.warn('Firebase persistence not supported by current browser');
  }
});

const storage = getStorage(app);

export {
  app, auth, db, storage,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
  collection, doc, deleteDoc, getDoc, getDocs, addDoc, updateDoc, setDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, increment, arrayUnion,
  ref, uploadBytesResumable, getDownloadURL,
};
