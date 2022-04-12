import { ApiUser } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import ApiRequestContingentDto from './api-request-contingent.dto';
import ApiShowTourDto from './api-show-tour.dto';
import ApiUserSubscriptionDto from './api-user-subscription.dto';
import MapBoxStyleDto from './map-box-style.dto';

class ApiUserDto implements ApiUser {

  @ValidateNested({each: true})
  @IsArray()
  @Type(() => MapBoxStyleDto)
  additionalMapBoxStyles: MapBoxStyleDto[];

  @IsOptional()
  color?: string;

  @IsOptional()
  @IsDate()
  consentGiven?: Date;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  fullname: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  mapIcon?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ApiRequestContingentDto)
  requestContingents: ApiRequestContingentDto[];

  @IsNotEmpty()
  @IsNumber()
  requestsExecuted: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiShowTourDto)
  showTour: ApiShowTourDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiUserSubscriptionDto)
  subscriptionPlan?: ApiUserSubscriptionDto;
}

export default ApiUserDto;
