import { PopularityConfig } from './popularity.config';
import { PopularityStrategy } from './popularity.strategy';

export class DefaultPopularityStrategy implements PopularityStrategy {
  config: PopularityConfig;
  constructor(private readonly cfg: PopularityConfig) {
    this.config = cfg;
  }

  score({
    stars,
    forks,
    daysSinceUpdate,
    archived = false,
    repoAgeDays = null,
  }: {
    stars: number;
    forks: number;
    daysSinceUpdate: number;
    archived?: boolean;
    repoAgeDays?: number | null;
  }): number {
    if (archived) return 0;

    const {
      S_CAP,
      F_CAP,
      HALF_LIFE_DAYS,
      weights,
      earlyMomentumBoost,
      earlyMomentumDays,
    } = this.cfg;

    const sCap = Math.min(stars, S_CAP);
    const fCap = Math.min(forks, F_CAP);

    const starsScore = Math.log1p(sCap) / Math.log1p(S_CAP);
    const forksScore = Math.log1p(fCap) / Math.log1p(F_CAP);

    const tau = HALF_LIFE_DAYS / Math.log(2);
    let recencyScore = Math.exp(-daysSinceUpdate / tau);

    if (repoAgeDays !== null && repoAgeDays < earlyMomentumDays) {
      recencyScore = Math.min(1, recencyScore * (1 + earlyMomentumBoost));
    }

    const score01 =
      weights.alpha * starsScore +
      weights.beta * forksScore +
      weights.gamma * recencyScore;
    this.config = {
      ...this.config,
      HALF_LIFE_DAYS,
      weights: {
        alpha: weights.alpha * starsScore,
        beta: weights.beta * forksScore,
        gamma: weights.gamma * recencyScore,
      },
      earlyMomentumBoost,
      earlyMomentumDays,
    };
    return Math.round(score01 * 1000) / 10;
  }
}
