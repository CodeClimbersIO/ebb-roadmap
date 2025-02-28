# Setting Up Firebase Storage

This document provides instructions for setting up Firebase Storage for the Ebb Product Board application to properly handle profile images.

## 1. Enable Firebase Storage in the Console

First, you need to enable Firebase Storage for your project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "ebb-roadmap"
3. In the left navigation, click on "Storage"
4. Click the "Get Started" button
5. Choose your storage location (usually the default is fine)
6. Accept the default security rules for now (we'll customize them later)

## 2. Deploy Storage Security Rules

After enabling Firebase Storage in the console, deploy the security rules:

```bash
# First make sure you're logged in to Firebase
firebase login

# Deploy the storage rules
firebase deploy --only storage
```

## 3. Configure CORS for Firebase Storage

To enable cross-origin requests to your Firebase Storage bucket:

1. Find your bucket name. It should be in the format: `gs://ebb-roadmap.appspot.com`
   (You can see this in the Firebase Console under Storage)

2. Create a CORS configuration file (cors.json):

```json
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000", "https://ebb-roadmap.web.app"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
  }
]
```

3. Apply the CORS configuration (replace `YOUR_BUCKET_NAME` with your actual bucket name):

```bash
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

## 4. Uncomment the Storage Code

After setting up Firebase Storage properly, you'll need to restore the original functionality:

1. In `src/services/profileService.ts`, uncomment the line:
   ```typescript
   // return await storeProfileImage(user, user.photoURL);
   ```
   And remove the line:
   ```typescript
   return user.photoURL;
   ```

2. In `src/components/ui/ProfileImage.tsx`, restore the Firebase Storage URL checking:
   ```typescript
   // First check if we can directly use the photoURL (if it's a Firebase Storage URL)
   if (user.photoURL && isFirebaseStorageUrl(user.photoURL)) {
     setImageUrl(user.photoURL);
     return;
   }
   ```

## 5. Test Profile Image Storage

Once everything is set up:

1. Sign out and sign back in to trigger profile image storage
2. Check the Firebase Storage console to verify images are being uploaded
3. Inspect network requests to ensure CORS is properly configured

## Storage Security Rules

For reference, these are the security rules we're using:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images can be uploaded by authenticated users and read by anyone
    match /profile_images/{userId}/{fileName} {
      // Only allow uploads if the user is authenticated and the file is for their own profile
      allow write: if request.auth != null && 
                   request.auth.uid == userId;
      
      // Anyone can read profile images
      allow read: if true;
    }
    
    // Default deny rule
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
``` 