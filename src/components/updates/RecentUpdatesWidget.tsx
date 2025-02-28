import { useState, useEffect, useRef } from 'react';
import { getRecentComments } from '../../services/commentService';
import { getLastVisitTime } from '../../services/localStorageService';
import { formatDistanceToNow } from 'date-fns';
import { BellIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import ProfileImage from '../ui/ProfileImage';

// Extended Comment type with note title
interface RecentComment {
  id: string;
  noteId: string;
  noteTitle: string;
  content: string;
  createdAt: Date;
  createdBy: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
  isNew?: boolean; // Flag to indicate if this is a new comment since last visit
}

export default function RecentUpdatesWidget() {
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const [newCommentsCount, setNewCommentsCount] = useState(0);

  const batchSize = 10;
  const commentsPerPage = 10;

  useEffect(() => {
    // Get the last visit time to determine new comments
    const lastVisitTime = getLastVisitTime();
    console.log('Last visit time:', lastVisitTime);

    // Get all recent comments
    const unsubscribe = getRecentComments(
      // Use a date far in the past to get all comments
      new Date(0), // January 1, 1970
      batchSize,
      (comments) => {
        console.log('Retrieved comments:', comments.length);

        // Mark comments that are newer than last visit and handle type conversion
        const commentsWithNewFlag = comments.map(comment => {
          // Ensure dates are properly compared
          const commentDate = comment.createdAt instanceof Date
            ? comment.createdAt
            : new Date(comment.createdAt);

          return {
            ...comment,
            isNew: commentDate > lastVisitTime,
            // Ensure photoURL is null when undefined to match RecentComment type
            createdBy: {
              ...comment.createdBy,
              photoURL: comment.createdBy.photoURL || null
            }
          };
        });

        setRecentComments(commentsWithNewFlag as RecentComment[]);
        setLoading(false);

        // Count how many comments are new since last visit
        const newCount = commentsWithNewFlag.filter(c => c.isNew).length;
        setNewCommentsCount(newCount);
        console.log('New comments count:', newCount);

        // Check if we have more comments than our initial batch
        setHasMore(comments.length >= batchSize);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          // Load more comments when scrolling to bottom
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverTarget = observerTarget.current;
    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [observerTarget, hasMore, loading]);

  // Handle loading more comments
  useEffect(() => {
    if (page > 1 && hasMore) {
      setLoading(true);

      // In a real implementation, you would fetch more comments here
      // For now, we'll simulate by adding a delay
      const timeout = setTimeout(() => {
        // Fetch more comments logic would go here
        // For now, just mark that there are no more to load
        setHasMore(false);
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [page]);

  // Format the time of a comment
  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const displayedComments = recentComments.slice(0, page * commentsPerPage);

  return (
    <div className="bg-card border border-border rounded-md shadow-sm">
      {/* Header with badge */}
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-foreground font-medium">Recent Updates</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <BellIcon className="h-4 w-4 text-muted-foreground" />
            {newCommentsCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                {newCommentsCount}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Comment list (collapsible) */}
      {isOpen && (
        <div className="border-t border-border">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="animate-pulse">Loading updates...</div>
            </div>
          ) : recentComments.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-2">No comments yet</p>
              <p className="text-xs text-muted-foreground">Comments on tasks will appear here.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {displayedComments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-4 border-b border-border ${comment.isNew ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start space-x-2">
                    <ProfileImage
                      user={comment.createdBy}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {comment.createdBy.displayName || 'Anonymous'}
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatTime(comment.createdAt)}
                          </span>
                          {comment.isNew && (
                            <span className="ml-2 text-xs font-semibold text-primary rounded-full">
                              New
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        on <span className="font-medium">{comment.noteTitle}</span>
                      </p>
                      <p className="mt-1 text-sm text-foreground break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Intersection observer target for infinite scrolling */}
              <div ref={observerTarget} className="h-4 w-full">
                {loading && page > 1 && (
                  <div className="p-2 text-center text-muted-foreground text-sm">
                    Loading more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 