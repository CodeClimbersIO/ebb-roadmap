interface CategoryTagProps {
  category: string;
  onRemove?: () => void;
}

export default function CategoryTag({ category, onRemove }: CategoryTagProps) {
  return (
    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded whitespace-nowrap inline-flex items-center">
      {category}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 inline-flex text-muted-foreground hover:text-foreground"
        >
          <span className="sr-only">Remove</span>
          ×
        </button>
      )}
    </span>
  );
} 