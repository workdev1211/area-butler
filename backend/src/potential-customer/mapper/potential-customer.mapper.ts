import { PotentialCustomerDocument } from '../schema/potential-customer.schema';
import { QuestionnaireRequestDocument } from '../schema/questionnaire-request.schema';
import ApiPotentialCustomerDto from '../../dto/api-potential-customer.dto';
import ApiQuestionnaireRequestDto from '../../dto/api-questionnaire-request.dto';

export const mapPotentialCustomerToApiPotentialCustomer = (
  potentialCustomer: PotentialCustomerDocument,
  userId?: string,
): ApiPotentialCustomerDto => ({
  id: potentialCustomer.id,
  name: potentialCustomer.name,
  email: potentialCustomer.email,
  routingProfiles: potentialCustomer.routingProfiles,
  preferredAmenities: potentialCustomer.preferredAmenities,
  preferredLocations: potentialCustomer.preferredLocations,
  realEstateCharacteristics: potentialCustomer.realEstateCharacteristics,
  realEstateCostStructure: potentialCustomer.realEstateCostStructure,
  belongsToParent: potentialCustomer.userId !== userId,
});

export const mapQuestionnaireRequestToApiQuestionnaireRequest = (
  questionnaireRequest: QuestionnaireRequestDocument,
): ApiQuestionnaireRequestDto => ({
  id: questionnaireRequest.id,
  name: questionnaireRequest.name,
  email: questionnaireRequest.email,
  userInCopy: questionnaireRequest.userInCopy,
});
