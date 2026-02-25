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
} from '@nestjs/common';
import { WishService } from './wish.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Controller('wishes')
export class WishController {
  constructor(private readonly wishService: WishService) {}

  // POST /wishes — CREATE A NEW WISH
  @Post()
  @HttpCode(HttpStatus.CREATED)  // 201 Created (✅ SEMANTICALLY CORRECT STATUS CODE FOR CREATION)
  create(@Body() createWishDto: CreateWishDto) {
    return this.wishService.create(createWishDto);
  }

  // GET /wishes — GET ALL WISHES, WITH OPTIONAL PAGINATION AND SEARCH
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.wishService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
    );
  }

  // GET /wishes/:id — GET A SINGLE WISH BY ID
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.wishService.findOne(id);
  }

  // PATCH /wishes/:id — UPDATE A WISH
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishService.update(id, updateWishDto);
  }

  // DELETE /wishes/:id — REMOVE A WISH
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.wishService.remove(id);
  }
}
