import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCharacteristics,
} from '@area-butler-types/real-estate';

class ApiRealEstateCharacteristicsDto implements ApiRealEstateCharacteristics {
  energyEfficiency?: ApiEnergyEfficiency;
  furnishing: ApiFurnishing[];
  numberOfRooms: number;
  propertySizeInSquareMeters?: number;
  realEstateSizeInSquareMeters?: number;
  startingAt: boolean;
}

export default ApiRealEstateCharacteristicsDto;
