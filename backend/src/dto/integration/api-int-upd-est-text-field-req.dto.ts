import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { TOpenAiLocDescType } from '@area-butler-types/open-ai';
import { IApiIntUpdEstTextFieldReq } from '@area-butler-types/integration';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';
import { openAiLocDescTypes } from '../../../../shared/constants/open-ai';

@Exclude()
class ApiIntUpdEstTextFieldReqDto implements IApiIntUpdEstTextFieldReq {
  @Expose()
  @IsNotEmpty()
  @IsIn([...openAiLocDescTypes, AreaButlerExportTypesEnum.INLINE_FRAME])
  exportType: TOpenAiLocDescType | AreaButlerExportTypesEnum.INLINE_FRAME;

  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  text: string;
}

export default ApiIntUpdEstTextFieldReqDto;
