import { useQuery } from '@tanstack/react-query';
import { difficultyOptions } from '../queries/miningQueries';

export type { DifficultyData } from '../queries/miningQueries';

export function useDifficulty() {
  return useQuery(difficultyOptions);
}
