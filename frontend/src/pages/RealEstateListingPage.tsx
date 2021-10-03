import FormModal, { ModalConfig } from "components/FormModal";
import { RealEstateListingActions, RealEstateListingContext } from "context/RealEstateListingContext";
import { useHttp } from "hooks/http";
import React, { useEffect } from "react";
import { RealEstateListingFormDeleteHandler } from "real-estate-listings/RealEstateListingDeleteHandler";
import RealEstateListingFormHandler from "real-estate-listings/RealEstateListingFormHandler";
import {
  allFurnishing, allRealEstateCostTypes
} from "../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export const RealEstateListingPage = () => {

  const { get } = useHttp();

  const { realEstateDispatch, realEstateListingState } = React.useContext(
    RealEstateListingContext
  );;

  useEffect(() => {
    const fetchListings = async () => {
      realEstateDispatch({
        type: RealEstateListingActions.SET_REAL_ESTATE_LISTINGS,
        payload: (
          await get<ApiRealEstateListing[]>("/api/real-estate-listings")
        ).data,
      });
    };
    fetchListings();
  }, [true]);

  const editRealEstateListingModalConfig: ModalConfig = {
    modalTitle: "Objekt bearbeiten",
    buttonTitle: "Bearbeiten",
    buttonStyle: "btn btn-xs",
  };

  const deleteRealEstateListingModalConfig: ModalConfig = {
    modalTitle: "Objekt löschen",
    buttonTitle: "Löschen",
    buttonStyle: "btn btn-xs",
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="flex text-2xl">Meine Objekte</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Addresse</th>
              <th>Kosten</th>
              <th>Austattung</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {realEstateListingState.listings.map((listing: ApiRealEstateListing) => (
              <tr key={listing.id}>
                <th>{listing.name}</th>
                <td>{listing.address}</td>
                <td>
                  {!!listing?.costStructure?.type &&
                  !!listing?.costStructure?.price
                    ? `${listing.costStructure.price.amount} € (${
                      allRealEstateCostTypes.find(
                        (t) => t.type === listing.costStructure?.type
                      )?.label
                    })`
                    : ""}
                </td>
                <td>
                  {listing.characteristics?.furnishing &&
                    allFurnishing
                      .filter((f) =>
                        listing.characteristics?.furnishing.includes(f.type)
                      )
                      .map((f) => f.label)
                      .join(", ")}
                </td>
                <td className="flex gap-2">
                  <FormModal modalConfig={editRealEstateListingModalConfig}>
                    <RealEstateListingFormHandler
                      realEstateListing={listing}
                    ></RealEstateListingFormHandler>
                  </FormModal>
                  <FormModal modalConfig={deleteRealEstateListingModalConfig}>
                    <RealEstateListingFormDeleteHandler realEstateListing={listing}>
                    </RealEstateListingFormDeleteHandler>
                  </FormModal>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
function realEstateDispatch(arg0: { type: any; payload: any; }) {
  throw new Error("Function not implemented.");
}

