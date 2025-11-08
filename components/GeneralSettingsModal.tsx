'use client';

import { SettingsModal } from './SettingsModal';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GeneralSettingsModal({ isOpen, onClose }: GeneralSettingsModalProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="General Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Theme Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: theme === 'dark' ? 'var(--color-primary)' : '#F8B400',
              }}
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-white" />
              ) : (
                <Sun className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Switch between dark and light themes
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: '48px',
              height: '24px',
              borderRadius: '12px',
              background: theme === 'dark' ? 'var(--primary)' : 'var(--border-primary)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                top: '2px',
                left: theme === 'dark' ? '26px' : '2px',
                transition: 'left 0.2s ease',
              }}
            />
          </button>
        </div>

        {/* Language (Coming Soon) */}
        <div
          style={{
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            opacity: 0.6,
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Language
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Coming soon
          </div>
        </div>

        {/* Currency (Coming Soon) */}
        <div
          style={{
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            opacity: 0.6,
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Currency
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Coming soon
          </div>
        </div>
      </div>
    </SettingsModal>
  );
}

