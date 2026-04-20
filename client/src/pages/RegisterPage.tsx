import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { useRegister } from '@/features/auth/useAuth';
import { extractErrorMessage } from '@/lib/api';
import { useT } from '@/lib/i18n';

const Schema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
  userMode: z.enum(['FREELANCER', 'ECOMMERCE', 'SERVICE_BUSINESS']),
});
type FormData = z.infer<typeof Schema>;

export const RegisterPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const reg = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { userMode: 'FREELANCER' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await reg.mutateAsync(data);
      toast.success('Account created. Welcome!');
      navigate('/app', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-2 mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          {t('auth.register.title')}
        </h2>
        <p className="text-ink-muted">{t('auth.register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('fields.name')}
          autoComplete="name"
          leadingIcon={<UserIcon size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />
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
          autoComplete="new-password"
          leadingIcon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />
        <Select
          label={t('auth.register.userMode')}
          error={errors.userMode?.message}
          {...register('userMode')}
          options={[
            { value: 'FREELANCER', label: t('auth.register.modes.FREELANCER') },
            { value: 'ECOMMERCE', label: t('auth.register.modes.ECOMMERCE') },
            { value: 'SERVICE_BUSINESS', label: t('auth.register.modes.SERVICE_BUSINESS') },
          ]}
        />
        <Button type="submit" size="lg" loading={reg.isPending} className="w-full mt-2">
          {t('auth.register.submit')}
        </Button>
      </form>

      <p className="text-sm text-ink-muted mt-6 text-center">
        {t('auth.register.toLogin')}{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          {t('auth.register.toLoginCta')}
        </Link>
      </p>
    </AuthLayout>
  );
};
