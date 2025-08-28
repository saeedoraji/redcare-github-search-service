import { Test, TestingModule } from '@nestjs/testing';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { SearchReposDto } from './dto/search-repos.dto';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('GithubController (unit)', () => {
  let githubController: GithubController;
  let githubService: GithubService;

  beforeEach(async () => {
    const mockGithubService = {
      searchRepositories: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('300'),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const githubModule: TestingModule = await Test.createTestingModule({
      controllers: [GithubController],
      providers: [
        { provide: GithubService, useValue: mockGithubService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    githubController = githubModule.get<GithubController>(GithubController);
    githubService = githubModule.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(githubController).toBeDefined();
  });

  describe('search', () => {
    it('should call githubService.searchRepositories with dto and return result', async () => {
      const fakeDto = new SearchReposDto();
      fakeDto.q = 'nestjs';
      fakeDto.language = 'TypeScript';

      const fakeResult = { total_count: 1, items: [{ id: 1, name: 'repo' }] };
      (githubService.searchRepositories as jest.Mock).mockResolvedValue(
        fakeResult,
      );

      const result = await githubController.search(fakeDto);

      expect(githubService.searchRepositories).toHaveBeenCalledWith(fakeDto);
      expect(result).toBe(fakeResult);
    });
  });
});
