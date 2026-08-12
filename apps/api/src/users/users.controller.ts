import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
  } from '@nestjs/common';import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ADMIN xem danh sách tài khoản
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ADMIN xem chi tiết một tài khoản
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

    // ADMIN thay đổi Role của một User
    @Roles('ADMIN')
    @Patch(':id/role')
    updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
    ) {
    return this.usersService.updateRole(id, updateRoleDto.role);
    }

    // ADMIN khóa hoặc mở khóa tài khoản
    @Roles('ADMIN')
    @Patch(':id/status')
    updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    ) {
    return this.usersService.updateStatus(id, updateStatusDto.isActive);
    }
}