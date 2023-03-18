import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeFetchLatestSnapshotReq } from '@area-butler-types/on-office';

class ApiOnOfficeFetchLatestSnapshotReqDto
  implements IApiOnOfficeFetchLatestSnapshotReq
{
  @IsNotEmpty()
  @IsString()
  integrationId: string;
}

export default ApiOnOfficeFetchLatestSnapshotReqDto;
