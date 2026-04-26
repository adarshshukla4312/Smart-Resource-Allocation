/**
 * AuthContext — manages Firebase Auth state and user profile.
 * Replaces the mock auth system with real Firebase Auth.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth, db, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  doc, getDoc, onSnapshot
} from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Listen to user profile in real-time
        const unsub = onSnapshot(doc(db, 'users', firebaseUser.uid), async (snap) => {
          if (snap.exists()) {
            setUserProfile({ uid: snap.id, ...snap.data() });
          } else {
            // Profile does not exist (likely backend was offline during registration)
            // Self-heal by creating a default profile so the user doesn't get stuck
            const { setDoc } = await import('../firebase');
            const newProfile = {
               displayName: firebaseUser.email?.split('@')[0] || 'User',
               role: 'NGO_EMPLOYEE', // Default role so they can access the platform
               createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setUserProfile({ uid: firebaseUser.uid, ...newProfile });
          }
          setLoading(false);
        });
        return () => unsub();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profileDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (profileDoc.exists()) {
        setUserProfile({ uid: profileDoc.id, ...profileDoc.data() });
      }
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
