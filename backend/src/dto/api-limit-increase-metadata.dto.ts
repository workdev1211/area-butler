import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import {
  ILimitIncreaseMetadata,
  LimitIncreaseModelNameEnum,
} from '@area-butler-types/billing';

class ApiLimitIncreaseMetadataDto implements ILimitIncreaseMetadata {
  @IsNotEmpty()
  @IsEnum(LimitIncreaseModelNameEnum)
  modelName: LimitIncreaseModelNameEnum;

  @IsNotEmpty()
  @IsString()
  modelId: string;
}

export default ApiLimitIncreaseMetadataDto;
