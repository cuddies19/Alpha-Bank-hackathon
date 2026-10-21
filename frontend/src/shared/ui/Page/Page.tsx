import { useId, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cx } from '@/shared/lib';
import { Card, type CardProps } from '../Card';
import { Icon } from '../Icon';
import type { TextVariant } from '../Text';
import styles from './Page.module.css';

export interface BackLinkProps {
  to: string;
  children: ReactNode;
}

export function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link to={to} className={styles.back}>
      <Icon name="arrow-left" size={16} />
      {children}
    </Link>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  titleVariant?: Extract<TextVariant, 'display' | 'title-1' | 'title-2'>;
  description?: ReactNode;
  descriptionSize?: 'body' | 'body-lg';
  back?: BackLinkProps;
  badge?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  titleVariant = 'title-1',
  description,
  descriptionSize = 'body',
  back,
  badge,
  eyebrow,
  actions,
}: PageHeaderProps) {
  const heading = (
    <div className={styles.titles}>
      {eyebrow}
      <div className={styles.titleLine}>
        <h1 className={titleVariant}>{title}</h1>
        {badge}
      </div>
      {description ? <p className={cx(descriptionSize, styles.description)}>{description}</p> : null}
    </div>
  );
  return (
    <header className={styles.header}>
      {back ? <BackLink {...back} /> : null}
      {actions ? (
        <div className={styles.row}>
          {heading}
          {actions}
        </div>
      ) : (
        heading
      )}
    </header>
  );
}

export interface SectionProps extends Omit<CardProps, 'title'> {
  title?: ReactNode;
  headingLevel?: 2 | 3;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
}

export function Section({
  title,
  headingLevel = 2,
  eyebrow,
  subtitle,
  aside,
  gap = 4,
  children,
  as = 'section',
  ...rest
}: SectionProps) {
  const headingId = useId();
  const H = `h${headingLevel}` as const;
  return (
    <Card as={as} gap={gap} aria-labelledby={title ? headingId : undefined} {...rest}>
      {title ? (
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitles}>
            {eyebrow ? <span className={cx('caption', styles.eyebrow)}>{eyebrow}</span> : null}
            <H className="title-3" id={headingId}>
              {title}
            </H>
            {subtitle ? <span className={cx('body-sm', styles.subtitle)}>{subtitle}</span> : null}
          </div>
          {aside}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

export function SourceTag({ children, ai }: { children: ReactNode; ai?: boolean }) {
  return (
    <span className={cx(styles.tag, ai && styles.tagAi)}>
      {ai ? <Icon name="sparkle" size={14} /> : null}
      {children}
    </span>
  );
}

export function OrDivider({ children = 'или' }: { children?: ReactNode }) {
  return (
    <div className={cx('label', styles.divider)} aria-hidden="true">
      {children}
    </div>
  );
}

export interface PageContainerProps {
  width?: 'default' | 'narrow';
  spacing?: 'default' | 'tight' | 'flushTop' | 'roomyTop';
  children: ReactNode;
}

export function PageContainer({ width = 'default', spacing = 'default', children }: PageContainerProps) {
  return (
    <div
      className={cx(
        styles.container,
        width === 'narrow' && styles.narrow,
        spacing === 'tight' && styles.tight,
        spacing === 'flushTop' && cx(styles.tight, styles.flushTop),
        spacing === 'roomyTop' && styles.roomyTop,
      )}
    >
      {children}
    </div>
  );
}

export interface ColumnsProps {
  main: ReactNode;
  side: ReactNode;
  sideLabel?: string;
  mainBasis?: number;
  sideBasis?: number;
  fixedSide?: boolean;
  roomy?: boolean;
}

export function Columns({ main, side, sideLabel, mainBasis, sideBasis, fixedSide, roomy }: ColumnsProps) {
  const style = {
    ...(mainBasis ? { '--main-basis': `${mainBasis}px` } : {}),
    ...(sideBasis ? { '--side-basis': `${sideBasis}px` } : {}),
  } as CSSProperties;
  return (
    <div className={styles.columns} style={style}>
      <div className={cx(styles.main, roomy && styles.mainRoomy)}>{main}</div>
      <aside className={cx(styles.side, fixedSide && styles.sideFixed)} aria-label={sideLabel}>
        {side}
      </aside>
    </div>
  );
}
