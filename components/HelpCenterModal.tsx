'use client';

import { SettingsModal } from './SettingsModal';
import { HelpCircle, Book, MessageCircle, ExternalLink } from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const helpItems = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn how to place your first bet',
      action: () => window.open('https://docs.polyfield.com/getting-started', '_blank'),
    },
    {
      icon: MessageCircle,
      title: 'FAQ',
      description: 'Frequently asked questions',
      action: () => window.open('https://docs.polyfield.com/faq', '_blank'),
    },
    {
      icon: ExternalLink,
      title: 'Documentation',
      description: 'Full documentation and guides',
      action: () => window.open('https://docs.polyfield.com', '_blank'),
    },
  ];

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="Help Center">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {helpItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={item.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'var(--background-elevated)',
                borderRadius: '12px',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--background-secondary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--background-elevated)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} style={{ color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.description}
                </div>
              </div>
              <ExternalLink size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          );
        })}

        {/* Contact Support */}
        <div
          style={{
            padding: '16px',
            background: 'var(--background-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            marginTop: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <HelpCircle size={20} style={{ color: 'var(--primary)' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Need More Help?
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Contact our support team at{' '}
            <a
              href="mailto:support@polyfield.com"
              style={{ color: 'var(--primary)', textDecoration: 'none' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              support@polyfield.com
            </a>
          </p>
        </div>
      </div>
    </SettingsModal>
  );
}

