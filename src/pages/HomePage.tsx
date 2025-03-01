import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Note, NoteStatus } from '../types/Note';
import { subscribeToNotes, createNote, updateNote, deleteNote } from '../services/noteService';
import NoteCard from '../components/notes/NoteCard';
import NoteForm from '../components/notes/NoteForm';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from 'lucide-react';
import Modal from '../components/ui/Modal';
import RecentUpdatesWidget from '../components/updates/RecentUpdatesWidget';
import { updateLastVisitTime } from '../services/localStorageService';
import ProfileImage from '../components/ui/ProfileImage';

export default function HomePage() {
  const { currentUser, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Get unique categories from all notes
  const allCategories = Array.from(new Set(notes.flatMap(note => note.category)));

  // Can edit if user is editor or admin
  const canEdit = currentUser && ['editor', 'admin'].includes(currentUser.role || '');

  // Update last visit time when component mounts
  useEffect(() => {
    updateLastVisitTime();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToNotes((newNotes) => {
      setNotes(newNotes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateNote = async (data: Partial<Note>): Promise<string> => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      const noteId = await createNote(data as Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, currentUser);
      setIsFormOpen(false);
      return noteId;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const handleUpdateNote = async (data: Partial<Note>): Promise<string> => {
    if (!editingNote) throw new Error("No note selected for editing");

    try {
      await updateNote(editingNote.id, data);
      setEditingNote(null);
      return editingNote.id;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  // Define the priority order for statuses
  const statusPriority = {
    'review': 1,
    'in-progress': 2,
    'backlog': 3,
    'complete': 4
  };

  // Sort notes by status priority
  const sortedNotes = [...notes].sort((a, b) => {
    const priorityA = statusPriority[a.status as keyof typeof statusPriority] || 999;
    const priorityB = statusPriority[b.status as keyof typeof statusPriority] || 999;
    return priorityA - priorityB;
  });

  const filteredNotes = sortedNotes
    .filter(note => !filter || note.status === filter)
    .filter(note => !categoryFilter || note.category.includes(categoryFilter));

  return (
    <div className="min-h-screen bg-background">
      {/* Header with fixed user icon */}
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/images/ebb-logo.png" alt="Ebb Logo" className="h-10" />
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Ebb Progress</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-700 dark:text-gray-300 hover:bg-muted"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {currentUser && (
              <div className="flex items-center space-x-2">
                <ProfileImage
                  user={currentUser}
                  size="md"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {currentUser.displayName || 'User'}
                  {currentUser.role && (
                    <span className="ml-1 text-xs text-gray-700 dark:text-gray-300">({currentUser.role})</span>
                  )}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Sign out
                </button>
              </div>
            )}

            {!currentUser && (
              <a href="/login" className="text-primary hover:text-primary/80">
                Sign in
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recent Updates Widget & Add Note button in the same row */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
          <div className="flex-1 w-full">
            <RecentUpdatesWidget />
          </div>

          {(currentUser && ['editor', 'admin'].includes(currentUser.role || '')) && (
            <div className="md:ml-4 self-start mt-0">
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors whitespace-nowrap"
              >
                Add Note
              </button>
            </div>
          )}
        </div>

        {/* Filter section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value as NoteStatus | '')}
              className="w-full md:w-auto px-3 py-2 bg-background border border-border rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="backlog">Backlog</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-background border border-border rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Categories</option>
              {allCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create new note modal */}
        {isFormOpen && (
          <Modal
            title="Create New Note"
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
          >
            <NoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setIsFormOpen(false)}
            />
          </Modal>
        )}

        {/* Edit note modal */}
        {editingNote && (
          <Modal
            title="Edit Note"
            isOpen={!!editingNote}
            onClose={() => setEditingNote(null)}
          >
            <NoteForm
              note={editingNote}
              onSubmit={handleUpdateNote}
              onCancel={() => setEditingNote(null)}
            />
          </Modal>
        )}

        {/* Notes grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-gray-900 dark:text-gray-100">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300">No notes found. {canEdit && 'Create your first note!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={canEdit ? setEditingNote : undefined}
                onDelete={canEdit ? handleDeleteNote : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 