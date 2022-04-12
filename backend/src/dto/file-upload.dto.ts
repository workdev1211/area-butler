import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';
import { IsNotEmpty } from 'class-validator';

class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsNotEmpty()
  file: Express.Multer.File;
}

export default FileUploadDto;
