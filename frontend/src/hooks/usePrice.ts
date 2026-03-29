import { useQuery } from '@tanstack/react-query';
import { priceOptions } from '../queries/miningQueries';

export type { PriceData } from '../queries/miningQueries';

export function usePrice() {
  return useQuery(priceOptions);
}
