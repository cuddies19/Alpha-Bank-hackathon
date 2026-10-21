import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Stepper.module.css';

export interface StepperStep {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cx(styles.stepper, className)} aria-label={`Шаг ${current + 1} из ${steps.length}`}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li
            key={step.label}
            className={cx(styles.step, styles[state])}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.marker} aria-hidden="true">
              {state === 'done' ? <Icon name="check" size={16} /> : i + 1}
            </span>
            <span className={styles.text}>
              <span className={cx('body-strong', styles.label)}>{step.label}</span>
              {step.description ? <span className={cx('body-sm', styles.description)}>{step.description}</span> : null}
              <span className="sr-only">
                {state === 'done' ? ' — готово' : state === 'current' ? ' — текущий шаг' : ''}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
