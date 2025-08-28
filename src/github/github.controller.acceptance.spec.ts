import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('GithubController (acceptance)', () => {
  let app: INestApplication;
  let httpServiceMock: { get: jest.Mock };

  beforeAll(async () => {
    httpServiceMock = { get: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(httpServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/repos/search returns enriched search results', async () => {
    const fakeGithubResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          name: 'nestjs',
          full_name: 'nestjs/nest',
          html_url: 'https://github.com/nestjs/nest',
          description: 'A progressive Node.js framework',
          stargazers_count: 60000,
          language: 'TypeScript',
          forks_count: 7000,
          open_issues_count: 1000,
          license: { key: 'mit', name: 'MIT License' },
          owner: {
            login: 'nestjs',
            avatar_url: 'https://avatars.githubusercontent.com/u/28507035?v=4',
            html_url: 'https://github.com/nestjs',
          },
          updated_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
          created_at: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 365,
          ).toISOString(),
          archived: false,
        },
      ],
    };

    httpServiceMock.get.mockReturnValueOnce(of({ data: fakeGithubResponse }));

    const res = await request(app.getHttpServer())
      .get('/api/repos/search')
      .query({
        q: 'nestjs',
        language: 'TypeScript',
        sort: 'stars',
        order: 'desc',
        page: 1,
        per_page: 10,
      })
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body.total_count).toBe(1);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toHaveProperty('popularity_score');
    expect(res.body.items[0].popularity_score).toHaveProperty('score');
    expect(res.body.items[0].popularity_score).toHaveProperty('cfg');
  });

  it('GET /api/repos/search returns 400 when q is missing', async () => {
    await request(app.getHttpServer()).get('/api/repos/search').expect(400);
  });
});
