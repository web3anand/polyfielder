'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link href="/" className="header-title">
          polyField
        </Link>
      </div>
    </header>
  );
}

