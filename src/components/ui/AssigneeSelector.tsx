import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminUsers } from '../../services/noteService';

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
        {currentAssignee && currentAssignee.photoURL ? (
          <img
            src={currentAssignee.photoURL}
            alt={currentAssignee.displayName || 'User'}
            className="w-5 h-5 rounded-full mr-1"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs mr-1">
            {currentAssignee ? (currentAssignee.displayName?.charAt(0) || 'U').toUpperCase() : 'U'}
          </div>
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
          {currentAssignee && currentAssignee.photoURL ? (
            <img
              src={currentAssignee.photoURL}
              alt={currentAssignee.displayName || 'User'}
              className="w-5 h-5 rounded-full mr-1"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs mr-1">
              {currentAssignee ? (currentAssignee.displayName?.charAt(0) || 'U').toUpperCase() : 'U'}
            </div>
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
                  {admin.photoURL ? (
                    <img
                      src={admin.photoURL}
                      alt={admin.displayName || 'Admin'}
                      className="w-5 h-5 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs mr-2">
                      {admin.displayName ? admin.displayName.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  {admin.displayName || admin.email || admin.uid}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full dropdown mode for forms
  return (
    <div className="text-left">
      <label htmlFor="assignee" className="block text-sm font-medium mb-1 text-left">
        Assigned To
      </label>
      <select
        id="assignee"
        value={currentAssignee?.uid || ''}
        onChange={(e) => {
          const selectedUid = e.target.value;
          if (selectedUid === '') {
            onAssigneeChange(null);
          } else {
            const selectedAdmin = adminUsers.find(admin => admin.uid === selectedUid);
            if (selectedAdmin) {
              onAssigneeChange(selectedAdmin);
            }
          }
        }}
        className="block w-full p-2 rounded-md border-2 border-border bg-card text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        disabled={loading}
      >
        <option value="">Unassigned</option>
        {adminUsers.map(admin => (
          <option key={admin.uid} value={admin.uid}>
            {admin.displayName || admin.email || admin.uid}
          </option>
        ))}
      </select>
    </div>
  );
} 