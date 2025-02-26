export interface Comment {
  id: string;
  noteId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  isPinned: boolean;
} 