import { FunctionComponent, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";

import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../shared/constants/real-estate";
import editIcon from "../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import searchIcon from "../assets/icons/icons-16-x-16-outline-ic-search.svg";
import locationIcon from "../assets/icons/icons-16-x-16-outline-ic-type.svg";
import FormModal from "../components/FormModal";
import { RealEstateContext } from "../context/RealEstateContext";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { RealEstateDeleteHandler } from "../real-estates/RealEstateDeleteHandler";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { getRealEstateCost } from "../shared/real-estate.functions";
import { ConfigContext } from "../context/ConfigContext";
import { IRealEstatesHistoryState } from "../shared/shared.types";

interface IRealEstatesTableProps {
  openSnapshotsModal: (realEstate: ApiRealEstateListing) => void;
}

const deleteRealEstateModalConfig = {
  modalTitle: "Objekt löschen",
  submitButtonTitle: "Löschen",
};

const RealEstatesTable: FunctionComponent<IRealEstatesTableProps> = ({
  openSnapshotsModal,
}) => {
  const { realEstateState } = useContext(RealEstateContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { integrationType } = useContext(ConfigContext);

  const history = useHistory<IRealEstatesHistoryState>();
  const queryParams = new URLSearchParams(useLocation().search);
  const realEstateHighlightId = queryParams.get("id");

  const isIntegration = !!integrationType;

  const startSearchFromRealEstate = async (
    realEstate: ApiRealEstateListing
  ): Promise<void> => {
    const result = await deriveGeocodeByAddress(realEstate.address);
    const { lat, lng } = result;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: realEstate.address, value: { place_id: "123" } },
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: realEstate,
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: {
        lat,
        lng,
      },
    });

    history.push("/search", { isFromRealEstates: true });
  };

  const realEstates = realEstateState.listings || [];

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Typ</th>
          <th>Name</th>
          <th>Addresse</th>
          <th>Kosten</th>
          <th>Ausstattung</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {realEstates.map((realEstate: ApiRealEstateListing, index: number) => (
          <tr
            key={realEstate.id}
            className={realEstateHighlightId === realEstate.id ? "active" : ""}
          >
            <th>
              {/* TODO move all such text table things to the useEffect and a specific table entity */}
              {realEstate.status}
            </th>
            <th>{realEstate.name}</th>
            <td>{realEstate.address}</td>
            <td>
              {realEstate?.costStructure
                ? `${getRealEstateCost(realEstate.costStructure)} (${
                    allRealEstateCostTypes.find(
                      (t) => t.type === realEstate.costStructure?.type
                    )?.label
                  })`
                : ""}
            </td>
            <td>
              {realEstate.characteristics?.furnishing &&
                allFurnishing
                  .filter((f) =>
                    realEstate.characteristics?.furnishing.includes(f.type)
                  )
                  .map((f) => f.label)
                  .join(", ")}
            </td>
            <td>
              <div className="flex gap-4">
                <img
                  src={searchIcon}
                  alt="icon-search"
                  className="cursor-pointer"
                  onClick={() => {
                    void startSearchFromRealEstate(realEstate);
                  }}
                  data-tour={`real-estates-table-item-search-button-${index}`}
                />
                {!realEstate.isFromParent ? (
                  <img
                    src={editIcon}
                    alt="icon-edit"
                    className="cursor-pointer"
                    data-tour={`"real-estates-table-item-edit-button-${index}`}
                    onClick={() =>
                      history.push(`/real-estates/${realEstate.id}`)
                    }
                  />
                ) : (
                  <div style={{ width: "16px", height: "16px" }} />
                )}
                <img
                  src={locationIcon}
                  alt="icon-location"
                  className="cursor-pointer"
                  onClick={() => {
                    openSnapshotsModal(realEstate);
                  }}
                />
                {!realEstate.isFromParent && !isIntegration && (
                  <FormModal
                    modalConfig={{
                      ...deleteRealEstateModalConfig,
                      modalButton: (
                        <img
                          src={deleteIcon}
                          alt="icon-delete"
                          data-tour={`real-estates-table-item-delete-button-${index}`}
                          className="cursor-pointer"
                        />
                      ),
                    }}
                  >
                    <RealEstateDeleteHandler realEstate={realEstate} />
                  </FormModal>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RealEstatesTable;
