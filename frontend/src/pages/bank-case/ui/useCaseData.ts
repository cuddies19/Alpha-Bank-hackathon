import { useOutletContext } from 'react-router';
import type { ApplicationCase } from '@/entities/application';

export function useCaseData() {
  return useOutletContext<ApplicationCase>();
}
