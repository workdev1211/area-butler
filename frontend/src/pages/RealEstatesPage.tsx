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

const deleteRealEstateModalConfig = {
  modalTitle: "Objekt löschen",
  submitButtonTitle: "Löschen",
};

interface IRealEstateStatusOption {
  label: string;
  value?: ApiRealEstateStatusEnum;
}

const RealEstatesPage: FunctionComponent = () => {
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

  const [showEmbeddableMapsModal, setShowEmbeddableMapsModal] = useState(false);
  const [isShownCsvImportModal, setIsShownCsvImportModal] = useState(false);

  const user = userState.user!;
  const hasSubscription = !!user?.subscriptionPlan;
  const hasHtmlSnippet =
    hasSubscription && user?.subscriptionPlan!.config.appFeatures.htmlSnippet;

  useEffect(() => {
    if (user) {
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

  const fetchRealEstates = async (status?: ApiRealEstateStatusEnum) => {
    const response = await get<ApiRealEstateListing[]>(
      `/api/real-estate-listings${status ? `?status=${status}` : ""}`
    );

    realEstateDispatch({
      type: RealEstateActionTypes.SET_REAL_ESTATES,
      payload: response.data,
    });
  };

  useEffect(() => {
    fetchRealEstates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        IRealEstateStatusOption,
        false,
        GroupBase<IRealEstateStatusOption>
      >
    ) => ({
      ...provided,
      zIndex: 99,
    }),
    control: (
      provided: CSSObjectWithLabel,
      state: ControlProps<
        IRealEstateStatusOption,
        false,
        GroupBase<IRealEstateStatusOption>
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

  const values: IRealEstateStatusOption[] = allRealEstateStatuses.map(
    ({ label, status: value }) => ({
      value,
      label,
    })
  );

  const defaultValue = {
    label: "Alle",
  } as IRealEstateStatusOption;

  values.unshift(defaultValue);

  const onRealEstateStatusChange = async (
    option: SingleValue<IRealEstateStatusOption>,
    action: ActionMeta<IRealEstateStatusOption>
  ) => {
    await fetchRealEstates(option!.value);
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
      {isShownCsvImportModal && (
        <CsvImportModal
          closeModal={() => {
            setIsShownCsvImportModal(false);
          }}
        />
      )}
      <div
        className="w-1/2 sm:w-1/6 flex items-center gap-2"
        style={{ padding: "5px 5px 5px 5px" }}
      >
        <Select
          styles={customStyles}
          options={values}
          isSearchable={false}
          defaultValue={defaultValue}
          placeholder="Wählen Sie einen Typ..."
          onChange={async (option, action) => {
            await onRealEstateStatusChange(option, action);
          }}
        />
        <span>Typfilter</span>
      </div>
      <div className="overflow-x-auto" data-tour="real-estates-table">
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
                        onClick={() => startSearchFromRealEstate(realEstate)}
                        data-tour={`real-estates-table-item-search-button-${index}`}
                      />
                      <img
                        src={editIcon}
                        alt="icon-edit"
                        className="cursor-pointer"
                        data-tour={`"real-estates-table-item-edit-button-${index}`}
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
                              data-tour={`real-estates-table-item-delete-button-${index}`}
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
