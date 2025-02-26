import { Timestamp } from 'firebase/firestore';

export type NoteStatus = 'backlog' | 'in-progress' | 'review' | 'complete';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string[];
  status: NoteStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
  assignedTo: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  } | null;
}

export interface Comment {
  id: string;
  noteId: string;
  content: string;
  createdAt: Timestamp;
  createdBy: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
} 