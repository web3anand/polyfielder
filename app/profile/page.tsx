'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Award, Calendar, Wallet, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EditProfileModal } from '@/components/EditProfileModal';
import { GeneralSettingsModal } from '@/components/GeneralSettingsModal';
import { NotificationsSettingsModal } from '@/components/NotificationsSettingsModal';
import { PrivacySettingsModal } from '@/components/PrivacySettingsModal';
import { HelpCenterModal } from '@/components/HelpCenterModal';

interface UserStats {
  totalBets: number;
  winRate: string;
  joinDate: string;
  totalInvested: number;
  balance: number;
}

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading, userAddress, login, logout, user, getAccessToken } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [generalSettingsOpen, setGeneralSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  
  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleLogin = async () => {
    await login();
  };

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !userAddress) {
        setUserStats(null);
        return;
      }

      setStatsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setUserStats(null);
          return;
        }

        const response = await fetch('/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Address': userAddress, // Send address in header since Privy tokens don't contain it
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, userAddress, getAccessToken]);

  // Get user info from Privy or use defaults
  const userInfo = {
    name: userAddress ? formatAddress(userAddress) : 'Guest',
    username: userAddress ? `@${userAddress.slice(2, 8)}` : '@guest',
    joinDate: userStats?.joinDate || 'Unknown',
    totalBets: userStats?.totalBets || 0,
    winRate: userStats?.winRate || '0%',
    rank: userStats && userStats.totalBets > 50 ? 'Expert Trader' : userStats && userStats.totalBets > 20 ? 'Intermediate' : 'Beginner',
    avatar: userAddress ? userAddress.slice(2, 4).toUpperCase() : 'GU',
    balance: userStats?.balance || 0,
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}>
        <div className="pb-2">
          {/* Header */}
          <div className="px-4 mb-1.5">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h1 className="text-[var(--text-primary)] mb-0.5">Profile</h1>
                <p className="text-[var(--text-secondary)] text-xs">Manage your account</p>
              </div>
              {isAuthenticated && userAddress && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--background-elevated)' }}>
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatAddress(userAddress)}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-1 rounded hover:bg-[var(--background-primary)] transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="px-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                <p className="text-[var(--text-muted)] text-sm">Loading...</p>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <div className="px-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 text-center pixel-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background-elevated)] flex items-center justify-center border-2 border-dashed border-[var(--border-primary)]">
                  <User className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h2 className="text-[var(--text-primary)] text-lg font-bold mb-2">Sign In to polyField</h2>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  Sign in with email, SMS, or wallet to view your profile, track your positions, and manage your settings
                </p>
                <button
                  onClick={handleLogin}
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
                <p className="text-[var(--text-muted)] text-xs mt-4">
                  Supports email, SMS, and Web3 wallets
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* User Info Card */}
              <div className="px-4 mb-3">
                <div className="profile-user-card rounded-3xl p-4 text-white shadow-lg pixel-shadow relative overflow-hidden">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg">
                        <span className="text-base font-bold">{userInfo.avatar}</span>
                      </div>
                      <button
                        onClick={() => setEditModalOpen(true)}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white hover:bg-white/30 transition-colors font-bold pixel-shadow border border-white/30"
                      >
                        Edit
                      </button>
                    </div>
                    <h2 className="text-white mb-0.5 text-base">{userInfo.name}</h2>
                    <p className="text-white/80 text-xs mb-3 font-medium">{userInfo.username}</p>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 pixel-shadow border border-white/20">
                        <div className="text-[10px] text-white/80 mb-0.5 uppercase tracking-wider font-bold">Bets</div>
                        <div className="text-white font-bold text-sm">{statsLoading ? '...' : userInfo.totalBets}</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 pixel-shadow border border-white/20">
                        <div className="text-[10px] text-white/80 mb-0.5 uppercase tracking-wider font-bold">Win Rate</div>
                        <div className="text-white font-bold text-sm">{statsLoading ? '...' : userInfo.winRate}</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 flex flex-col items-center justify-center pixel-shadow border border-white/20">
                        <Award className="w-4 h-4 mb-0.5" style={{ color: 'var(--accent-gold)' }} />
                        <div className="text-[10px] text-white/80 uppercase tracking-wider font-bold">{userInfo.rank}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="quick-stat-card rounded-2xl p-3 pixel-shadow text-white">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">Joined</div>
                    <div className="text-xs font-bold">{userInfo.joinDate}</div>
                  </div>
                  
                  <div className="quick-stat-card rounded-2xl p-3 pixel-shadow text-white" style={{ background: 'var(--color-secondary)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-90">Balance</div>
                    <div className="text-xs font-bold">${userInfo.balance.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="px-4 mb-3">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm pixel-shadow">
                  <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ 
                        background: theme === 'dark' ? 'var(--color-primary)' : '#F8B400'
                      }}>
                        {theme === 'dark' ? (
                          <Moon className="w-4 h-4 text-white" />
                        ) : (
                          <Sun className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-[var(--text-primary)] text-sm font-medium">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </div>
                    <div className="w-12 h-6 rounded-full transition-colors relative" style={{
                      background: theme === 'dark' ? 'var(--primary)' : 'var(--border-primary)'
                    }}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Settings Sections */}
              <div className="px-4 space-y-3">
                {/* Account Settings */}
                <div>
                  <h3 className="text-[var(--text-primary)] mb-2 uppercase tracking-wider text-xs font-bold">Account Settings</h3>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm pixel-shadow">
                    <button
                      onClick={() => setGeneralSettingsOpen(true)}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border-color)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[var(--text-primary)] text-sm font-medium">General Settings</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    
                    <button
                      onClick={() => setNotificationsOpen(true)}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border-color)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-secondary)' }}>
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[var(--text-primary)] text-sm font-medium">Notifications</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    
                    <button
                      onClick={() => setPrivacyOpen(true)}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--success)' }}>
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[var(--text-primary)] text-sm font-medium">Privacy & Security</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>

                {/* Support */}
                <div>
                  <h3 className="text-[var(--text-primary)] mb-2 uppercase tracking-wider text-xs font-bold">Support</h3>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm pixel-shadow">
                    <button
                      onClick={() => setHelpCenterOpen(true)}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--warning)' }}>
                          <HelpCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[var(--text-primary)] text-sm font-medium">Help Center</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>

                {/* Logout */}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 p-3 rounded-3xl text-white transition-colors shadow-sm pixel-shadow font-bold"
                  style={{ background: 'var(--danger)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <EditProfileModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} />
      <GeneralSettingsModal isOpen={generalSettingsOpen} onClose={() => setGeneralSettingsOpen(false)} />
      <NotificationsSettingsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <PrivacySettingsModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <HelpCenterModal isOpen={helpCenterOpen} onClose={() => setHelpCenterOpen(false)} />
    </div>
  );
}
