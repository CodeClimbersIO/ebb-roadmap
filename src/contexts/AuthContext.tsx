import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ensureProfileImageStored } from '../services/profileService';

// Define user roles
export type UserRole = 'viewer' | 'editor' | 'admin';

// Extended user type with role
export interface ExtendedUser extends User {
  role?: UserRole;
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function getUserRole(user: User): Promise<UserRole | undefined> {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      // Attempt to store the profile image in Firebase Storage if it's from Google
      let storedPhotoURL = user.photoURL;
      try {
        storedPhotoURL = await ensureProfileImageStored(user);
      } catch (error) {
        console.error("Error ensuring profile image is stored:", error);
        // Continue with original URL if there's an error
      }

      if (userDoc.exists()) {
        // Update the stored photoURL if it's changed and different from the existing one
        if (storedPhotoURL &&
          storedPhotoURL !== userDoc.data().photoURL &&
          storedPhotoURL !== user.photoURL) {
          await updateDoc(doc(db, 'users', user.uid), {
            photoURL: storedPhotoURL
          });
        }
        return userDoc.data().role as UserRole;
      }

      // If this is first login, create the user document with default role
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: storedPhotoURL, // Use the stored image URL or the original URL
        role: 'viewer', // Default role for new users
        createdAt: new Date()
      });

      return 'viewer'; // Default role if not specified
    } catch (error) {
      console.error("Error getting user role:", error);
      return 'viewer'; // Default role on error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user);
        setCurrentUser({ ...user, role });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  const value = {
    currentUser,
    signInWithGoogle,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 