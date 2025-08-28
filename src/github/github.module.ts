import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { CustomHttpModule } from '../common/http.module';
import {
  POPULARITY_CONFIG,
  POPULARITY_STRATEGY,
} from './scoring/popularity.tokens';
import { PopularityScoringService } from './scoring/popularity-scoring.service';
import {
  defaultPopularityConfig,
  PopularityConfig,
} from './scoring/popularity.config';
import { ConfigService } from '@nestjs/config';
import { DefaultPopularityStrategy } from './scoring/default-popularity.strategy';

@Module({
  imports: [CustomHttpModule],
  controllers: [GithubController],
  providers: [
    GithubService,
    PopularityScoringService,
    {
      provide: POPULARITY_CONFIG,
      useFactory: (cfg: ConfigService): PopularityConfig => {
        // Optionally read env overrides; fall back to defaults.
        return {
          ...defaultPopularityConfig,
          HALF_LIFE_DAYS: parseInt(
            cfg.get<string>('HALF_LIFE_DAYS') ?? '90',
            10,
          ),
        };
      },
      inject: [ConfigService],
    },
    {
      provide: POPULARITY_STRATEGY,
      useFactory: (cfg: PopularityConfig) => new DefaultPopularityStrategy(cfg),
      inject: [POPULARITY_CONFIG],
    },
  ],
})
export class GithubModule {}
