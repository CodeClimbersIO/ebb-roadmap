import { useState } from 'react';
import { Comment } from '../../types/Comment';
import { useAuth } from '../../contexts/AuthContext';
import { updateComment, deleteComment } from '../../services/commentService';
import { formatDistanceToNow } from 'date-fns';
import { PinIcon, EditIcon, TrashIcon } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  noteId: string;
  onPin: (commentId: string, isPinned: boolean) => Promise<void>;
  isPinnable: boolean;
}

export default function CommentItem({
  comment,
  noteId,
  onPin,
  isPinnable
}: CommentItemProps) {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const canEdit = currentUser && currentUser.uid === comment.createdBy.uid;

  // Format the timestamp safely
  const formatTimeAgo = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) {
      return 'Just now';
    }

    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recently';
    }
  };

  const handleUpdate = async () => {
    if (!editedContent.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateComment(noteId, comment.id, editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(noteId, comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handlePin = async () => {
    try {
      await onPin(comment.id, !comment.isPinned);
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  };

  return (
    <div className={`mb-3 p-3 rounded-md ${comment.isPinned ? 'bg-primary/5 border border-primary/20' : 'bg-card hover:bg-muted'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {comment.createdBy.displayName || 'Anonymous'}
          </div>
          <span className="mx-1 text-xs text-gray-600 dark:text-gray-400">•</span>
          <div className="text-xs text-gray-700 dark:text-gray-300">
            {formatTimeAgo(comment.createdAt)}
          </div>
        </div>

        <div className="flex space-x-1">
          {isPinnable && (
            <button
              onClick={handlePin}
              className={`p-1 rounded-full ${comment.isPinned ? 'text-primary bg-primary/10' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-muted'}`}
              title={comment.isPinned ? 'Unpin comment' : 'Pin comment'}
            >
              <PinIcon className="h-3.5 w-3.5" />
            </button>
          )}

          {canEdit && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-muted"
                title="Edit comment"
                disabled={isEditing}
              >
                <EditIcon className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleDelete}
                className="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:text-destructive hover:bg-muted"
                title="Delete comment"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-1">
        {isEditing ? (
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 text-sm border rounded-md bg-card text-gray-900 dark:text-gray-100"
              rows={2}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                disabled={!editedContent.trim() || isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{comment.content}</p>
        )}
      </div>
    </div>
  );
} 