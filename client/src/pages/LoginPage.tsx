import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useLogin } from '@/features/auth/useAuth';
import { extractErrorMessage } from '@/lib/api';
import { useT } from '@/lib/i18n';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type FormData = z.infer<typeof Schema>;

export const LoginPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(Schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login.mutateAsync(data);
      toast.success(t('toast.signedIn'));
      navigate(location.state?.from ?? '/app', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-2 mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight">{t('auth.login.title')}</h2>
        <p className="text-ink-muted">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('fields.email')}
          type="email"
          autoComplete="email"
          leadingIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('fields.password')}
          type="password"
          autoComplete="current-password"
          leadingIcon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" loading={login.isPending} className="w-full mt-2">
          {t('auth.login.submit')}
        </Button>
      </form>

      <p className="text-sm text-ink-muted mt-6 text-center">
        {t('auth.login.toRegister')}{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          {t('auth.login.toRegisterCta')}
        </Link>
      </p>
    </AuthLayout>
  );
};
