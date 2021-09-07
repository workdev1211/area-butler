import {ApiFurnishing, ApiRealEstateCostType} from '../types/real-estate';

export const allFurnishing = [
    { label: 'Garten', type: ApiFurnishing.GARDEN},
    { label: 'Balkon', type: ApiFurnishing.BALCONY},
    { label: 'Keller', type: ApiFurnishing.BASEMENT},
    { label: 'Gäste WC', type: ApiFurnishing.GUEST_REST_ROOMS},
];

export const allRealEstateCostTypes = [
    { label: 'Verkauf', type: ApiRealEstateCostType.SELL},
    { label: 'Monatliche Warmmiete', type: ApiRealEstateCostType.RENT_MONTHLY_WARM},
    { label: 'Monatliche Kaltmiete', type: ApiRealEstateCostType.RENT_MONTHLY_COLD},
];