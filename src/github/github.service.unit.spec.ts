import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { GithubService } from './github.service';
import { of, throwError } from 'rxjs';
import { defaultPopularityConfig } from './scoring/popularity.config';
import { PopularityScoringService } from './scoring/popularity-scoring.service';
import { SearchReposDto } from './dto/search-repos.dto';

describe.only('GithubService', () => {
  let serviceUnderTest: GithubService;
  let http: any;
  let scoring: any;

  beforeEach(async () => {
    scoring = {
      scoreRepo: jest.fn().mockReturnValue({
        score: 42,
        score_details: defaultPopularityConfig,
      }),
    };

    const githubModule: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        GithubService,
        { provide: PopularityScoringService, useValue: scoring },
      ],
    }).compile();

    serviceUnderTest = githubModule.get(GithubService);
    http = githubModule.get<HttpService>(HttpService);
  });

  it('builds query and returns data with enriched items', async () => {
    const fakeItems = [
      {
        id: 1,
        stargazers_count: 10,
        forks_count: 2,
        pushed_at: new Date().toISOString(),
        created_at: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 10,
        ).toISOString(),
        archived: false,
      },
    ];
    jest.spyOn(http, 'get').mockReturnValueOnce(
      of({
        data: {
          total_count: 1,
          incomplete_results: false,
          items: fakeItems,
        },
      }),
    );

    const data = await serviceUnderTest.searchRepositories({
      q: 'nestjs',
      language: 'TypeScript',
      license: 'mit',
      min_stars: 5,
      pushed_after: '2023-01-01',
      sort: 'stars',
      order: 'desc',
      per_page: 10,
      page: 2,
    } as SearchReposDto);

    expect(data.total_count).toBe(1);
    expect(data.items[0].popularity_score.score).toBe(42);
    expect(scoring.scoreRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        stars: 10,
        forks: 2,
        archived: false,
        repoAgeDays: expect.any(Number),
        daysSinceUpdate: expect.any(Number),
      }),
    );
  });

  it('throws with message on error', async () => {
    jest
      .spyOn(http, 'get')
      .mockReturnValueOnce(
        throwError(() => ({ response: { data: { message: 'Boom' } } })),
      );

    await expect(
      serviceUnderTest.searchRepositories({ q: 'x' } as SearchReposDto),
    ).rejects.toThrow('Boom');
  });

  it('throws with fallback message if error has no response', async () => {
    jest
      .spyOn(http, 'get')
      .mockReturnValueOnce(throwError(() => new Error('Network error')));

    await expect(
      serviceUnderTest.searchRepositories({ q: 'x' } as SearchReposDto),
    ).rejects.toThrow('Network error');
  });

  describe('enrichWithScore', () => {
    it('calculates score and returns enriched repo', () => {
      const repo = {
        stargazers_count: 5,
        forks_count: 1,
        pushed_at: new Date().toISOString(),
        archived: true,
        created_at: new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 30,
        ).toISOString(),
      };
      const result = serviceUnderTest.enrichWithScore(repo);
      expect(result.popularity_score.score).toBe(42);
      expect(scoring.scoreRepo).toHaveBeenCalledWith(
        expect.objectContaining({
          stars: 5,
          forks: 1,
          archived: true,
          repoAgeDays: expect.any(Number),
          daysSinceUpdate: expect.any(Number),
        }),
      );
    });

    it('handles missing created_at gracefully', () => {
      const repo = {
        stargazers_count: 3,
        forks_count: 0,
        pushed_at: new Date().toISOString(),
        archived: false,
      };
      const result = serviceUnderTest.enrichWithScore(repo);
      expect(result.popularity_score.score).toBe(42);
      expect(scoring.scoreRepo).toHaveBeenCalledWith(
        expect.objectContaining({
          stars: 3,
          forks: 0,
          archived: false,
          repoAgeDays: null,
          daysSinceUpdate: expect.any(Number),
        }),
      );
    });
  });
});
