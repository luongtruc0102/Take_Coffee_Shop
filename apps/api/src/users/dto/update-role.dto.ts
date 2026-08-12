import { IsIn, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsIn(['ADMIN', 'STAFF', 'USER'])
  role!: string;
}