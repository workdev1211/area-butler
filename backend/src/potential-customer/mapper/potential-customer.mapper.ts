import { PotentialCustomerDocument } from '../schema/potential-customer.schema';
import { QuestionnaireRequestDocument } from '../schema/questionnaire-request.schema';
import {
  ApiPotentialCustomer,
  ApiQuestionnaireRequest,
} from '@area-butler-types/potential-customer';

// TODO change to 'plainToInstance' with 'ApiPotentialCustomerDto'
export const mapPotentialCustomerToApiPotentialCustomer = (
  potentialCustomer: PotentialCustomerDocument,
): ApiPotentialCustomer => ({
  id: potentialCustomer.id,
  name: potentialCustomer.name,
  email: potentialCustomer.email,
  routingProfiles: potentialCustomer.routingProfiles,
  preferredAmenities: potentialCustomer.preferredAmenities,
  preferredLocations: potentialCustomer.preferredLocations,
  realEstateCharacteristics: potentialCustomer.realEstateCharacteristics,
  realEstateCostStructure: potentialCustomer.realEstateCostStructure,
});

// TODO change to 'plainToInstance' with 'ApiQuestionnaireRequestDto'
export const mapQuestionnaireRequestToApiQuestionnaireRequest = (
  questionnaireRequest: QuestionnaireRequestDocument,
): ApiQuestionnaireRequest => ({
  id: questionnaireRequest.id,
  name: questionnaireRequest.name,
  email: questionnaireRequest.email,
  userInCopy: questionnaireRequest.userInCopy,
});
