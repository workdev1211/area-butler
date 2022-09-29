import { IsNotEmpty, IsString } from 'class-validator';

import { IApiCreatePaypalOrderQuery } from '@area-butler-types/types';

class ApiCreatePaypalOrderQueryDto implements IApiCreatePaypalOrderQuery {
  @IsNotEmpty()
  @IsString()
  priceId: string;
}

export default ApiCreatePaypalOrderQueryDto;
