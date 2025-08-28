import { PopularityConfig } from '../scoring/popularity.config';

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: { key: string; name: string } | null;
  owner: { login: string; avatar_url: string; html_url: string };
  updated_at: string;
  pushed_at: string;
  created_at: string;
  archived: boolean;
  popularity_score: {
    score: number;
    score_details: PopularityConfig;
  };
}

export interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepo[];
}
