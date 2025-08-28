import { PopularityScoringService } from './popularity-scoring.service';
import { DefaultPopularityStrategy } from './default-popularity.strategy';
import { defaultPopularityConfig } from './popularity.config';

describe('PopularityScoringService', () => {
  let serviceUnderTest: PopularityScoringService;
  let strategy: DefaultPopularityStrategy;

  beforeEach(() => {
    strategy = new DefaultPopularityStrategy(defaultPopularityConfig);
    serviceUnderTest = new PopularityScoringService(strategy);
  });

  it('delegates to strategy and returns score and config', () => {
    const input = {
      stars: 100,
      forks: 20,
      daysSinceUpdate: 5,
      archived: false,
      repoAgeDays: 50,
    };

    const result = serviceUnderTest.scoreRepo(input);

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('cfg');
    expect(result.score).toBe(strategy.score(input));
  });

  it('returns 0 score for archived repos', () => {
    const input = {
      stars: 1000,
      forks: 200,
      daysSinceUpdate: 2,
      archived: true,
      repoAgeDays: 100,
    };
    const result = serviceUnderTest.scoreRepo(input);
    expect(result.score).toBe(0);
  });

  it('Give a higher score to newer repositories with some stars than to older ones with an average number of stars', () => {
    const fresh = serviceUnderTest.scoreRepo({
      stars: 300,
      forks: 40,
      daysSinceUpdate: 0,
      archived: false,
      repoAgeDays: 10,
    }).score;
    const stale = serviceUnderTest.scoreRepo({
      stars: 2000,
      forks: 250,
      daysSinceUpdate: 400,
      archived: false,
      repoAgeDays: 1000,
    }).score;

    expect(fresh).toBeGreaterThan(stale);
  });
});
