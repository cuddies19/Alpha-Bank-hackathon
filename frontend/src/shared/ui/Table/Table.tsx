import { useLayoutEffect, useRef, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Table.module.css';

export interface TableProps {
  dense?: boolean;
  plain?: boolean;
  flat?: boolean;
  caption?: string;
  footer?: ReactNode;
  desktopOnly?: boolean;
  children: ReactNode;
  className?: string;
}

function labelCells(table: HTMLTableElement) {
  const headers = [...table.querySelectorAll('thead th')].map((th) => th.textContent?.trim() ?? '');
  const hidden = [...table.querySelectorAll('thead th')].map((th) => Boolean(th.querySelector('.sr-only')));
  for (const row of table.querySelectorAll('tbody tr')) {
    [...row.children].forEach((cell, i) => {
      const label = hidden[i] ? '' : (headers[i] ?? '');
      if (cell.getAttribute('data-label') !== label) cell.setAttribute('data-label', label);
    });
  }
}

export function Table({ dense, plain, flat, caption, footer, desktopOnly, children, className }: TableProps) {
  const ref = useRef<HTMLTableElement>(null);
  useLayoutEffect(() => {
    if (ref.current) labelCells(ref.current);
  });
  return (
    <div className={cx(styles.wrap, flat && styles.flat, desktopOnly && styles.desktopOnly, className)}>
      <table ref={ref} className={cx(styles.table, dense && styles.dense, plain && styles.plain)}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
      {footer}
    </div>
  );
}

type Align = 'left' | 'right';

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  srOnly?: boolean;
}

export function Th({ align, srOnly, className, children, scope = 'col', ...rest }: ThProps) {
  return (
    <th scope={scope} className={cx(styles.th, align === 'right' && styles.right, className)} {...rest}>
      {srOnly ? <span className="sr-only">{children}</span> : children}
    </th>
  );
}

export function RowHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th scope="row" className={cx(styles.rowHeader, className)}>
      {children}
    </th>
  );
}

export interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  nowrap?: boolean;
  tone?: 'default' | 'secondary';
  strong?: boolean;
  shrink?: boolean;
}

export function Td({ align, nowrap, tone, strong, shrink, className, ...rest }: TdProps) {
  return (
    <td
      className={cx(
        styles.td,
        align === 'right' && styles.right,
        nowrap && styles.nowrap,
        tone === 'secondary' && styles.secondary,
        strong && styles.strong,
        shrink && styles.shrink,
        className,
      )}
      {...rest}
    />
  );
}

export interface TrProps {
  tone?: 'default' | 'new' | 'muted';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export function Tr({ tone = 'default', selected, onClick, className, children }: TrProps) {
  return (
    <tr
      className={cx(
        tone === 'new' && styles.new,
        tone === 'muted' && styles.muted,
        selected && styles.selected,
        onClick && styles.interactive,
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function CellStack({ main, sub, strong = true }: { main: ReactNode; sub?: ReactNode; strong?: boolean }) {
  return (
    <span className={styles.stack}>
      <span className={strong ? styles.main : undefined}>{main}</span>
      {sub ? <span className={styles.sub}>{sub}</span> : null}
    </span>
  );
}

export function RowLink(props: LinkProps) {
  return <Link {...props} className={styles.rowLink} />;
}

export interface SortButtonProps {
  active?: boolean;
  direction?: 'asc' | 'desc';
  onClick?: () => void;
  children: ReactNode;
}

export function SortButton({ active, direction = 'asc', onClick, children }: SortButtonProps) {
  return (
    <button
      type="button"
      className={cx(styles.sort, active && styles.sortOn)}
      onClick={onClick}
      aria-label={active ? `${children}, ${direction === 'asc' ? 'по возрастанию' : 'по убыванию'}` : undefined}
    >
      {children}
      {active ? <Icon name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} /> : null}
    </button>
  );
}

export interface PagerProps {
  summary: ReactNode;
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

const MAX_PLAIN_PAGES = 5;

function pageList(page: number, pages: number): Array<number | 'gap'> {
  if (pages <= MAX_PLAIN_PAGES) return Array.from({ length: pages }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((n) => n > 1 && n < pages);
  const list: Array<number | 'gap'> = [1];
  if (around[0] > 2) list.push('gap');
  list.push(...around);
  if (around[around.length - 1] < pages - 1) list.push('gap');
  list.push(pages);
  return list;
}

export function Pager({ summary, page, pages, onChange }: PagerProps) {
  return (
    <div className={styles.pager}>
      <span>{summary}</span>
      <div className={styles.pages}>
        <button
          type="button"
          className={styles.page}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Предыдущая страница"
        >
          ‹
        </button>
        {pageList(page, pages).map((n, index) =>
          n === 'gap' ? (
            <span key={`gap-${index}`} className={styles.pageGap} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              className={cx(styles.page, n === page && styles.pageOn)}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          className={styles.page}
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Следующая страница"
        >
          ›
        </button>
      </div>
    </div>
  );
}
