import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Languages,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Menu,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUiStore } from '@/store/ui-store';
import { useCurrentUser, useLogout } from '@/features/auth/useAuth';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/domain';

/** Dashboard shell — quick add, extra nav routes, and alerts are added in later commits. */
export const DashboardLayout = () => {
  const t = useT();
  const navigate = useNavigate();
  const { theme, language, toggleTheme, setLanguage } = useUiStore();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [{ to: '/app', label: t('nav.dashboard'), icon: LayoutDashboard, end: true }];

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast.success(t('toast.signedOut'));
    navigate('/login', { replace: true });
  };

  const openQuickAdd = (_initialType: TransactionType = 'EXPENSE') => {
    /* wired when transactions UI lands */
  };

  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', esc);
    };
  }, [profileOpen]);

  const modeLabel = user?.userMode ? t(`user.mode.${user.userMode}`) : '';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? '?');

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-on-primary"
      >
        Skip to content
      </a>

      <aside
        aria-label="Primary"
        className={cn(
          'fixed lg:static inset-y-0 start-0 z-40 w-64 bg-surface-high lg:bg-surface-low',
          'transition-transform duration-300 ease-quintessential',
          navOpen
            ? 'translate-x-0'
            : isRtl
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0',
          'flex flex-col p-5',
        )}
      >
        <div className="flex items-center gap-2 font-display font-bold text-lg tracking-tight mb-8">
          <span
            aria-hidden
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary"
          >
            <Sparkles size={18} strokeWidth={1.8} />
          </span>
          {t('app.name')}
        </div>

        <nav aria-label={t('nav.dashboard')} className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-quintessential focus-ring',
                  isActive
                    ? 'bg-surface-lowest text-ink shadow-ambient'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-lowest/60',
                )
              }
            >
              <Icon size={18} strokeWidth={1.5} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          aria-hidden
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-md border-b border-outline/20">
          <div className="flex items-center justify-between gap-3 px-4 lg:px-8 py-3">
            <button
              onClick={() => setNavOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-high focus-ring"
              aria-label="Open menu"
            >
              <Menu size={20} aria-hidden />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="h-9 w-9 rounded-lg bg-surface-high hover:bg-surface-highest flex items-center justify-center text-ink-muted hover:text-ink transition-colors focus-ring"
                aria-label="Toggle language"
                title={language === 'en' ? 'العربية' : 'English'}
              >
                <Languages size={16} aria-hidden />
              </button>
              <button
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg bg-surface-high hover:bg-surface-highest flex items-center justify-center text-ink-muted hover:text-ink transition-colors focus-ring"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
              </button>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 h-9 ps-1 pe-2 rounded-lg bg-surface-high hover:bg-surface-highest transition-colors focus-ring"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center text-[10px] font-bold">
                    {initials}
                  </span>
                  <span className="hidden md:block text-sm font-medium text-ink truncate max-w-[120px]">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={12} className="text-ink-muted" aria-hidden />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute end-0 mt-2 w-64 rounded-2xl bg-surface-lowest border border-outline/30 shadow-ambient backdrop-blur-xl animate-fade-in z-50"
                  >
                    <div className="px-4 py-3 border-b border-outline/30">
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user?.name ?? user?.email}</p>
                          <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                            <UserIcon size={9} aria-hidden />
                            {modeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:text-danger hover:bg-danger/5 transition-colors focus-ring"
                      >
                        <LogOut size={16} strokeWidth={1.5} aria-hidden />
                        {t('nav.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 px-4 lg:px-8 py-4 lg:py-6">
          <Outlet context={{ openQuickAdd }} />
        </main>
      </div>
    </div>
  );
};
