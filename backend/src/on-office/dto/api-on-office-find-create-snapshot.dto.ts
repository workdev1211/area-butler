import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeFindCreateSnapshot } from '@area-butler-types/on-office';
import { IntegrationTypesEnum } from '@area-butler-types/types';

class ApiOnOfficeFindCreateSnapshotDto
  implements IApiOnOfficeFindCreateSnapshot
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

export default ApiOnOfficeFindCreateSnapshotDto;
