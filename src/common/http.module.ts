import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get('GITHUB_API_URL') ?? 'https://api.github.com',
        timeout: 10_000,
        maxRedirects: 3,
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'redcare-github-api',
          ...(config.get('GITHUB_TOKEN')
            ? { Authorization: `Bearer ${config.get('GITHUB_TOKEN')}` }
            : {}),
        },
      }),
    }),
  ],
  exports: [HttpModule],
})
export class CustomHttpModule {}
