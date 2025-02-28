import { useState, useRef, useEffect } from 'react';
import { NoteStatus } from '../../types/Note';
import { ChevronDownIcon } from 'lucide-react';

interface EditableStatusBadgeProps {
  status: NoteStatus;
  onChange: (newStatus: NoteStatus) => void;
  disabled?: boolean;
}

export default function EditableStatusBadge({
  status,
  onChange,
  disabled = false
}: EditableStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Status badge colors
  const statusColors = {
    'backlog': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    'review': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    'complete': 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  };

  // Define a fixed order for status options
  const statusOrder: NoteStatus[] = ['backlog', 'in-progress', 'review', 'complete'];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = (newStatus: NoteStatus) => {
    onChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex items-center ${statusColors[status]} ${disabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {status.replace('-', ' ')}
        {!disabled && (
          <ChevronDownIcon className="ml-1 h-3 w-3" />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-1 z-10 w-40 rounded-md shadow-lg bg-card border border-border ring-1 ring-black/5 focus:outline-none">
          <div className="py-1">
            {/* Use fixed order for status options instead of Object.keys */}
            {statusOrder.map((statusOption) => (
              <button
                key={statusOption}
                className={`${statusOption === status ? 'bg-muted' : ''
                  } flex items-center px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-muted w-full text-left`}
                onClick={() => handleStatusChange(statusOption)}
              >
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${statusColors[statusOption].split(' ')[0]}`}
                />
                {statusOption.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 