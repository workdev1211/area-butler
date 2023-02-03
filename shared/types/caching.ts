import {
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IOpenAiLocationDescriptionFormValues,
} from "./open-ai";

export interface IOpenAiCachingState {
  locationDescription?: IOpenAiLocationDescriptionFormValues;
  realEstateDescription?: IApiOpenAiRealEstateDescriptionQuery;
  locationRealEstateDescription?: IApiOpenAiLocationRealEstateDescriptionQuery;
  query?: IApiOpenAiQuery;
}
