import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import qs from 'qs';
import type { SearchReposDto } from './dto/search-repos.dto';
import type { GithubSearchResponse } from './types/repo.interface';

@Injectable()
export class GithubService {
  constructor(private readonly http: HttpService) {}

  async searchRepositories(dto: SearchReposDto): Promise<GithubSearchResponse> {
    const qualifiers: string[] = [];
    if (dto.language) qualifiers.push(`language:${dto.language}`);
    if (dto.license) qualifiers.push(`license:${dto.license}`);
    if (dto.min_stars !== undefined)
      qualifiers.push(`stars:>=${dto.min_stars}`);
    if (dto.pushed_after) qualifiers.push(`pushed:>=${dto.pushed_after}`);

    const q = [dto.q, ...qualifiers].filter(Boolean).join(' ');

    const params = {
      q,
      sort: dto.sort ?? 'stars',
      order: dto.order ?? 'desc',
      per_page: dto.per_page ?? 20,
      page: dto.page ?? 1,
    };

    const url = `/search/repositories?${qs.stringify(params)}`;

    try {
      const res = await lastValueFrom(this.http.get<GithubSearchResponse>(url));
      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || 'GitHub request failed';
      throw new InternalServerErrorException(message);
    }
  }
}
