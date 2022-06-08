import React, { useContext, useEffect, useState } from "react";
import DefaultLayout from "../layout/defaultLayout";
import { useHttp } from "../hooks/http";
import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../shared/constants/real-estate";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import editIcon from "../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import searchIcon from "../assets/icons/icons-16-x-16-outline-ic-search.svg";
import locationIcon from "../assets/icons/icons-16-x-16-outline-ic-type.svg";
import { Link, useHistory, useLocation } from "react-router-dom";
import FormModal from "../components/FormModal";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { RealEstateDeleteHandler } from "../real-estates/RealEstateDeleteHandler";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import TourStarter from "tour/TourStarter";
import { UserActionTypes, UserContext } from "context/UserContext";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import EmbeddableMapsModal from "components/EmbeddableMapsModal";

const deleteRealEstateModalConfig = {
  modalTitle: "Objekt löschen",
  submitButtonTitle: "Löschen",
};

const RealEstatesPage: React.FunctionComponent = () => {
  const { get } = useHttp();
  const history = useHistory();
  const queryParams = new URLSearchParams(useLocation().search);
  const realEstateHighlightId = queryParams.get("id");
  const { realEstateState, realEstateDispatch } = useContext(RealEstateContext);
  const { userState, userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const [realEstateEmbeddableMaps, setRealEstateEmbeddableMaps] = useState<
    ApiSearchResultSnapshotResponse[]
  >([]);
  const [showEmbeddableMapsModal, setShowEmbeddableMapsModal] =
    useState<boolean>(false);

  const user = userState.user!;
  const hasSubscription = !!user?.subscriptionPlan;
  const hasHtmlSnippet =
    hasSubscription && user?.subscriptionPlan!.config.appFeatures.htmlSnippet;

  useEffect(() => {
    if (!!user) {
      const fetchEmbeddableMaps = async () => {
        const embeddableMaps: ApiSearchResultSnapshotResponse[] = (
          await get<ApiSearchResultSnapshotResponse[]>(
            "/api/location/user-embeddable-maps"
          )
        ).data;
        userDispatch({
          type: UserActionTypes.SET_EMBEDDABLE_MAPS,
          payload: embeddableMaps,
        });
      };

      if (hasHtmlSnippet) {
        fetchEmbeddableMaps();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const realEstates = realEstateState.listings || [];

  const openEmbeddableMapsModal = (realEstate: ApiRealEstateListing) => {
    const { lat, lng } = realEstate.coordinates!;
    setRealEstateEmbeddableMaps(
      userState.embeddableMaps.filter(
        (map) =>
          map.snapshot.location.lat === lat && map.snapshot.location.lng === lng
      )
    );
    setShowEmbeddableMapsModal(true);
  };
  const startSearchFromRealEstate = async (listing: ApiRealEstateListing) => {
    const result = await deriveGeocodeByAddress(listing.address);
    const { lat, lng } = result;
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: listing.address, value: { place_id: "123" } },
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: listing,
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: {
        lat,
        lng,
      },
    });
    history.push("/");
  };

  useEffect(() => {
    const fetchRealEstates = async () => {
      const response = await get<ApiRealEstateListing[]>(
        "/api/real-estate-listings"
      );
      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: response.data,
      });
    };
    fetchRealEstates();
  }, [true]); // eslint-disable-line react-hooks/exhaustive-deps

  const ActionsTop: React.FunctionComponent = () => {
    return (
      <>
        <li>
          <Link to="/real-estates/new" className="btn btn-link">
            <img src={plusIcon} alt="pdf-icon" /> Objekt anlegen
          </Link>
        </li>
      </>
    );
  };

  return (
    <DefaultLayout
      title="Meine Immobilien"
      withHorizontalPadding={false}
      actionsTop={<ActionsTop />}
    >
      <TourStarter tour="realEstates" />
      {showEmbeddableMapsModal && (
        <EmbeddableMapsModal
          showModal={showEmbeddableMapsModal}
          setShowModal={setShowEmbeddableMapsModal}
          embeddableMaps={realEstateEmbeddableMaps}
        />
      )}
      <div className="overflow-x-auto" data-tour="real-estates-table">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Addresse</th>
              <th>Kosten</th>
              <th>Ausstattung</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {realEstates.map(
              (realEstate: ApiRealEstateListing, index: number) => (
                <tr
                  key={realEstate.id}
                  className={
                    realEstateHighlightId === realEstate.id ? "active" : ""
                  }
                >
                  <th>{realEstate.name}</th>
                  <td>{realEstate.address}</td>
                  <td>
                    {!!realEstate.costStructure?.startingAt ? "Ab " : ""}
                    {!!realEstate?.costStructure?.type &&
                    !!realEstate?.costStructure?.price
                      ? `${realEstate.costStructure.price.amount} € (${
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
                          realEstate.characteristics?.furnishing.includes(
                            f.type
                          )
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
                        onClick={() => startSearchFromRealEstate(realEstate)}
                        data-tour={
                          "real-estates-table-item-search-button-" + index
                        }
                      />
                      <img
                        src={editIcon}
                        alt="icon-edit"
                        className="cursor-pointer"
                        data-tour={
                          "real-estates-table-item-edit-button-" + index
                        }
                        onClick={() =>
                          history.push(`/real-estates/${realEstate.id}`)
                        }
                      />
                      <img
                        src={locationIcon}
                        alt="icon-location"
                        className="cursor-pointer"
                        onClick={() => {
                          openEmbeddableMapsModal(realEstate);
                        }}
                      />
                      <FormModal
                        modalConfig={{
                          ...deleteRealEstateModalConfig,
                          modalButton: (
                            <img
                              src={deleteIcon}
                              alt="icon-delete"
                              data-tour={
                                "real-estates-table-item-delete-button-" + index
                              }
                              className="cursor-pointer"
                            />
                          ),
                        }}
                      >
                        <RealEstateDeleteHandler realEstate={realEstate} />
                      </FormModal>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  );
};

export default RealEstatesPage;
