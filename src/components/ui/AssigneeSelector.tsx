import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminUsers } from '../../services/noteService';
import ProfileImage from './ProfileImage';

// Define types that can be reused across components
export interface UserInfo {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email?: string | null;
}

interface AssigneeSelectorProps {
  currentAssignee: UserInfo | null;
  onAssigneeChange: (assignee: UserInfo | null) => void;
  compact?: boolean; // For different display modes (dropdown vs. inline)
  disabled?: boolean;
}

export default function AssigneeSelector({
  currentAssignee,
  onAssigneeChange,
  compact = false,
  disabled = false
}: AssigneeSelectorProps) {
  const { currentUser } = useAuth();
  const [adminUsers, setAdminUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Check if current user is admin
  const isAdmin = currentUser && currentUser.role === 'admin';

  // Fetch admin users
  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      getAdminUsers()
        .then(admins => {
          setAdminUsers(admins);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching admin users:', error);
          setLoading(false);
        });
    }
  }, [isAdmin]);

  // If not admin or disabled, just display the current assignee
  if (!isAdmin || disabled) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        {currentAssignee && (
          <ProfileImage
            user={currentAssignee}
            size="sm"
            className="mr-1"
          />
        )}
        <span className="truncate max-w-[100px]">
          {currentAssignee ? currentAssignee.displayName || 'Unnamed User' : 'Unassigned'}
        </span>
      </div>
    );
  }

  // Compact mode for inline editing on cards
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          {currentAssignee && (
            <ProfileImage
              user={currentAssignee}
              size="sm"
              className="mr-1"
            />
          )}
          <span className="truncate max-w-[100px]">
            {currentAssignee ? currentAssignee.displayName || 'Unnamed User' : 'Unassigned'}
          </span>
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 bottom-full mb-1 py-1 w-56 rounded-md shadow-lg bg-card border border-border ring-1 ring-black/5 focus:outline-none z-10">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => {
                onAssigneeChange(null);
                setIsOpen(false);
              }}
            >
              Unassigned
            </button>
            {adminUsers.map(admin => (
              <button
                key={admin.uid}
                className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => {
                  onAssigneeChange(admin);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <ProfileImage
                    user={admin}
                    size="sm"
                    className="mr-2"
                  />
                  {admin.displayName || admin.email || admin.uid}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full-sized dropdown for detailed view
  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1 text-foreground">Assignee</label>
      <div className="mt-1 relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-card border border-border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
        >
          <span className="flex items-center">
            {currentAssignee && (
              <ProfileImage
                user={currentAssignee}
                size="sm"
                className="mr-3"
              />
            )}
            <span className="block truncate">
              {currentAssignee ? currentAssignee.displayName || 'Unnamed User' : 'Unassigned'}
            </span>
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul
            className="absolute z-10 mt-1 w-full bg-card shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            tabIndex={-1}
            role="listbox"
            aria-labelledby="listbox-label"
            aria-activedescendant="listbox-option-3"
          >
            <li
              className="text-foreground cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-muted"
              id="listbox-option-null"
              role="option"
              onClick={() => {
                onAssigneeChange(null);
                setIsOpen(false);
              }}
            >
              <span className="font-normal block truncate">Unassigned</span>
            </li>

            {adminUsers.map(admin => (
              <li
                key={admin.uid}
                className="text-foreground cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-muted"
                id={`listbox-option-${admin.uid}`}
                role="option"
                onClick={() => {
                  onAssigneeChange(admin);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <ProfileImage
                    user={admin}
                    size="sm"
                    className="mr-3"
                  />
                  <span className="font-normal block truncate">
                    {admin.displayName || admin.email || admin.uid}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 