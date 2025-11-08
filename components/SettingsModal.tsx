'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SettingsModal({ isOpen, onClose, title, children }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--background-primary)',
          borderRadius: '24px',
          zIndex: 9999,
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUpSmooth 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-primary)',
          width: '100%',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              all: 'unset',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'var(--background-elevated)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--background-elevated)';
            }}
          >
            <X size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              // If child already has a key, use it; otherwise add one
              return child.key !== null && child.key !== undefined
                ? child
                : React.cloneElement(child, { key: `modal-child-${index}` });
            }
            return child;
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUpSmooth {
          0% {
            transform: translate(-50%, -40%);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

