import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeFindCreateSnapshot } from '@area-butler-types/on-office';

class ApiOnOfficeFindCreateSnapshotDto
  implements IApiOnOfficeFindCreateSnapshot
{
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @IsNotEmpty()
  @IsString()
  integrationUserId: string;
}

export default ApiOnOfficeFindCreateSnapshotDto;
