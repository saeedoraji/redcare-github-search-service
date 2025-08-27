import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { CacheableMemory } from 'cacheable';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL') ?? 60_000,
            limit: config.get('THROTTLE_LIMIT') ?? 60,
            ignoreUserAgents: [/postman/i],
          },
        ],
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<CacheModuleOptions> => {
        const ttl = config.get('CACHE_TTL') ?? 60_000;
        const redisUrl = config.get<string>('REDIS_URL');
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl, lruSize: 5000 }),
            }),
            createKeyv(redisUrl),
          ],
        };
      },
    }),
  ],
})
export class AppModule {}
