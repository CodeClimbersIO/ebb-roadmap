import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

/**
 * Uploads a profile image from URL to Firebase Storage
 * @param user The Firebase user object
 * @param imageUrl The image URL to upload
 * @returns Promise with the storage URL
 */
export const storeProfileImage = async (user: User, imageUrl: string): Promise<string> => {
  if (!user || !imageUrl) {
    throw new Error('User and image URL are required');
  }

  try {
    // Create a unique filename
    const filename = `profile_${user.uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `profile_images/${filename}`);

    // Fetch the image and convert to Blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Update user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      photoURL: downloadURL
    });

    return downloadURL;
  } catch (error) {
    console.error('Error storing profile image:', error);
    // If there's an error, just return the original URL
    return imageUrl;
  }
};

/**
 * Check if a URL is a Firebase Storage URL
 * @param url The URL to check
 * @returns Boolean indicating if it's a Firebase Storage URL
 */
export const isFirebaseStorageUrl = (url: string | null): boolean => {
  if (!url) return false;
  return url.includes('firebasestorage.googleapis.com');
};

/**
 * Gets the profile image URL, checking if it's already 
 * a Firebase Storage URL or an external URL
 * @param user The Firebase user object or user data with photoURL
 * @returns The appropriate profile image URL
 */
export const getProfileImageUrl = async (
  user: User | { uid: string; photoURL: string | null }
): Promise<string | null> => {
  if (!user) return null;
  
  // If no photoURL, return null
  if (!user.photoURL) return null;
  
  // If already a Firebase Storage URL, return it
  if (isFirebaseStorageUrl(user.photoURL)) {
    return user.photoURL;
  }
  
  // Check Firestore to see if we have a stored version
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().photoURL) {
      const storedUrl = userDoc.data().photoURL;
      if (isFirebaseStorageUrl(storedUrl)) {
        return storedUrl;
      }
    }
    
    // If we get here, we don't have a stored version
    return user.photoURL;
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return user.photoURL; // Fall back to original URL
  }
};

/**
 * Ensures a user's profile image is stored in Firebase Storage
 * @param user The Firebase user object
 * @returns The Firebase Storage URL of the profile image
 */
export const ensureProfileImageStored = async (user: User): Promise<string | null> => {
  if (!user) return null;
  
  try {
    // Check if already stored
    const storedUrl = await getProfileImageUrl(user);
    
    // If no URL or already a Firebase Storage URL, return it
    if (!user.photoURL || isFirebaseStorageUrl(storedUrl)) {
      return storedUrl;
    }
    
    // For now, just use the original URL if Storage isn't properly configured
    return user.photoURL;

    // Commented out until Firebase Storage is properly configured
    // return await storeProfileImage(user, user.photoURL);
  } catch (error) {
    console.error('Error ensuring profile image is stored:', error);
    return user.photoURL; // Fall back to original URL
  }
};

/**
 * Update a user's profile image URL in all relevant comments
 * This is useful for updating existing comments when a user's profile changes
 * @param userId The user's ID
 * @param newPhotoURL The new profile image URL
 */
export const updateUserPhotoUrlInComments = async (userId: string, newPhotoURL: string | null): Promise<void> => {
  // This could be implemented if needed to update historical comments
  // For now, we'll leave this as a placeholder for future implementation
  console.log(`Would update photo URLs for user ${userId} to ${newPhotoURL}`);
}; 