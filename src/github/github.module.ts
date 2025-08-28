import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { CustomHttpModule } from '../common/http.module';

@Module({
  imports: [CustomHttpModule],
  controllers: [GithubController],
  providers: [GithubService],
})
export class GithubModule {}
