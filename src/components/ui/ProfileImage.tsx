import { useState, useEffect } from 'react';

interface UserLike {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
}

interface ProfileImageProps {
  user: UserLike;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ProfileImage component that handles loading profile images from Firebase Storage
 * This component will attempt to use the stored Firebase image if available,
 * or fall back to the original URL with proper error handling
 */
export default function ProfileImage({ user, size = 'md', className = '' }: ProfileImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Determine size class based on the size prop
  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }[size];

  // Load the profile image
  useEffect(() => {
    let isMounted = true;

    const loadProfileImage = async () => {
      if (!user) return;

      try {
        setError(false);

        // For now, just use the photoURL directly without trying Firebase Storage
        // since we need to configure Firebase Storage properly first
        if (user.photoURL) {
          setImageUrl(user.photoURL);
        } else {
          setImageUrl(null);
        }
      } catch (err) {
        console.error('Error loading profile image:', err);
        if (isMounted) {
          setImageUrl(null);
          setError(true);
        }
      }
    };

    loadProfileImage();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle image loading errors
  const handleImageError = () => {
    console.log('Error loading image:', imageUrl);
    setError(true);

    // If it's a Google profile image, try with a different size parameter
    // Google sometimes blocks specific size requests but allows others
    if (imageUrl && imageUrl.includes('googleusercontent.com')) {
      const newUrl = imageUrl.includes('=s96')
        ? imageUrl.replace('=s96', '=s128')
        : imageUrl.includes('=s128')
          ? imageUrl.replace('=s128', '=s64')
          : null;

      if (newUrl && newUrl !== imageUrl) {
        setImageUrl(newUrl);
        setError(false);
      }
    }
  };

  // Get user initials for fallback
  const getUserInitials = (): string => {
    if (!user?.displayName) return 'U';

    // Get first letter of first and last name if available
    const names = user.displayName.trim().split(/\s+/);
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }

    // Otherwise just the first letter
    return user.displayName.charAt(0).toUpperCase();
  };

  // Show placeholder if no image or if there was an error
  if (!imageUrl || error) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-primary/20 text-primary flex items-center justify-center ${className}`}
      >
        {getUserInitials()}
      </div>
    );
  }

  // Show the image
  return (
    <img
      src={imageUrl}
      alt={user?.displayName || 'User'}
      className={`${sizeClass} rounded-full ${className}`}
      onError={handleImageError}
      referrerPolicy="no-referrer"
    />
  );
} 