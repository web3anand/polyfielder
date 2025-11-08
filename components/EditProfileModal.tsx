'use client';

import { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '@/contexts/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { userAddress, user } = useAuth();
  const [username, setUsername] = useState(user?.linkedAccounts?.find((acc: any) => acc.type === 'email')?.email?.split('@')[0] || '');

  const handleSave = async () => {
    // TODO: Implement profile update API
    console.log('Saving profile:', { username });
    onClose();
  };

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            Wallet Address
          </label>
          <input
            type="text"
            value={userAddress || ''}
            disabled
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              background: 'var(--background-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)',
              cursor: 'not-allowed',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Wallet address cannot be changed
          </p>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            Username (Coming Soon)
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled
            placeholder="Username"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              background: 'var(--background-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)',
              cursor: 'not-allowed',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Username customization coming soon
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              background: 'var(--background-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--background-elevated)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#fff',
              background: 'var(--primary)',
              borderRadius: '12px',
              border: 'none',
              cursor: 'not-allowed',
              opacity: 0.5,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </SettingsModal>
  );
}

