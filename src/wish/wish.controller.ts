import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { WishService } from './wish.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('wishes')
@UseGuards(JwtAuthGuard)  // ALL routes in this controller require authentication
export class WishController {
  constructor(private readonly wishService: WishService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createWishDto: CreateWishDto,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.wishService.create(createWishDto, user.id);
  }

  @Get()
  findAll(
    @GetUser() user: { id: string; email: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.wishService.findAll(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.wishService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateWishDto: UpdateWishDto,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.wishService.update(id, updateWishDto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser() user: { id: string; email: string },
  ) {
    return this.wishService.remove(id, user.id);
  }
}
