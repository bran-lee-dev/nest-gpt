import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ImageGenerationDto } from '../dtos';
import { ImageService } from '../services/image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('image-generation')
  async imageGeneration(@Body() imageGenerationDto: ImageGenerationDto) {
    const res = await this.imageService.imageGeneration(imageGenerationDto);
    return res;
  }

  @Get('image-generation/:fileId')
  async imageGenerationGetter(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: FastifyReply,
  ) {
    const buffer = await this.imageService.imageGenerationGetter(fileId);
    res.type('image/png').send(buffer);
  }
}
