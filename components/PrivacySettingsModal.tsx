'use client';

import { SettingsModal } from './SettingsModal';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, Eye, Key } from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const { userAddress } = useAuth();

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Privacy & Security">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Wallet Address */}
        <div
          style={{
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Key size={20} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Wallet Address
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {userAddress ? formatAddress(userAddress) : 'Not connected'}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div
          style={{
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={20} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Data Privacy
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Your wallet address is public. All transactions are on-chain and transparent.
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div
          style={{
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={20} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Security
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Your private keys are stored securely by Privy. Never share your seed phrase.
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div
          style={{
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            opacity: 0.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Eye size={20} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Profile Visibility
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsModal>
  );
}

