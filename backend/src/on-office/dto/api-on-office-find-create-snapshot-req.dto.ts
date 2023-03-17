import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeFindCreateSnapshotReq } from '@area-butler-types/on-office';

class ApiOnOfficeFindCreateSnapshotReqDto
  implements IApiOnOfficeFindCreateSnapshotReq
{
  @IsNotEmpty()
  @IsString()
  estateId: string;
}

export default ApiOnOfficeFindCreateSnapshotReqDto;
