import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ImageGenerationDto } from '../dtos';
import { OpenaiService } from '../../ai/services/openai.service';
import { downloadImage } from '@utils/images.util';
import { checkIfFileExists } from '@utils/files.util';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(private readonly openaiService: OpenaiService) {}

  async imageGeneration(imageGenerationDto: ImageGenerationDto) {
    this.logger.log('Starting image generation process');
    const { prompt } = imageGenerationDto;
    try {
      this.logger.debug(`Prompt received: ${prompt}`);
      const response = await this.openaiService.openAi.images.generate({
        prompt,
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      });
      const imageUrl = response.data[0].url || '';
      this.logger.debug(`Image URL received: ${imageUrl}`);
      await downloadImage(imageUrl, 'png');
      this.logger.log('Image generation process completed successfully');
      return {
        url: response.data[0].url,
        localPath: '',
        revisedPrompt: response.data[0].revised_prompt,
      };
    } catch (error) {
      this.logger.error({
        message: error.message,
        error: error.type,
        statusCode: error.status,
      });
      throw new HttpException(error.message, error.status);
    }
  }

  async imageGenerationGetter(fileId: string) {
    this.logger.log(`Starting to retrieve image file with ID ${fileId}`);
    try {
      const { filePath } = checkIfFileExists('images', fileId, 'png');
      this.logger.debug(`File path found: ${filePath}`);
      const data = await readFile(filePath);
      const buffer = Buffer.from(data);
      this.logger.log(`Successfully retrieved image file with ID ${fileId}`);
      return buffer;
    } catch (error) {
      this.logger.error({
        message: error.message,
        error: error.type,
        statusCode: error.status,
      });
      throw new HttpException(error.message, error.status);
    }
  }
}
