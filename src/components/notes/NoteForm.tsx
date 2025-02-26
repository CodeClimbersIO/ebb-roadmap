import { useState } from 'react';
import { Note, NoteStatus } from '../../types/Note';
import { useAuth } from '../../contexts/AuthContext';
import CategoryTag from '../ui/CategoryTag';
import AssigneeSelector, { UserInfo } from '../ui/AssigneeSelector';
import { createComment } from '../../services/commentService';

interface NoteFormProps {
  note?: Partial<Note>;
  onSubmit: (data: Partial<Note>) => Promise<string>;
  onCancel: () => void;
}

export default function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(note?.title || '');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<NoteStatus>(note?.status || 'backlog');
  const [categories, setCategories] = useState<string[]>(note?.category || []);
  const [newCategory, setNewCategory] = useState('');
  const [assignedTo, setAssignedTo] = useState<UserInfo | null>(note?.assignedTo || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Check if current user is admin
  const isAdmin = currentUser && currentUser.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous errors
    setErrors({});

    // Validate form
    let hasErrors = false;
    const newErrors: { title?: string } = {};

    if (!title) {
      newErrors.title = "Please provide a title";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create note without comment field
      const noteData = {
        title,
        status,
        category: categories,
        assignedTo
      };

      // Create the note and get its ID
      const noteId = await onSubmit(noteData);

      // Then create first comment if provided and pin it
      if (comment && comment.trim() !== '' && currentUser) {
        await createComment(noteId, comment.trim(), currentUser, true);
      }

      onCancel();
    } catch (error) {
      console.error("Error creating note:", error);
      setErrors({ title: "Failed to create note" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-foreground">
      <div className="text-left">
        <label htmlFor="title" className="block text-sm font-medium mb-1 text-left">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`block w-full p-2 rounded-md border-2 ${errors.title ? 'border-red-500' : 'border-border'} bg-card text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm`}
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div className="text-left">
        <label htmlFor="comment" className="block text-sm font-medium mb-1 text-left">
          Comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="block w-full p-2 rounded-md border-2 border-border bg-card text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div className="text-left">
        <label htmlFor="status" className="block text-sm font-medium mb-1 text-left">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as NoteStatus)}
          className="block w-full p-2 rounded-md border-2 border-border bg-card text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="backlog">Backlog</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      {/* Use the AssigneeSelector component */}
      {isAdmin && (
        <div className="text-left">
          <AssigneeSelector
            currentAssignee={assignedTo}
            onAssigneeChange={setAssignedTo}
          />
        </div>
      )}

      <div className="text-left">
        <label className="block text-sm font-medium mb-1 text-left">
          Categories
        </label>
        <div className="flex mt-1">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="block w-full p-2 rounded-l-md border-2 border-border bg-card text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Add category"
          />
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center px-3 py-2 border-2 border-primary text-sm leading-4 font-medium rounded-r-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Add
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((cat, index) => (
            <CategoryTag
              key={index}
              category={cat}
              onRemove={() => removeCategory(cat)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border-2 border-border shadow-sm text-sm font-medium rounded-md text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border-2 border-primary shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : (note?.id ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
} 