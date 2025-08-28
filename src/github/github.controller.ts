import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { GithubService } from './github.service';
import { SearchReposDto } from './dto/search-repos.dto';
import { ConfigService } from '@nestjs/config';

@Controller('repos')
@UseInterceptors(CacheInterceptor)
export class GithubController {
  private readonly cacheTtlSeconds: number;

  constructor(
    private readonly github: GithubService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.cacheTtlSeconds = parseInt(
      this.configService.get<string>('CACHE_TTL_SECONDS') || '300',
      10,
    );
  }

  // GET /api/repos/search?q=nestjs&language=TypeScript&sort=stars&order=desc&page=1&per_page=20
  @Get('search')
  @CacheKey('repos:search')
  @CacheTTL(function (this: GithubController) {
    return this.cacheTtlSeconds;
  })
  search(@Query() dto: SearchReposDto) {
    return this.github.searchRepositories(dto);
  }
}
