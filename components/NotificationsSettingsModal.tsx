'use client';

import { useState } from 'react';
import { SettingsModal } from './SettingsModal';

interface NotificationsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsSettingsModal({ isOpen, onClose }: NotificationsSettingsModalProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [betAlerts, setBetAlerts] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(false);

  const handleSave = async () => {
    // TODO: Implement notification preferences API
    console.log('Saving notification preferences:', {
      emailNotifications,
      pushNotifications,
      betAlerts,
      marketUpdates,
    });
    onClose();
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: '48px',
        height: '24px',
        borderRadius: '12px',
        background: enabled ? 'var(--primary)' : 'var(--border-primary)',
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
          left: enabled ? '26px' : '2px',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  );

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Notification Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Email Notifications
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Receive updates via email
            </div>
          </div>
          <ToggleSwitch enabled={emailNotifications} onChange={setEmailNotifications} />
        </div>

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
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Push Notifications
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Browser push notifications
            </div>
          </div>
          <ToggleSwitch enabled={pushNotifications} onChange={setPushNotifications} />
        </div>

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
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Bet Alerts
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Notify when bets are placed or settled
            </div>
          </div>
          <ToggleSwitch enabled={betAlerts} onChange={setBetAlerts} />
        </div>

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
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Market Updates
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Price changes and market news
            </div>
          </div>
          <ToggleSwitch enabled={marketUpdates} onChange={setMarketUpdates} />
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
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#fff',
              background: 'var(--primary)',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Save
          </button>
        </div>
      </div>
    </SettingsModal>
  );
}

