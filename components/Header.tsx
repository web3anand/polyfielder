'use client';

import Link from 'next/link';

const heroHighlights = [
  { label: 'Active markets', value: '320+' },
  { label: 'Avg. 24h return', value: '18%' },
  { label: 'Community traders', value: '12k+' },
];

export function Header() {
  return (
    <header className="app-header">
      <div className="header-shell">
        <div className="header-top">
          <Link href="/" className="header-title">
            polyField
          </Link>
          <div className="header-actions">
            <Link href="/login" className="header-action-secondary">
              Sign in
            </Link>
            <Link href="/login" className="header-action-primary">
              Get Started
            </Link>
          </div>
        </div>

        <div className="header-hero">
          <div className="header-hero-copy">
            <span className="header-eyebrow">Predict. Trade. Win.</span>
            <h1 className="header-headline">
              Trade real-world events with confident, lightning-fast execution.
            </h1>
            <p className="header-subheadline">
              Discover live markets across sports, politics, and culture. Place no-hassle wagers with transparent odds, deep liquidity, and community insights.
            </p>
            <div className="header-cta-row">
              <Link href="#markets" className="header-action-primary">
                Explore Markets
              </Link>
              <Link href="/portfolio" className="header-action-outline">
                View Portfolio
              </Link>
            </div>
          </div>

          <div className="header-hero-metrics">
            {heroHighlights.map((item) => (
              <div key={item.label} className="header-metric-card">
                <span className="header-metric-value">{item.value}</span>
                <span className="header-metric-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

