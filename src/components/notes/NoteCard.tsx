import { useState, useEffect } from 'react';
import { Note, NoteStatus } from '../../types/Note';
import { useAuth } from '../../contexts/AuthContext';
import { updateNote } from '../../services/noteService';
import StatusBadge from '../ui/StatusBadge';
import EditableStatusBadge from '../ui/EditableStatusBadge';
import CategoryTag from '../ui/CategoryTag';
import AssigneeSelector, { UserInfo } from '../ui/AssigneeSelector';
import { subscribeToComments, pinComment, createComment } from '../../services/commentService';
import { Comment } from '../../types/Comment';
import { MessageCircleIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import CommentItem from '../comments/CommentItem';
import CommentForm from '../comments/CommentForm';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(true);

  const canEdit = currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'editor');

  const canAssign = currentUser && currentUser.role === 'admin';
  const canComment = currentUser && currentUser.role === 'admin';

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

  // Add comment fetching effect
  useEffect(() => {
    const unsubscribe = subscribeToComments(note.id, (newComments) => {
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [note.id]);

  // Get pinned comment
  const handlePinComment = async (commentId: string, isPinned: boolean) => {
    try {
      await pinComment(note.id, commentId, isPinned);
    } catch (error) {
      console.error("Error pinning comment:", error);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!currentUser) return;

    try {
      await createComment(note.id, content, currentUser);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-200 overflow-hidden flex flex-col">
      <div className="p-4 flex-grow">
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

        <div
          className="mt-4 flex items-center text-xs text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={() => setIsCommentsCollapsed(!isCommentsCollapsed)}
        >
          <MessageCircleIcon className="h-3.5 w-3.5 mr-1" />
          <span>Comments ({comments.length})</span>
          {comments.length > 0 && (
            isCommentsCollapsed ?
              <ChevronDownIcon className="h-3.5 w-3.5 ml-1" /> :
              <ChevronUpIcon className="h-3.5 w-3.5 ml-1" />
          )}
        </div>

        {comments.length > 0 && comments.some(c => c.isPinned) && (
          <div className="mt-3">
            {comments.filter(c => c.isPinned).map(pinnedComment => (
              <CommentItem
                key={pinnedComment.id}
                comment={pinnedComment}
                noteId={note.id}
                onPin={(commentId, isPinned) => handlePinComment(commentId, isPinned)}
                isPinnable={!!canEdit}
              />
            ))}
          </div>
        )}

        {note.category && note.category.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {note.category.map((cat, index) => (
              <CategoryTag key={index} category={cat} />
            ))}
          </div>
        )}
      </div>

      {!isCommentsCollapsed && comments.length > 0 && (
        <div className="border-t border-border">
          <div className="px-4 py-4">
            {comments.filter(c => !c.isPinned).length > 0 ? (
              <div className="space-y-3">
                {comments.filter(c => !c.isPinned).map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    noteId={note.id}
                    onPin={(commentId, isPinned) => handlePinComment(commentId, isPinned)}
                    isPinnable={!!canEdit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No additional comments
              </div>
            )}

            {canComment && (
              <div className="mt-4">
                <CommentForm onSubmit={content => handleAddComment(content)} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-2 bg-muted border-t border-border flex justify-between items-center">
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