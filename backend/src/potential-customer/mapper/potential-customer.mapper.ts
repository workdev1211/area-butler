import { ApiPotentialCustomer } from "@area-butler-types/potential-customer";
import { PotentialCustomerDocument } from "../schema/potential-customer.schema";

export const mapPotentialCustomerToApiPotentialCustomer = (potentialCustomer: PotentialCustomerDocument) : ApiPotentialCustomer => ({
    id: potentialCustomer.id,
    name: potentialCustomer.name,
    routingProfiles: potentialCustomer.routingProfiles,
    preferredAmenities: potentialCustomer.preferredAmenities
});