import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, writeBatch, getDocs, getCountFromServer, serverTimestamp, where } from 'firebase/firestore';
import { Comment } from '../types/Comment';
import { User } from 'firebase/auth';

// Create a new comment
export const createComment = async (
  noteId: string, 
  content: string, 
  currentUser: User, 
  isPinned: boolean = false
): Promise<void> => {
  const commentRef = collection(db, 'notes', noteId, 'comments');
  
  await addDoc(commentRef, {
    noteId,
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonymous',
      photoURL: currentUser.photoURL || null,
    },
    isPinned
  });
};

// Update a comment
export const updateComment = async (
  noteId: string, 
  commentId: string, 
  content: string
): Promise<void> => {
  const commentRef = doc(db, 'notes', noteId, 'comments', commentId);
  await updateDoc(commentRef, {
    content,
    updatedAt: new Date()
  });
};

// Delete a comment
export const deleteComment = async (
  noteId: string, 
  commentId: string
): Promise<void> => {
  const commentRef = doc(db, 'notes', noteId, 'comments', commentId);
  await deleteDoc(commentRef);
};

// Pin/unpin a comment
export const pinComment = async (
  noteId: string, 
  commentId: string, 
  isPinned: boolean
): Promise<void> => {
  // First, unpin all comments if we're pinning this one
  if (isPinned) {
    const commentsRef = collection(db, 'notes', noteId, 'comments');
    const q = query(commentsRef);
    const commentDocs = await getDocs(q);
    
    const batch = writeBatch(db);
    commentDocs.forEach(commentDoc => {
      batch.update(commentDoc.ref, { isPinned: false });
    });
    await batch.commit();
  }
  
  // Then pin/unpin the specified comment
  const commentRef = doc(db, 'notes', noteId, 'comments', commentId);
  await updateDoc(commentRef, { isPinned });
};

// Subscribe to comments for a note (real-time updates)
export const subscribeToComments = (
  noteId: string, 
  callback: (comments: Comment[]) => void
): () => void => {
  const commentsRef = collection(db, 'notes', noteId, 'comments');
  // Order by isPinned (true first) and then by createdAt (newest first)
  const q = query(commentsRef, orderBy('isPinned', 'desc'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = [];
    snapshot.forEach(doc => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Comment);
    });
    callback(comments);
  });
};

// Get comment count for a note
export const getCommentCount = async (noteId: string): Promise<number> => {
  const commentsRef = collection(db, 'notes', noteId, 'comments');
  const snapshot = await getCountFromServer(commentsRef);
  return snapshot.data().count;
};

// Get recent comments across all notes since a specified timestamp
export const getRecentComments = (
  afterTimestamp: Date,
  limit: number = 10,
  callback: (comments: (Comment & { noteTitle: string })[]) => void
): () => void => {
  // First, get all notes to access their comment subcollections
  const notesQuery = query(collection(db, 'notes'));
  
  return onSnapshot(notesQuery, async (notesSnapshot) => {
    const allComments: (Comment & { noteTitle: string })[] = [];
    
    // Process each note document
    for (const noteDoc of notesSnapshot.docs) {
      try {
        const noteId = noteDoc.id;
        const noteData = noteDoc.data();
        const noteTitle = noteData.title || 'Untitled Note';
        
        // Get comments for this note
        const commentsQuery = query(
          collection(db, 'notes', noteId, 'comments'),
          where('createdAt', '>', afterTimestamp),
          orderBy('createdAt', 'desc')
        );
        
        const commentsSnapshot = await getDocs(commentsQuery);
        
        // Process each comment for this note
        commentsSnapshot.forEach(commentDoc => {
          try {
            const commentData = commentDoc.data();
            
            // Make sure createdAt and updatedAt are valid dates
            const createdAt = commentData.createdAt?.toDate() || new Date();
            const updatedAt = commentData.updatedAt?.toDate() || createdAt;
            
            allComments.push({
              id: commentDoc.id,
              ...commentData,
              noteId,
              noteTitle,
              createdAt,
              updatedAt,
            } as Comment & { noteTitle: string });
          } catch (error) {
            console.error('Error processing comment data:', error);
          }
        });
      } catch (error) {
        console.error('Error processing note:', error);
      }
    }
    
    // Sort all comments by date (newest first) and limit
    allComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const limitedComments = limit > 0 
      ? allComments.slice(0, limit) 
      : allComments;
    
    callback(limitedComments);
  });
}; 