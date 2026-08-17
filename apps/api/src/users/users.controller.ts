import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import {
  Roles,
} from '../common/decorators/roles.decorator';

import {
  UsersService,
} from './users.service';

import {
  CreateStaffDto,
} from './dto/create-staff.dto';

import {
  UpdateStatusDto,
} from './dto/update-status.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService:
      UsersService,
  ) {}

  // ADMIN xem danh sách tài khoản
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ADMIN tạo tài khoản nhân viên
  @Roles('ADMIN')
  @Post('staff')
  createStaff(
    @Body()
    createStaffDto: CreateStaffDto,
  ) {
    return this.usersService.createStaff(
      createStaffDto,
    );
  }

  // ADMIN xem chi tiết một tài khoản
  @Roles('ADMIN')
  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.usersService.findOne(
      id,
    );
  }

  // ADMIN khóa hoặc mở khóa tài khoản
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateStatusDto:
      UpdateStatusDto,
  ) {
    return this.usersService.updateStatus(
      id,
      updateStatusDto.isActive,
    );
  }
}