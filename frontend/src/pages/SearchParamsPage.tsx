import {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
  Fragment,
} from "react";
import { Form, Formik } from "formik";
import dayjs from "dayjs";

import "./SearchParamsPage.scss";

import FormModal, { ModalConfig } from "components/FormModal";
import LatestUserRequestsDropDown from "components/LatestUserRequestsDropDown";
import {
  PotentialCustomerActionTypes,
  PotentialCustomerContext,
} from "context/PotentialCustomerContext";
import { RealEstateContext } from "context/RealEstateContext";
import { UserContext } from "context/UserContext";
import { useFederalElectionData } from "hooks/federalelectiondata";
import { useParticlePollutionData } from "hooks/particlepollutiondata";
import PotentialCustomerDropDown from "potential-customer/PotentialCustomerDropDown";
import { useHistory, useLocation } from "react-router-dom";
import RealEstateDropDown from "real-estates/RealEstateDropDown";
import {
  deriveAddressFromCoordinates,
  deriveAvailableMeansFromResponse,
  deriveInitialEntityGroups,
  deriveTotalRequestContingent,
  toastError,
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import IncreaseLimitFormHandler from "user/IncreaseLimitFormHandler";
import {
  ApiDataSource,
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlanType,
} from "../../../shared/types/subscription-plan";
import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiSearch,
  ApiSearchResponse,
  ApiSearchResultSnapshotResponse,
  ApiTourNamesEnum,
  ApiUserRequests,
} from "../../../shared/types/types";
import nextIcon from "../assets/icons/icons-16-x-16-outline-ic-next.svg";
import ImportantAddresses from "../components/ImportantAddresses";
import LocalityParams from "../components/LocalityParams";
import LocationAutocomplete from "../components/LocationAutocomplete";
import MyLocationButton from "../components/MyLocationButton";
import TransportationParams from "../components/TransportationParams";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { useCensusData } from "../hooks/censusdata";
import DefaultLayout from "../layout/defaultLayout";
import BusyModal, { IBusyModalItem } from "../components/BusyModal";
import { LimitIncreaseModelNameEnum } from "../../../shared/types/billing";
import { useLocationData } from "../hooks/locationdata";
import {
  getCombinedOsmEntityTypes,
  getUncombinedOsmEntityTypes,
} from "../../../shared/functions/shared.functions";
import { ISearchParamsHistoryState } from "../shared/shared.types";
import { usePotentialCustomerData } from "../hooks/potentialcustomerdata";
import { useRealEstateData } from "../hooks/realestatedata";
import { snapshotEditorPath } from "../shared/shared.constants";
import { defaultTransportParams } from "../../../shared/constants/location";
import { useTools } from "../hooks/tools";

