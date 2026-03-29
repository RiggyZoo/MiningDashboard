import { useQuery } from '@tanstack/react-query';
import { hashrateOptions } from '../queries/miningQueries';

export type { HashrateData } from '../queries/miningQueries';

export function useHashrate() {
  return useQuery(hashrateOptions);
}
