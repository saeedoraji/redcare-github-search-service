import { PopularityConfig } from './popularity.config';

export interface PopularityStrategy {
  config: PopularityConfig;
  score(input: {
    stars: number;
    forks: number;
    daysSinceUpdate: number;
    archived?: boolean;
    repoAgeDays?: number | null;
  }): number;
}
