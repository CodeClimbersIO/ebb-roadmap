interface CategoryTagProps {
  category: string;
  onRemove?: () => void;
}

export default function CategoryTag({ category, onRemove }: CategoryTagProps) {
  return (
    <span className="text-xs bg-muted text-gray-700 dark:text-gray-300 px-2 py-1 rounded whitespace-nowrap inline-flex items-center">
      {category}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 inline-flex text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <span className="sr-only">Remove</span>
          ×
        </button>
      )}
    </span>
  );
} 