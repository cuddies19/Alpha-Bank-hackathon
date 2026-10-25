import { Link } from 'react-router';
import type { AuditEvent, AuditField, AuditKind, AuditTone } from '@/entities/audit';
import { routes } from '@/shared/config';
import { cx, plural } from '@/shared/lib';
import { Avatar, Drawer, Icon, type IconName } from '@/shared/ui';
import styles from './AuditDetails.module.css';

const KIND_ICON: Record<AuditKind, IconName> = {
  created: 'document',
  updated: 'document',
  taken: 'user',
  decision: 'check-circle',
  document: 'upload',
  status: 'clock',
  other: 'list',
};

const ROLE_TITLE: Record<AuditEvent['actor'], string> = {
  system: 'Система',
  staff: 'Сотрудник банка',
  client: 'Клиент',
};

function initials(name: string) {
  return name
    .replace(/[«»"]/g, '')
    .replace(/^(ООО|ИП|АО|ПАО)\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function Value({ value, tone, muted }: { value: string; tone?: AuditTone; muted?: boolean }) {
  if (tone) return <span className={cx(styles.pill, styles[tone], muted && styles.pillMuted)}>{value}</span>;
  return <span className={muted ? styles.before : undefined}>{value}</span>;
}

function FieldValue({ field }: { field: AuditField }) {
  const after = field.after ?? (field.before !== undefined ? 'удалено' : '—');
  if (field.before === undefined) return <Value value={after} tone={field.afterTone} />;
  return (
    <span className={styles.diff}>
      <Value value={field.before} tone={field.beforeTone} muted />
      <Icon name="chevron-right" size={16} className={styles.diffArrow} />
      <span className="sr-only">изменено на</span>
      <Value value={after} tone={field.afterTone} />
    </span>
  );
}

export function AuditFields({ event }: { event: AuditEvent }) {
  const short = event.details.filter((f) => !f.long);
  const long = event.details.filter((f) => f.long);

  if (!event.details.length) {
    return <p className={styles.empty}>Поля заявки не менялись — записан только сам факт действия.</p>;
  }

  return (
    <div className={styles.changes}>
      {short.length ? (
        <dl className={styles.table}>
          {short.map((field, index) => (
            <div key={index} className={styles.row}>
              <dt className={styles.term}>{field.label}</dt>
              <dd className={styles.value}>
                <FieldValue field={field} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {long.map((field, index) => (
        <section key={index} className={styles.note}>
          <h4 className={styles.term}>{field.label}</h4>
          {field.before !== undefined ? <p className={cx(styles.noteText, styles.before)}>{field.before}</p> : null}
          <p className={styles.noteText}>{field.after ?? 'удалено'}</p>
        </section>
      ))}
    </div>
  );
}

export interface AuditDrawerProps {
  event: AuditEvent | undefined;
  onClose: () => void;
}

export function AuditDrawer({ event, onClose }: AuditDrawerProps) {
  const count = event?.details.length ?? 0;
  return (
    <Drawer
      open={Boolean(event)}
      onClose={onClose}
      title={event?.action}
      subtitle={event?.time}
      leading={
        event ? (
          <span className={cx(styles.kind, styles[`kind-${event.kind}`])} aria-hidden="true">
            <Icon name={KIND_ICON[event.kind]} size={20} />
          </span>
        ) : null
      }
      closeLabel="Закрыть подробности"
    >
      {event ? (
        <>
          <div className={styles.parties}>
            <div className={styles.actor}>
              <Avatar>{event.actor === 'system' ? <Icon name="shield" size={20} /> : initials(event.who)}</Avatar>
              <div className={styles.actorText}>
                <span className={styles.actorName}>{event.who}</span>
                <span className={styles.secondary}>{ROLE_TITLE[event.actor]}</span>
              </div>
            </div>
            {event.applicationRef ? (
              <Link className={styles.application} to={routes.bank.application(event.applicationRef)}>
                <span className={styles.applicationText}>
                  <span className={styles.secondary}>Заявка</span>
                  <span className={styles.applicationNumber}>{event.applicationId}</span>
                </span>
                <Icon name="chevron-right" size={20} className={styles.applicationArrow} />
              </Link>
            ) : (
              <div className={cx(styles.application, styles.applicationStatic)}>
                <span className={styles.applicationText}>
                  <span className={styles.secondary}>Заявка</span>
                  <span className={styles.applicationNumber}>не привязана</span>
                </span>
              </div>
            )}
          </div>

          <section className={styles.section} aria-labelledby="audit-changes-title">
            <h3 id="audit-changes-title" className={styles.sectionTitle}>
              Что изменилось
              {count ? (
                <span className={styles.count}>
                  {count} {plural(count, ['поле', 'поля', 'полей'])}
                </span>
              ) : null}
            </h3>
            <AuditFields event={event} />
          </section>
        </>
      ) : null}
    </Drawer>
  );
}
