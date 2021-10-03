import { FormModalData } from "components/FormModal";
import {
  RealEstateListingActions,
  RealEstateListingContext,
} from "context/RealEstateListingContext";
import { useHttp } from "hooks/http";
import React from "react";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface RealEstateListingFormHandlerDeleteProps extends FormModalData {
  realEstateListing: Partial<ApiRealEstateListing>;
}

export const RealEstateListingFormDeleteHandler: React.FunctionComponent<RealEstateListingFormHandlerDeleteProps> =
  ({
    formId,
    beforeSubmit = () => {},
    postSubmit = () => {},
    realEstateListing,
  }) => {
    const { deleteRequest } = useHttp();
    const { realEstateDispatch } = React.useContext(RealEstateListingContext);

    const onSubmit = async (event: any) => {
      event.preventDefault();

      try {
        let listing = null;
        beforeSubmit();
        if (!!realEstateListing.id) {
          listing = await deleteRequest(
            `/api/real-estate-listings/${realEstateListing.id}`
          );
          realEstateDispatch({
            type: RealEstateListingActions.DELETE_REAL_ESTATE_LISTING,
            payload: realEstateListing,
          });
        }
        postSubmit(true);
      } catch (err) {
        console.log(err);
        postSubmit(false);
      }
    };

    return (
      <form id={formId} onSubmit={onSubmit}>
        Möchten Sie wirklich das Objekt löschen?
      </form>
    );
  };
