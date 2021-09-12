import FormModal, { ModalConfig } from "components/FormModal";
import RealEstateListingFormHandler from "real-estate-listings/RealEstateListingFormHandler";
import useRealEstateListingState from "state/real-estate-listing";
import {
  allRealEstateCostTypes,
  allFurnishing,
} from "../../../shared/constants/real-estate";

export const RealEstateListingPage = () => {
  const { realEstateListingsState } = useRealEstateListingState();

  const editRealEstateListingModalConfig: ModalConfig = {
    modalTitle: "Objekt bearbeiten",
    buttonTitle: "Bearbeiten",
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
            {realEstateListingsState.listings.map((listing) => (
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
                  {" "}
                  {listing.characteristics?.furnishing &&
                    allFurnishing
                      .filter((f) =>
                        listing.characteristics?.furnishing.includes(f.type)
                      )
                      .map((f) => f.label)
                      .join(", ")}
                </td>
                <td>
                  <FormModal modalConfig={editRealEstateListingModalConfig}>
                    <RealEstateListingFormHandler
                      realEstateListing={listing}
                    ></RealEstateListingFormHandler>
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
