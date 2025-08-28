export interface PopularityConfig {
  S_CAP: number;
  F_CAP: number;
  HALF_LIFE_DAYS: number;
  weights: { alpha: number; beta: number; gamma: number };
  earlyMomentumBoost: number;
  earlyMomentumDays: number;
}

export const defaultPopularityConfig: PopularityConfig = {
  S_CAP: 10_000,
  F_CAP: 3_000,
  HALF_LIFE_DAYS: 90,
  weights: { alpha: 0.55, beta: 0.25, gamma: 0.2 },
  earlyMomentumBoost: 0.1,
  earlyMomentumDays: 30,
};
