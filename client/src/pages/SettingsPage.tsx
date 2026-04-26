import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, Moon, Save, Sun } from 'lucide-react';
import { useCurrentUser, useLogout, useUpdatePreferences } from '@/features/auth/useAuth';
import { useT } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import { SUPPORTED_CURRENCIES, useFormatCurrency } from '@/lib/format';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Combobox } from '@/components/Combobox';
import { Skeleton } from '@/components/Skeleton';
import { extractErrorMessage } from '@/lib/api';
import type { Language, Theme, UserMode } from '@/types/domain';

const USER_MODES: UserMode[] = ['FREELANCER', 'ECOMMERCE', 'SERVICE_BUSINESS'];
const LANGUAGES: Language[] = ['en', 'ar'];
const THEMES: Theme[] = ['light', 'dark'];

export const SettingsPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const update = useUpdatePreferences();
  const logout = useLogout();
  const formatCurrency = useFormatCurrency();
  const setLanguage = useUiStore((s) => s.setLanguage);
  const setTheme = useUiStore((s) => s.setTheme);

  const [name, setName] = useState('');
  const [userMode, setUserMode] = useState<UserMode>('FREELANCER');
  const [language, setLang] = useState<Language>('en');
  const [theme, setLocalTheme] = useState<Theme>('light');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setUserMode(user.userMode);
    setLang(user.language);
    setLocalTheme(user.theme);
    setCurrency(user.currency ?? 'USD');
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await update.mutateAsync({ name: name.trim() || undefined, userMode });
      toast.success(t('settings.profile.saved'));
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const handleLanguage = async (next: Language) => {
    setLang(next);
    setLanguage(next);
    try {
      await update.mutateAsync({ language: next });
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const handleTheme = async (next: Theme) => {
    setLocalTheme(next);
    setTheme(next);
    try {
      await update.mutateAsync({ theme: next });
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const handleCurrency = async (next: string) => {
    setCurrency(next);
    try {
      await update.mutateAsync({ currency: next });
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const handleSignOut = async () => {
    await logout.mutateAsync();
    toast.success(t('toast.signedOut'));
    navigate('/login', { replace: true });
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-6 max-w-3xl" aria-busy>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-ink-muted mt-1">{t('settings.subtitle')}</p>
      </header>

      <section className="card space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {t('settings.profile')}
          </h2>
          <p className="text-sm text-ink-muted mt-0.5">{t('settings.profile.subtitle')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('settings.profile.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Input
            label={t('settings.profile.email')}
            value={user.email}
            disabled
            readOnly
          />
        </div>

        <Combobox
          label={t('settings.profile.userMode')}
          value={userMode}
          onChange={(v) => setUserMode(v as UserMode)}
          options={USER_MODES.map((m) => ({
            value: m,
            label: t(`auth.register.modes.${m}`),
          }))}
        />

        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} loading={update.isPending}>
            <Save size={15} aria-hidden />
            {t('settings.profile.save')}
          </Button>
        </div>
      </section>

      <section className="card space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {t('settings.appearance')}
          </h2>
          <p className="text-sm text-ink-muted mt-0.5">{t('settings.appearance.subtitle')}</p>
        </div>

        <div>
          <p className="stat-label mb-2">{t('settings.theme')}</p>
          <div role="radiogroup" className="inline-flex p-1 rounded-xl bg-surface-high">
            {THEMES.map((mode) => {
              const active = theme === mode;
              const Icon = mode === 'light' ? Sun : Moon;
              return (
                <button
                  key={mode}
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleTheme(mode)}
                  className={`h-9 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 focus-ring ${
                    active
                      ? 'bg-surface-lowest text-ink shadow-ambient'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Icon size={13} aria-hidden />
                  {t(`settings.theme.${mode}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="stat-label mb-2">{t('settings.language')}</p>
          <div role="radiogroup" className="inline-flex p-1 rounded-xl bg-surface-high">
            {LANGUAGES.map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleLanguage(lang)}
                  className={`h-9 px-4 rounded-lg text-xs font-medium transition-all duration-200 focus-ring ${
                    active
                      ? 'bg-surface-lowest text-ink shadow-ambient'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {t(`settings.language.${lang}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="stat-label mb-2">{t('settings.currency')}</p>
          <Combobox
            value={currency}
            onChange={handleCurrency}
            options={SUPPORTED_CURRENCIES.map((c) => ({
              value: c.code,
              label: c.label,
            }))}
          />
          <p className="text-xs text-ink-muted mt-2">
            {t('settings.currency.helper')}{' '}
            <span className="tabular-nums font-medium">{formatCurrency(1234.56)}</span>
          </p>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">{t('settings.danger')}</h2>
        <Button variant="danger" onClick={handleSignOut} loading={logout.isPending}>
          <LogOut size={15} aria-hidden />
          {t('settings.danger.signOut')}
        </Button>
      </section>
    </div>
  );
};
