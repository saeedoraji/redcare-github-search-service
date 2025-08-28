import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'WithinGithubSearchWindow', async: false })
class WithinGithubSearchWindow implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as SearchReposDto;
    const perPage = dto.per_page ?? 20;
    const page = dto.page ?? 1;
    return (page - 1) * perPage < 1000;
  }

  defaultMessage(): string {
    return 'Only the first 1000 search results are available';
  }
}

export class SearchReposDto {
  @IsString()
  @Transform(({ value }) => String(value).trim())
  q!: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  license?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_stars?: number;

  @IsOptional()
  @IsString()
  pushed_after?: string;

  @IsOptional()
  @IsIn(['stars', 'forks', 'help-wanted-issues', 'updated'])
  sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';

  @IsOptional()
  @IsIn(['desc', 'asc'])
  order?: 'desc' | 'asc';

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100)
  per_page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Validate(WithinGithubSearchWindow)
  page?: number;
}
