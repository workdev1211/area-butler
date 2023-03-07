import { IsNotEmpty, IsString } from 'class-validator';

import { IApiCreatePaypalOrder } from '@area-butler-types/types';

class ApiCreatePaypalOrderDto implements IApiCreatePaypalOrder {
  @IsNotEmpty()
  @IsString()
  priceId: string;
}

export default ApiCreatePaypalOrderDto;
