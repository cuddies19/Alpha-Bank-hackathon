import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { sessionApi, useSession, type Persona, type Role } from '@/entities/session';
import { routes } from '@/shared/config';
import { cx } from '@/shared/lib';
import { Alert, Avatar, Badge, Button, CardSkeleton, SegmentedControl, Stack, TextField } from '@/shared/ui';
import styles from './LoginForm.module.css';

const DEMO_PASSWORD = 'demo-2026';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useSession();
  const personas = useQuery({ queryKey: ['personas'], queryFn: sessionApi.personas });

  const [role, setRole] = useState<Role>('client');
  const [login, setLogin] = useState('igor.sokolov');
  const [password, setPassword] = useState(DEMO_PASSWORD);

  const loginMutation = useMutation({
    mutationFn: () => sessionApi.login(login, password),
    onSuccess: (persona) => {
      signIn(persona);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(
        from && from.startsWith(persona.role === 'bank' ? routes.bank.queue() : routes.client.home())
          ? from
          : persona.home,
        {
          replace: true,
        },
      );
    },
  });

  const list = personas.data?.filter((p) => p.role === role) ?? [];

  const pick = (persona: Persona) => {
    setLogin(persona.login);
    setPassword(DEMO_PASSWORD);
    loginMutation.reset();
  };

  const changeRole = (next: Role) => {
    setRole(next);
    const first = personas.data?.find((p) => p.role === next);
    if (first) pick(first);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const error = loginMutation.error instanceof Error ? loginMutation.error.message : null;
  const layoutError = error === 'Похоже, включена русская раскладка';

  return (
    <form className={styles.card} onSubmit={onSubmit} noValidate>
      <h2 className="title-2">Вход</h2>
      <SegmentedControl
        label="Кто входит"
        value={role}
        onChange={changeRole}
        options={[
          { value: 'client', label: 'Клиент' },
          { value: 'bank', label: 'Сотрудник банка' },
        ]}
      />
      <Stack gap={2}>
        {personas.isPending ? (
          <CardSkeleton lines={2} />
        ) : (
          list.map((persona) => (
            <button
              key={persona.id}
              type="button"
              className={cx(styles.persona, persona.login === login && styles.selected)}
              aria-pressed={persona.login === login}
              onClick={() => pick(persona)}
            >
              <Avatar>{persona.initials}</Avatar>
              <span className={styles.personaText}>
                <span className="body-strong">{persona.name}</span>
                <span className={cx('body-sm', styles.secondary)}>{persona.org}</span>
              </span>
              <Badge tone={persona.outcomeTone} icon={false}>
                {persona.outcome}
              </Badge>
            </button>
          ))
        )}
      </Stack>
      {error && !layoutError ? (
        <Alert tone="danger" title={error}>
          Проверьте раскладку клавиатуры и попробуйте снова.
        </Alert>
      ) : null}
      <Stack gap={4}>
        <TextField
          label="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
          disabled={loginMutation.isPending}
          error={layoutError ? error : undefined}
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loginMutation.isPending}
        />
      </Stack>
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loginMutation.isPending}>
        {loginMutation.isPending ? 'Входим' : 'Войти'}
      </Button>
    </form>
  );
}
