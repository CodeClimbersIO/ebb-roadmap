import { NoteStatus } from '../../types/Note';

interface StatusBadgeProps {
  status: NoteStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Status badge colors
  const statusColors = {
    'backlog': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    'review': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    'complete': 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${statusColors[status]}`}>
      {status.replace('-', ' ')}
    </span>
  );
} 