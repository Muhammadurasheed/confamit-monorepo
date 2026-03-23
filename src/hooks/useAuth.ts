import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user && db) {
        // Fetch or create user profile in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        
        // Initial state from localStorage to prevent balance flashes
        const cachedProfile = localStorage.getItem(`profile_${user.uid}`);
        if (cachedProfile) {
          try {
            setProfile(JSON.parse(cachedProfile));
          } catch (e) {
            console.error('Failed to parse cached profile:', e);
          }
        }
        
        // Use onSnapshot for real-time credit updates
        const unsubProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProfile(data);
            localStorage.setItem(`profile_${user.uid}`, JSON.stringify(data));
          } else {
            // Initialize profile if it doesn't exist
            const newProfile = {
              uid: user.uid,
              email: user.email,
              credits: 0,
              created_at: new Date().toISOString(),
            };
            setDoc(userDocRef, newProfile).then(() => {
              setProfile(newProfile);
              localStorage.setItem(`profile_${user.uid}`, JSON.stringify(newProfile));
            });
          }
        });
        
        setLoading(false);
        return () => {
          unsubProfile();
          unsubscribe();
        };
      }
      
      setProfile(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured) {
      toast.error('Authentication is not configured. Please contact support.');
      return { user: null, error: new Error('Firebase not configured') };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured) {
      toast.error('Authentication is not configured. Please contact support.');
      return { user: null, error: new Error('Firebase not configured') };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      return { user: null, error };
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      toast.error('Google sign-in is not configured. Please contact support.');
      return { user: null, error: new Error('Firebase not configured') };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success('Signed in with Google successfully!');
      return { user: result.user, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
      return { user: null, error };
    }
  };

  const signOut = async () => {
    if (!auth || !isFirebaseConfigured) {
      toast.error('Authentication is not configured.');
      return;
    }

    try {
      if (user) {
        localStorage.removeItem(`profile_${user.uid}`);
      }
      await firebaseSignOut(auth);
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return {
    user,
    profile,
    credits: profile?.credits || 0,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isConfigured: isFirebaseConfigured,
  };
};
