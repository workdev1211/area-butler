import {FormModalData} from "components/FormModal";
import {useHttp} from "hooks/http";
import React from "react";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {RealEstateActions, RealEstateContext} from "../context/RealEstateContext";

export interface RealEstateDeleteHandlerProps extends FormModalData {
  realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateDeleteHandler: React.FunctionComponent<RealEstateDeleteHandlerProps> =
  ({
    formId,
    beforeSubmit = () => {},
    postSubmit = () => {},
    realEstate,
  }) => {
    const { deleteRequest } = useHttp();
    const { realEstateDispatch } = React.useContext(RealEstateContext);

    const onSubmit = async (event: any) => {
      event.preventDefault();

      try {
        beforeSubmit();
        if (!!realEstate.id) {
          await deleteRequest(
            `/api/real-estate-listings/${realEstate.id}`
          );
          realEstateDispatch({
            type: RealEstateActions.DELETE_REAL_ESTATE,
            payload: realEstate,
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
