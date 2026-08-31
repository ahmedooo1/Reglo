import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateQuoteStatusDto {
  @IsIn(['accepte', 'refuse'])
  status: 'accepte' | 'refuse';

  // Required only when status === 'accepte'; enforced in QuotesService
  // since it depends on another field's value.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsBoolean()
  consent?: boolean;
}
