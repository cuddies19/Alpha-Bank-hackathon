import { cx } from '@/shared/lib';
import { Badge, Icon } from '@/shared/ui';
import { bankStatus, clientStatus, RISK_TONE } from '../lib/status';
import type { Application, RiskClass, SlaLevel } from '../model/types';
import styles from './badges.module.css';

type StatusSource = Pick<Application, 'status' | 'closedReason'>;

export function ApplicationStatusBadge({ application }: { application: StatusSource }) {
  const { label, tone } = clientStatus(application);
  return <Badge tone={tone}>{label}</Badge>;
}

export function BankStatusBadge({ application }: { application: StatusSource }) {
  const { label, tone } = bankStatus(application);
  return <Badge tone={tone}>{label}</Badge>;
}

export function RiskClassBadge({
  riskClass,
  label,
  className,
}: {
  riskClass?: RiskClass;
  label?: string;
  className?: string;
}) {
  if (!riskClass)
    return (
      <Badge icon={false} className={className}>
        —
      </Badge>
    );
  return (
    <Badge tone={RISK_TONE[riskClass]} icon={false} className={className}>
      {label ?? riskClass}
    </Badge>
  );
}

export interface SlaBadgeProps {
  text: string;
  level: SlaLevel;
  prefix?: string;
}

export function SlaBadge({ text, level, prefix }: SlaBadgeProps) {
  const late = level === 'late';
  return (
    <span className={cx(styles.sla, level !== 'ok' && styles[level])} title="Время до нарушения SLA">
      <Icon name="clock" size={14} />
      {prefix && !late && text !== '—' ? `${prefix} ${text}` : text}
    </span>
  );
}
