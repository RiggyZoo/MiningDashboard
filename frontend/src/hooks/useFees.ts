import { useQuery } from '@tanstack/react-query';
import { feesOptions } from '../queries/miningQueries';

export type { FeesData } from '../queries/miningQueries';

export function useFees() {
  return useQuery(feesOptions);
}
