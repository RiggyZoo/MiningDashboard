import { queryOptions } from '@tanstack/react-query';
import { miningClient } from '../grpcClient';

export interface FeesData {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
}

export interface PriceData {
  usd: number;
}

export interface HashrateData {
  currentHashrate: number;
  currentDifficulty: number;
}

export interface DifficultyData {
  progressPercent: number;
  difficultyChange: number;
  estimatedRetarget: bigint;
  remainingBlocks: number;
  nextRetargetHeight: number;
  previousRetarget: number;
}


export const feesOptions = queryOptions<FeesData>({
  queryKey: ['fees'],
  queryFn: async () => {
    const resp = await miningClient.getFees({});
    return {
      fastestFee:  resp.fastestFee,
      halfHourFee: resp.halfHourFee,
      hourFee:     resp.hourFee,
      economyFee:  resp.economyFee,
    };
  },
  refetchInterval: (query) =>
    query.state.status === 'error' ? 10_000 : 30_000,
  refetchIntervalInBackground: true,
});

export const priceOptions = queryOptions<PriceData>({
  queryKey: ['price'],
  queryFn: async () => {
    const resp = await miningClient.getPrice({});
    return { usd: resp.usd };
  },
  refetchInterval: (query) =>
    query.state.status === 'error' ? 10_000 : 30_000,
  refetchIntervalInBackground: true,
});

export const hashrateOptions = queryOptions<HashrateData>({
  queryKey: ['hashrate'],
  queryFn: async () => {
    const resp = await miningClient.getHashrate({});
    return {
      currentHashrate:   resp.currentHashrate,
      currentDifficulty: resp.currentDifficulty,
    };
  },
  refetchInterval: (query) =>
    query.state.status === 'error' ? 15_000 : 60_000,
  refetchIntervalInBackground: true,
});

export const difficultyOptions = queryOptions<DifficultyData>({
  queryKey: ['difficulty'],
  queryFn: async () => {
    const resp = await miningClient.getDifficulty({});
    return {
      progressPercent:    resp.progressPercent,
      difficultyChange:   resp.difficultyChange,
      estimatedRetarget:  resp.estimatedRetarget,
      remainingBlocks:    resp.remainingBlocks,
      nextRetargetHeight: resp.nextRetargetHeight,
      previousRetarget:   resp.previousRetarget,
    };
  },
  refetchInterval: (query) =>
    query.state.status === 'error' ? 15_000 : 60_000,
  refetchIntervalInBackground: true,
});
