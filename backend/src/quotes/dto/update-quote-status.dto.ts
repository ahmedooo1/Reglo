import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

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

  // Optional drawn (finger/mouse) signature, as a PNG data URL from the
  // frontend's canvas signature pad. Length cap keeps a rogue client from
  // posting an oversized payload; a canvas signature is a few KB.
  @IsOptional()
  @IsString()
  @MaxLength(300000)
  @Matches(/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/, { message: 'Signature invalide.' })
  signature?: string;
}
