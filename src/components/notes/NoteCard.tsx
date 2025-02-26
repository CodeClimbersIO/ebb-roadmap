import { useState } from 'react';
import { Note, NoteStatus } from '../../types/Note';
import { useAuth } from '../../contexts/AuthContext';
import { updateNote } from '../../services/noteService';
import StatusBadge from '../ui/StatusBadge';
import EditableStatusBadge from '../ui/EditableStatusBadge';
import CategoryTag from '../ui/CategoryTag';
import AssigneeSelector, { UserInfo } from '../ui/AssigneeSelector';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const canEdit = currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'editor');

  const canAssign = currentUser && currentUser.role === 'admin';

  // Handle assignee change directly from the card
  const handleAssigneeChange = async (assignee: UserInfo | null) => {
    try {
      await updateNote(note.id, { assignedTo: assignee });
    } catch (error) {
      console.error("Error updating assignee:", error);
    }
  };

  // Handle status change directly from the card
  const handleStatusChange = async (newStatus: NoteStatus) => {
    try {
      await updateNote(note.id, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg text-card-foreground truncate mr-2">{note.title}</h3>
          {canEdit ? (
            <EditableStatusBadge
              status={note.status}
              onChange={handleStatusChange}
            />
          ) : (
            <StatusBadge status={note.status} />
          )}
        </div>

        <div className="mt-2">
          {isExpanded ? (
            <p className="text-muted-foreground">{note.content}</p>
          ) : (
            <p className="text-muted-foreground line-clamp-2">{note.content}</p>
          )}

          {note.content.length > 100 && (
            <button
              className="text-primary text-sm mt-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {note.category.map((cat, index) => (
            <CategoryTag key={index} category={cat} />
          ))}
        </div>
      </div>

      <div className="px-4 py-2 bg-muted border-t border-border flex justify-between items-center">
        {/* Use the AssigneeSelector with compact mode */}
        <AssigneeSelector
          currentAssignee={note.assignedTo}
          onAssigneeChange={handleAssigneeChange}
          compact={true}
          disabled={!canAssign}
        />

        {canEdit && (
          <div className="flex space-x-2 flex-shrink-0">
            <button
              onClick={() => onEdit && onEdit(note)}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(note.id)}
              className="text-destructive hover:text-destructive/80 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 