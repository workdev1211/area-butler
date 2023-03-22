import { FunctionComponent, useContext, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import Select, {
  ActionMeta,
  ControlProps,
  CSSObjectWithLabel,
  GroupBase,
  MenuProps,
  SingleValue,
} from "react-select";
import { Loader } from "@googlemaps/js-api-loader";

import DefaultLayout from "../layout/defaultLayout";
import { useHttp } from "../hooks/http";
import {
  allFurnishing,
  allRealEstateCostTypes,
  allRealEstateStatuses,
} from "../../../shared/constants/real-estate";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import uploadIcon from "../assets/icons/upload_file.svg";
import editIcon from "../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import searchIcon from "../assets/icons/icons-16-x-16-outline-ic-search.svg";
import locationIcon from "../assets/icons/icons-16-x-16-outline-ic-type.svg";
import FormModal from "../components/FormModal";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
  IApiRealEstateStatus,
} from "../../../shared/types/real-estate";
import { RealEstateDeleteHandler } from "../real-estates/RealEstateDeleteHandler";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import TourStarter from "tour/TourStarter";
import { UserActionTypes, UserContext } from "context/UserContext";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import EmbeddableMapsModal from "components/EmbeddableMapsModal";
import { getRealEstateCost } from "../shared/real-estate.functions";
import CsvImportModal from "../real-estates/CsvImportModal";
import { ConfigContext } from "../context/ConfigContext";
import { googleMapsApiOptions } from "../shared/shared.constants";
import { IRealEstatesHistoryState } from "../shared/shared.types";
import { useRealEstateData } from "../hooks/realestatedata";

const deleteRealEstateModalConfig = {
  modalTitle: "Objekt löschen",
  submitButtonTitle: "Löschen",
};

const RealEstatesPage: FunctionComponent = () => {
  const { realEstateState, realEstateDispatch } = useContext(RealEstateContext);
  const { userState, userDispatch } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { googleApiKey } = useContext(ConfigContext);

  const { get } = useHttp();
  const { fetchRealEstates } = useRealEstateData();
  const history = useHistory<IRealEstatesHistoryState>();
  const queryParams = new URLSearchParams(useLocation().search);
  const realEstateHighlightId = queryParams.get("id");

  const [selectedRealEstateStatus, setSelectedRealEstateStatus] = useState(
    ApiRealEstateStatusEnum.ALLE
  );
  const [realEstateEmbeddableMaps, setRealEstateEmbeddableMaps] = useState<
    ApiSearchResultSnapshotResponse[]
  >([]);
  const [showEmbeddableMapsModal, setShowEmbeddableMapsModal] = useState(false);
  const [isShownCsvImportModal, setIsShownCsvImportModal] = useState(false);

  const user = userState.user!;
  const hasSubscription = !!user?.subscription;
  const hasHtmlSnippet =
    hasSubscription && user?.subscription!.config.appFeatures.htmlSnippet;

  useEffect(() => {
    const googleMapsApiLoader = new Loader({
      apiKey: googleApiKey,
      id: googleMapsApiOptions.id,
      libraries: ["places"],
    });

    void googleMapsApiLoader.load();
  }, [googleApiKey]);

  useEffect(() => {
    if (!user || !hasHtmlSnippet) {
      return;
    }

    const fetchEmbeddableMaps = async () => {
      const embeddableMaps: ApiSearchResultSnapshotResponse[] = (
        await get<ApiSearchResultSnapshotResponse[]>("/api/location/snapshots")
      ).data;

      userDispatch({
        type: UserActionTypes.SET_EMBEDDABLE_MAPS,
        payload: embeddableMaps,
      });
    };

    void fetchEmbeddableMaps();
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

    history.push("/search", { isFromRealEstates: true });
  };

  const fetchRealEstateData = async () => {
    const realEstateData = await fetchRealEstates(selectedRealEstateStatus);

    realEstateDispatch({
      type: RealEstateActionTypes.SET_REAL_ESTATES,
      payload: realEstateData,
    });
  };

  useEffect(() => {
    void fetchRealEstateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRealEstateStatus]);

  const ActionsTop: FunctionComponent = () => {
    return (
      <>
        <li>
          <Link to="/real-estates/new" className="btn btn-link">
            <img src={plusIcon} alt="pdf-icon" /> Objekt anlegen
          </Link>
          <button
            className="btn btn-link"
            onClick={() => {
              setIsShownCsvImportModal(true);
            }}
          >
            <img
              src={uploadIcon}
              alt="upload-icon"
              style={{ filter: "invert(100%)" }}
            />
            <label htmlFor="file" style={{ cursor: "pointer" }}>
              Import aus CSV-Datei
            </label>
          </button>
        </li>
      </>
    );
  };

  const customStyles = {
    menu: (
      provided: CSSObjectWithLabel,
      state: MenuProps<
        IApiRealEstateStatus,
        false,
        GroupBase<IApiRealEstateStatus>
      >
    ) => ({
      ...provided,
      zIndex: 99,
    }),
    control: (
      provided: CSSObjectWithLabel,
      state: ControlProps<
        IApiRealEstateStatus,
        false,
        GroupBase<IApiRealEstateStatus>
      >
    ) => ({
      ...provided,
      boxShadow: undefined,
      borderWidth: "2px",
      borderColor: "var(--primary)",
      "&:hover": { borderColor: "var(--primary)" },
      width: "20rem",
    }),
  };

  const onRealEstateStatusChange = async (
    option: SingleValue<IApiRealEstateStatus>,
    action: ActionMeta<IApiRealEstateStatus>
  ) => {
    setSelectedRealEstateStatus(option!.status);
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
      <CsvImportModal
        isShownModal={isShownCsvImportModal}
        closeModal={async () => {
          await fetchRealEstateData();
          setIsShownCsvImportModal(false);
        }}
        fileFormat={user.subscription?.config.appFeatures.csvFileFormat}
      />
      <div
        className="w-1/2 sm:w-1/6 flex items-center gap-2"
        style={{ padding: "5px 5px 5px 5px" }}
      >
        <Select
          styles={customStyles}
          options={allRealEstateStatuses}
          isSearchable={false}
          defaultValue={allRealEstateStatuses.find(
            ({ status }) => status === ApiRealEstateStatusEnum.ALLE
          )}
          placeholder="Wählen Sie einen Typ..."
          onChange={async (option, action) => {
            await onRealEstateStatusChange(option, action);
          }}
          getOptionValue={(option) => option.status}
        />
        <span>Immobilienart</span>
      </div>
      <div data-tour="real-estates-table">
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
            {realEstates.map(
              (realEstate: ApiRealEstateListing, index: number) => (
                <tr
                  key={realEstate.id}
                  className={
                    realEstateHighlightId === realEstate.id ? "active" : ""
                  }
                >
                  <th>
                    {/*TODO move all such text table things to the useEffect and a specific table entity*/}
                    {
                      allRealEstateStatuses.find(
                        (estate) => estate.status === realEstate.status
                      )?.label
                    }
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
                        onClick={() => {
                          void startSearchFromRealEstate(realEstate);
                        }}
                        data-tour={`real-estates-table-item-search-button-${index}`}
                      />
                      {!realEstate.belongsToParent ? (
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
                          openEmbeddableMapsModal(realEstate);
                        }}
                      />
                      {!realEstate.belongsToParent && (
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
              )
            )}
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  );
};

export default RealEstatesPage;
