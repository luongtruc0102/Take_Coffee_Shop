import { IsString, MinLength } from 'class-validator';

export class AddressSuggestionsDto {
  @IsString()
  @MinLength(3)
  query!: string;
}
