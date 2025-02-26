import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp,
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Note, Comment, NoteStatus } from '../types/Note';
import { User } from 'firebase/auth';

// Reference to notes collection
const notesCollection = collection(db, 'notes');
const commentsCollection = collection(db, 'comments');

// Create a new note
export async function createNote(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, user: User) {
  // Default to assigning to the creator
  const assignedTo = data.assignedTo || {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
  
  const noteData = {
    ...data,
    assignedTo,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL
    }
  };
  
  return await addDoc(notesCollection, noteData);
}

// Update an existing note
export async function updateNote(id: string, data: Partial<Omit<Note, 'id' | 'createdAt' | 'createdBy'>>) {
  const noteRef = doc(db, 'notes', id);
  return await updateDoc(noteRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
}

// Delete a note
export async function deleteNote(id: string) {
  const noteRef = doc(db, 'notes', id);
  return await deleteDoc(noteRef);
}

// Listen to all notes with real-time updates
export function subscribeToNotes(callback: (notes: Note[]) => void) {
  const q = query(notesCollection, orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const notes: Note[] = [];
    snapshot.forEach(doc => {
      notes.push({ id: doc.id, ...doc.data() } as Note);
    });
    callback(notes);
  });
}

// Filter notes by status
export function subscribeToNotesByStatus(status: NoteStatus, callback: (notes: Note[]) => void) {
  const q = query(
    notesCollection, 
    where('status', '==', status),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes: Note[] = [];
    snapshot.forEach(doc => {
      notes.push({ id: doc.id, ...doc.data() } as Note);
    });
    callback(notes);
  });
}

// Filter notes by category
export function subscribeToNotesByCategory(category: string, callback: (notes: Note[]) => void) {
  const q = query(
    notesCollection, 
    where('category', 'array-contains', category),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes: Note[] = [];
    snapshot.forEach(doc => {
      notes.push({ id: doc.id, ...doc.data() } as Note);
    });
    callback(notes);
  });
}

// Add a comment to a note
export async function addComment(noteId: string, content: string, user: User) {
  const commentData = {
    noteId,
    content,
    createdAt: Timestamp.now(),
    createdBy: {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL
    }
  };
  
  return await addDoc(commentsCollection, commentData);
}

// Get comments for a note with real-time updates
export function subscribeToNoteComments(noteId: string, callback: (comments: Comment[]) => void) {
  const q = query(
    commentsCollection, 
    where('noteId', '==', noteId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = [];
    snapshot.forEach(doc => {
      comments.push({ id: doc.id, ...doc.data() } as Comment);
    });
    callback(comments);
  });
}

// Get all admin users for assignment dropdown
export async function getAdminUsers() {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', '==', 'admin'));
  const querySnapshot = await getDocs(q);
  
  const admins = [];
  querySnapshot.forEach((doc) => {
    admins.push({
      uid: doc.id,
      displayName: doc.data().displayName,
      photoURL: doc.data().photoURL,
      email: doc.data().email
    });
  });
  
  return admins;
} 