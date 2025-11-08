'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  // Redirect to profile page if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/profile');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignIn = async () => {
    await login();
    // Privy modal will open - user will be redirected to profile when login completes
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--text-muted)]">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[var(--background-elevated)] rounded-2xl p-8 border border-[var(--border-primary)] pixel-shadow">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Welcome to polyField
              </h1>
              <p className="text-[var(--text-muted)]">
                Sign in to start betting on sports markets
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 pixel-shadow"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Sign In with Privy
              </button>

              {/* Info */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--background-primary)' }}>
                <p className="text-sm text-[var(--text-muted)] text-center">
                  Privy supports email, SMS, and wallet connections. Choose your preferred method when you sign in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
