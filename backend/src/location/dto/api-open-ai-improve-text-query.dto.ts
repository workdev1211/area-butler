import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
class ApiOpenAiImproveTextQueryDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  customText: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  originalText: string;
}

export default ApiOpenAiImproveTextQueryDto;
