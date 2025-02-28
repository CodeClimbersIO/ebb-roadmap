import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
}

export default function CommentForm({
  onSubmit,
  placeholder = "Add a comment..."
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full p-2 rounded-md border-2 border-border bg-card text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
        disabled={isSubmitting}
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="inline-flex justify-center py-1.5 px-3 border-2 border-primary shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/80 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>
    </form>
  );
} 