// TODO try to fix the following error
// Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
const SearchParamsPage: FunctionComponent = () => {
  const { userState } = useContext(UserContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { potentialCustomerDispatch } = useContext(PotentialCustomerContext);
  const { realEstateState } = useContext(RealEstateContext);

  const { fetchPotentialCustomers } = usePotentialCustomerData();
  const { fetchRealEstates } = useRealEstateData();
  const { fetchCensusData } = useCensusData();
  const { fetchFederalElectionData } = useFederalElectionData();
  const { fetchParticlePollutionData } = useParticlePollutionData();
  const history = useHistory<ISearchParamsHistoryState>();
  const { state } = useLocation<ISearchParamsHistoryState>();
  const { createLocation, createSnapshot } = useLocationData();
  const { getActualUser } = useTools();

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;

  const [isNewRequest, setIsNewRequest] = useState(true);
  const [isShownBusyModal, setIsShownBusyModal] = useState(false);
  const [busyModalItems, setBusyModalItems] = useState<IBusyModalItem[]>([]);
  const [busyModalItemCount, setBusyModalItemCount] = useState(0);
  const [limitType, setLimitType] = useState<ApiSubscriptionLimitsEnum>();
  const [modelData, setModelData] = useState<{
    name: LimitIncreaseModelNameEnum;
    id: string | undefined;
  }>();
  const [placesLocation, setPlacesLocation] = useState<any>(null);

  const clearRealEstateParams = () => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: undefined,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: undefined,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: undefined,
    });
  };

  const clearPotentialCustomerParams = () => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
      payload: getCombinedOsmEntityTypes(),
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: [...defaultTransportParams],
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: [],
    });
  };

  // Clears initial values
  useEffect(() => {
    if (!state && !isIntegrationUser) {
      clearRealEstateParams();
      clearPotentialCustomerParams();
      return;
    }

    if (
      state?.isFromRealEstates ||
      (isIntegrationUser && !state?.isFromPotentialCustomers)
    ) {
      clearPotentialCustomerParams();
      return;
    }

    if (state?.isFromPotentialCustomers && !isIntegrationUser) {
      clearRealEstateParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPlacesLocation(searchContextState.placesLocation);
  }, [searchContextState.placesLocation]);

  useEffect(() => {
    const coordinates = searchContextState.location;

    if (!coordinates) {
      return;
    }

    const latestUserRequests: ApiUserRequests = userState.latestUserRequests!;
    let limitType;
    let modelData;

    const existingRequest = latestUserRequests.requests.find(
      ({ coordinates: requestCoordinates }) =>
        JSON.stringify(requestCoordinates) === JSON.stringify(coordinates)
    );

    if (dayjs().isAfter(existingRequest?.endsAt)) {
      limitType = ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION;

      modelData = {
        name: LimitIncreaseModelNameEnum.LocationSearch,
        id: existingRequest?.id,
      };
    }

    const requestLimitExceeded = !isIntegrationUser
      ? user.requestsExecuted >= deriveTotalRequestContingent(user)
      : false;

    if (!existingRequest && requestLimitExceeded && !isIntegrationUser) {
      if (user?.subscription?.type === ApiSubscriptionPlanType.TRIAL) {
        history.push("/profile");
        return;
      }

      limitType = ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS;
    }

    setIsNewRequest(!existingRequest);
    setLimitType(limitType);
    setModelData(modelData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchContextState.location, userState.latestUserRequests, user]);

  useEffect(() => {
    const getPotentialCustomers = async () => {
      const potentialCustomers = await fetchPotentialCustomers();

      potentialCustomerDispatch({
        type: PotentialCustomerActionTypes.SET_POTENTIAL_CUSTOMERS,
        payload: potentialCustomers,
      });
    };

    void getPotentialCustomers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // needed for the 'Meine Immobilien' select
  useEffect(() => {
    if (isIntegrationUser) {
      return;
    }

    void fetchRealEstates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onLocationAutocompleteChange = (payload: any): void => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: payload.value,
    });

    if (payload.coordinates) {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_LOCATION,
        payload: payload.coordinates,
      });
    }
  };

  const onMyLocationChange = async (
    coordinates: ApiCoordinates
  ): Promise<void> => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: {
        ...coordinates,
      },
    });

    const place = (await deriveAddressFromCoordinates({
      coordinates,
      user,
    })) || {
      label: "Mein Standort",
      value: { place_id: "123" },
    };

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: place,
    });
  };

  const isSearchButtonDisabled =
    searchContextState.searchBusy ||
    !searchContextState.location?.lat ||
    !searchContextState.location?.lng ||
    searchContextState.transportationParams.length === 0 ||
    searchContextState.transportationParams.some((t) => !t.amount) ||
    searchContextState.localityParams.length === 0 ||
    searchContextState.preferredLocations?.some(
      ({ coordinates }) => !coordinates
    );

  const hasCensusData = !isIntegrationUser
    ? !!user?.subscription?.config.appFeatures.dataSources.includes(
        ApiDataSource.CENSUS
      )
    : false;

  const hasElectionData = !isIntegrationUser
    ? !!user?.subscription?.config.appFeatures.dataSources.includes(
        ApiDataSource.FEDERAL_ELECTION
      )
    : false;

  const hasPollutionData = !isIntegrationUser
    ? !!user?.subscription?.config.appFeatures.dataSources.includes(
        ApiDataSource.PARTICLE_POLLUTION
      )
    : false;

  const fetchLocationSearchData = async (
    items: IBusyModalItem[]
  ): Promise<ApiSearchResponse> => {
    items.push({
      key: "location-search",
    });
    setBusyModalItems([...items]);

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
      payload: undefined,
    });

    const preferredLocations = searchContextState.preferredLocations || [];

    if (preferredLocations.length > 0) {
      preferredLocations.forEach((location, i) => {
        if (!location.title) {
          location.title = `Wichtige Adresse ${i}`;
        }
      });
    }

    const search: ApiSearch = {
      preferredLocations,
      searchTitle: searchContextState?.placesLocation?.label || "Mein Standort",
      coordinates: searchContextState.location!,
      meansOfTransportation: searchContextState.transportationParams,
      preferredAmenities: getUncombinedOsmEntityTypes(
        searchContextState.localityParams
      ).map((l: ApiOsmEntity) => l.name),
      integrationId: searchContextState.realEstateListing?.integrationId,
    };

    const searchResponse = await createLocation(search);

    searchContextDispatch({
      type: SearchContextActionTypes.SET_SEARCH_RESPONSE,
      payload: searchResponse,
    });

    if (hasElectionData) {
      items.push({
        key: "fetch-election-data",
      });
      setBusyModalItems([...items]);

      const federalElectionData = await fetchFederalElectionData(
        searchContextState.location!
      );

      searchContextDispatch({
        type: SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA,
        payload: federalElectionData!,
      });
    }

    if (hasPollutionData) {
      items.push({
        key: "fetch-particle-pollution-data",
      });
      setBusyModalItems([...items]);

      const particlePollutionData = await fetchParticlePollutionData(
        searchContextState.location!
      );

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PARTICLE_POLLUTION_DATA,
        payload: particlePollutionData,
      });
    }

    if (hasCensusData) {
      items.push({
        key: "fetch-census-data",
      });
      setBusyModalItems([...items]);

      const censusData = await fetchCensusData(searchContextState.location!);

      searchContextDispatch({
        type: SearchContextActionTypes.SET_CENSUS_DATA,
        payload: censusData,
      });
    }

    searchContextDispatch({
      type: SearchContextActionTypes.CLEAR_MAP_CLIPPINGS,
    });

    let filteredRealEstateListings;

    if (realEstateState?.listings?.length) {
      filteredRealEstateListings = realEstateState.listings.filter(
        (listing) =>
          listing.coordinates!.lat !== searchContextState.location!.lat ||
          listing.coordinates!.lng !== searchContextState.location!.lng
      );
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        searchResponse,
        listings: filteredRealEstateListings,
        locations: searchContextState.preferredLocations,
      }),
    });

    return searchResponse;
  };

  const handleAnalysis = async (
    onFinish: (snapshotResponse: ApiSearchResultSnapshotResponse) => void,
    onFinally?: () => void
  ): Promise<void> => {
    let createdSnapshotResponse;
    let isFinishedAnalysis = false;

    try {
      setIsShownBusyModal(true);

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_BUSY,
        payload: true,
      });

      setBusyModalItemCount(
        +(hasElectionData || 0) +
          +(hasPollutionData || 0) +
          +(hasCensusData || 0) +
          1 +
          (searchContextState.preferredLocations?.length!
            ? searchContextState.preferredLocations!.length * 2 + 1
            : 1)
      );

      const items: IBusyModalItem[] = [];
      const searchResponse = await fetchLocationSearchData(items);

      const meansFromResponse =
        deriveAvailableMeansFromResponse(searchResponse);

      const activeMeans =
        searchContextState.responseConfig &&
        searchContextState.responseConfig.defaultActiveMeans
          ? [...searchContextState.responseConfig.defaultActiveMeans]
          : meansFromResponse;

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS,
        payload: [...activeMeans],
      });

      createdSnapshotResponse = await createSnapshot({
        setBusyModalItems,
        searchResponse,
        busyModalItems: items,
      });

      items.push({
        key: "create-snapshot",
      });
      setBusyModalItems([...items]);

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: createdSnapshotResponse.config,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: createdSnapshotResponse.snapshot.transportationParams,
      });

      if (createdSnapshotResponse.snapshot.realEstateListing) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
          payload: createdSnapshotResponse.snapshot.realEstateListing,
        });
      }

      isFinishedAnalysis = true;
    } catch (error) {
      toastError(
        "Fehler bei der Suchausführung. Bitte zu einem späteren Zeitpunkt wiederholen."
      );

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_BUSY,
        payload: false,
      });

      console.error(error);
    } finally {
      if (onFinally) {
        onFinally();
      }

      setIsShownBusyModal(false);
      setBusyModalItems([]);
    }

    if (isFinishedAnalysis && createdSnapshotResponse) {
      onFinish(createdSnapshotResponse);
    }
  };

  const performAnalysis = async (): Promise<void> => {
    const onFinish = ({
      id: snapshotId,
    }: ApiSearchResultSnapshotResponse): void => {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_SNAPSHOT_ID,
        payload: snapshotId,
      });

      if (isIntegrationUser) {
        history.push(`${snapshotEditorPath}/${snapshotId}`, {
          isNewSnapshot: true,
        });
      } else {
        history.push(`${snapshotEditorPath}/${snapshotId}`, {
          isNewSnapshot: true,
        });
      }
    };

    const onFinally = () => {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_BUSY,
        payload: false,
      });
    };

    await handleAnalysis(onFinish, onFinally);
  };

  const IncreaseLimitModal: FunctionComponent<{
    modalConfig: ModalConfig;
  }> = ({ modalConfig }) => (
    <FormModal modalConfig={modalConfig}>
      <IncreaseLimitFormHandler
        limitType={limitType || ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS}
        modelName={modelData?.name}
        modelId={modelData?.id}
      />
    </FormModal>
  );

  const getSearchButton = (searchButtonClasses?: string): ReactNode => {
    const defaultClasses = "btn bg-primary-gradient w-full sm:w-auto";

    const resultingClasses = isSearchButtonDisabled
      ? defaultClasses
      : searchButtonClasses || defaultClasses;

    const searchButtonTitle = isNewRequest
      ? "Analyse & Karte erstellen "
      : "Analyse & Karte aktualisieren ";

    const increaseLimitSearchButton: ReactNode = (
      <button
        type="button"
        disabled={isSearchButtonDisabled}
        data-tour="start-search"
        className={resultingClasses}
      >
        {searchButtonTitle}
        <img className="ml-1 -mt-0.5" src={nextIcon} alt="icon-next" />
      </button>
    );

    const increaseRequestLimitSearchModalConfig: ModalConfig = {
      modalTitle: "Abfragelimit erreicht",
      submitButtonTitle: "Neues Kontingent kaufen",
      modalButton: increaseLimitSearchButton,
    };

    return (
      <Fragment key="search-button">
        {limitType ? (
          <IncreaseLimitModal
            modalConfig={increaseRequestLimitSearchModalConfig}
          />
        ) : (
          <button
            data-tour="start-search"
            type="button"
            disabled={isSearchButtonDisabled}
            onClick={performAnalysis}
            className={
              searchContextState.searchBusy
                ? `${resultingClasses} loading`
                : resultingClasses
            }
          >
            <span className="-mt-1">{searchButtonTitle}</span>
            <img
              className="ml-1 -mt-1"
              style={{
                filter:
                  "invert(62%) sepia(87%) saturate(446%) hue-rotate(354deg) brightness(95%) contrast(92%)",
              }}
              src={nextIcon}
              alt="icon-next"
            />
          </button>
        )}
      </Fragment>
    );
  };

  return (
    <DefaultLayout
      title={
        isIntegrationUser
          ? `Adresse: ${searchContextState.placesLocation?.label}`
          : "Umfeldanalyse"
      }
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
      actionsTop={getSearchButton("btn bg-white-primary w-full sm:w-auto")}
      actionsBottom={[<div key="dummy" />, getSearchButton()]}
    >
      <TourStarter
        tour={
          isIntegrationUser
            ? ApiTourNamesEnum.INT_SEARCH
            : ApiTourNamesEnum.SEARCH
        }
      />
      {isShownBusyModal && (
        <BusyModal
          items={busyModalItems}
          itemCount={busyModalItemCount}
          isAnimated={true}
          isRandomMessages={true}
        />
      )}
      <Formik initialValues={{ lat: "", lng: "" }} onSubmit={() => {}}>
        <Form>
          {!isIntegrationUser && (
            <>
              <h2 className="search-params-first-title">
                Adresse der Immobilie
              </h2>
              <div className="sub-content grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* TODO there could be an error because of this component - useEffect subscription or something like that */}
                <LocationAutocomplete
                  value={placesLocation}
                  setValue={() => {}}
                  afterChange={onLocationAutocompleteChange}
                />
                <div className="flex flex-wrap items-end gap-4">
                  <MyLocationButton
                    classes="btn bg-primary-gradient w-full sm:w-auto"
                    onComplete={onMyLocationChange}
                  />
                </div>
              </div>
              <div className="flex flex-wrap sm:gap-4">
                {/* TODO there could be an error because of this component - useEffect subscription or something like that */}
                <LatestUserRequestsDropDown />
                <RealEstateDropDown user={user} />
              </div>
            </>
          )}
          <h2
            className={
              isIntegrationUser ? "search-params-first-title" : undefined
            }
          >
            Mobilität & Analyseradius
          </h2>
          <div className="sub-content">
            <TransportationParams
              values={searchContextState.transportationParams}
              onChange={(newParams) => {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
                  payload: newParams,
                });
              }}
            />
            <PotentialCustomerDropDown />
          </div>
          <h2>Points-of-Interest</h2>
          <LocalityParams
            values={searchContextState.localityParams}
            onChange={(newValues) => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
                payload: newValues,
              });
            }}
          />
          <h2>Wichtige Adressen: für Tür-zu-Tür Routen in der Karte</h2>
          <div className="sub-content">
            <ImportantAddresses
              inputValues={searchContextState.preferredLocations}
              onChange={(importantAddresses) => {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
                  payload: importantAddresses,
                });
              }}
            />
          </div>
        </Form>
      </Formik>
    </DefaultLayout>
  );
};

export default SearchParamsPage;
