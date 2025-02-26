import { useState } from 'react';
import { Note, NoteStatus } from '../../types/Note';
import { useAuth } from '../../contexts/AuthContext';
import CategoryTag from '../ui/CategoryTag';
import AssigneeSelector, { UserInfo } from '../ui/AssigneeSelector';

interface NoteFormProps {
  note?: Partial<Note>;
  onSubmit: (data: Partial<Note>) => void;
  onCancel: () => void;
}

export default function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [status, setStatus] = useState<NoteStatus>(note?.status || 'backlog');
  const [categories, setCategories] = useState<string[]>(note?.category || []);
  const [newCategory, setNewCategory] = useState('');
  const [assignedTo, setAssignedTo] = useState<UserInfo | null>(note?.assignedTo || null);

  // Check if current user is admin
  const isAdmin = currentUser && currentUser.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      status,
      category: categories,
      assignedTo
    });
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
          className="block w-full p-2 rounded-md border-2 border-border bg-card text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
        />
      </div>

      <div className="text-left">
        <label htmlFor="content" className="block text-sm font-medium mb-1 text-left">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="block w-full p-2 rounded-md border-2 border-border bg-card text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
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
          className="inline-flex justify-center py-2 px-4 border-2 border-primary shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {note?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
} 