import { Inject, Injectable } from '@nestjs/common';
import { POPULARITY_STRATEGY } from './popularity.tokens';
import type { PopularityStrategy } from './popularity.strategy';
import { PopularityConfig } from './popularity.config';

@Injectable()
export class PopularityScoringService {
  constructor(
    @Inject(POPULARITY_STRATEGY) private readonly strategy: PopularityStrategy,
  ) {}

  scoreRepo(input: {
    stars: number;
    forks: number;
    daysSinceUpdate: number;
    archived?: boolean;
    repoAgeDays?: number | null;
  }): { score: number; cfg: PopularityConfig } {
    return { score: this.strategy.score(input), cfg: this.strategy.config };
  }
}
