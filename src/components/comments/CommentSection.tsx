import { useState, useEffect } from 'react';
import { Comment } from '../../types/Comment';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToComments, createComment, pinComment } from '../../services/commentService';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  noteId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function CommentSection({
  noteId,
  isCollapsed = false,
  onToggleCollapse
}: CommentSectionProps) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);

  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');
  const pinnedComment = comments.find(comment => comment.isPinned);
  const otherComments = comments.filter(comment => !comment.isPinned);

  useEffect(() => {
    const unsubscribe = subscribeToComments(noteId, (newComments) => {
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [noteId]);

  const handleAddComment = async (content: string) => {
    if (!currentUser) return;

    try {
      // Auto-pin if it's the first comment
      const isPinned = comments.length === 0;
      await createComment(noteId, content, currentUser, isPinned);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handlePinComment = async (commentId: string, isPinned: boolean) => {
    try {
      await pinComment(noteId, commentId, isPinned);
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between mb-2">
        {comments.length > 0 && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? 'Show all' : 'Collapse'}
          </button>
        )}
      </div>

      {/* Always show pinned comment */}
      {pinnedComment && (
        <div className="mb-3">
          <CommentItem
            comment={pinnedComment}
            noteId={noteId}
            onPin={handlePinComment}
            isPinnable={isAdmin && (!isCollapsed || comments.length === 1)}
          />
        </div>
      )}

      {/* Show other comments if not collapsed */}
      {!isCollapsed && (
        <div className="space-y-3">
          {otherComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              noteId={noteId}
              onPin={handlePinComment}
              isPinnable={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Comment form for admins */}
      {isAdmin && !isCollapsed && (
        <div className="mt-4">
          <CommentForm onSubmit={handleAddComment} />
        </div>
      )}
    </div>
  );
} 