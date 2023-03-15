import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeFindCreateSnapshotReq } from '@area-butler-types/on-office';
import { IntegrationTypesEnum } from '@area-butler-types/types';

class ApiOnOfficeFindCreateSnapshotReqDto
  implements IApiOnOfficeFindCreateSnapshotReq
{
  @IsNotEmpty()
  @IsString()
  estateId: string;

  @IsNotEmpty()
  @IsString()
  extendedClaim: string;

  @IsNotEmpty()
  @IsString()
  integrationType: IntegrationTypesEnum;
}

export default ApiOnOfficeFindCreateSnapshotReqDto;
