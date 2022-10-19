import {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
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
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "context/RealEstateContext";
import { UserContext } from "context/UserContext";
import { useFederalElectionData } from "hooks/federalelectiondata";
import { useParticlePollutionData } from "hooks/particlepollutiondata";
import PotentialCustomerDropDown from "potential-customer/PotentialCustomerDropDown";
import { useHistory } from "react-router-dom";
import RealEstateDropDown from "real-estates/RealEstateDropDown";
import {
  deriveAvailableMeansFromResponse,
  deriveAddressFromCoordinates as derivePlacesLocationFromCoordinates,
  deriveInitialEntityGroups,
  deriveTotalRequestContingent,
  toastError,
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import IncreaseLimitFormHandler from "user/IncreaseLimitFormHandler";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
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
  ApiUpdateSearchResultSnapshot,
  ApiUser,
  ApiUserRequests,
} from "../../../shared/types/types";
import nextIcon from "../assets/icons/icons-16-x-16-outline-ic-next.svg";
import ImportantAddresses from "../components/ImportantAddresses";
import LocalityParams from "../components/LocalityParams";
import LocationAutocomplete from "../components/LocationAutocomplete";
import MyLocationButton from "../components/MyLocationButton";
import TransportationParams, {
  defaultTransportationParams,
} from "../components/TransportationParams";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { useCensusData } from "../hooks/censusdata";
import { useHttp } from "../hooks/http";
import DefaultLayout from "../layout/defaultLayout";
import BusyModal, { IBusyModalItem } from "../components/BusyModal";
import { LimitIncreaseModelNameEnum } from "../../../shared/types/billing";
import { useAnalysis } from "../hooks/analysis";
import ExpressAnalysisModal from "../components/ExpressAnalysisModal";
import { osmEntityTypes } from "../../../shared/constants/constants";

// TODO try to fix the following error
// Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
const SearchParamsPage: FunctionComponent = () => {
  const { get, post, put } = useHttp();
  const { fetchNearData } = useCensusData();
  const { fetchElectionData } = useFederalElectionData();
  const { fetchParticlePollutionData } = useParticlePollutionData();
  const history = useHistory();
  const { createSnapshot } = useAnalysis();

  const { userState } = useContext(UserContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { potentialCustomerDispatch } = useContext(PotentialCustomerContext);
  const { realEstateDispatch, realEstateState } = useContext(RealEstateContext);

  const [isNewRequest, setIsNewRequest] = useState(true);
  const [isShownBusyModal, setIsShownBusyModal] = useState(false);
  const [busyModalItems, setBusyModalItems] = useState<IBusyModalItem[]>([]);
  const [busyModalItemCount, setBusyModalItemCount] = useState(0);
  const [limitType, setLimitType] = useState<ApiSubscriptionLimitsEnum>();
  const [modelData, setModelData] = useState<{
    name: LimitIncreaseModelNameEnum;
    id: string | undefined;
  }>();
  const [isShownMapSnippetModal, setIsShownMapSnippetModal] = useState(false);
  const [snapshotResponse, setSnapshotResponse] =
    useState<ApiSearchResultSnapshotResponse>();
  const [placesLocation, setPlacesLocation] = useState<any>(null);

  const user: ApiUser = userState.user!;

  useEffect(() => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: undefined,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: undefined,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: defaultTransportationParams,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: [],
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
      payload: osmEntityTypes,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPlacesLocation(searchContextState.placesLocation);
  }, [searchContextState.placesLocation]);

  useEffect(
    () => {
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

      const totalRequestContingent = deriveTotalRequestContingent(user);
      const requestLimitExceeded =
        user.requestsExecuted >= totalRequestContingent;

      if (!existingRequest && requestLimitExceeded) {
        if (user?.subscription?.type === ApiSubscriptionPlanType.TRIAL) {
          history.push("/profile");
          return;
        }

        limitType = ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS;
      }

      setIsNewRequest(!existingRequest);
      setLimitType(limitType);
      setModelData(modelData);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      searchContextState.location,
      userState.latestUserRequests,
      user.requestContingents,
      user.requestsExecuted,
    ]
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await get<ApiPotentialCustomer[]>(
        "/api/potential-customers"
      );

      potentialCustomerDispatch({
        type: PotentialCustomerActionTypes.SET_POTENTIAL_CUSTOMERS,
        payload: response.data,
      });
    };

    void fetchCustomers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    void fetchRealEstates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onLocationAutocompleteChange = (payload: any) => {
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

  const onMyLocationChange = async (coordinates: ApiCoordinates) => {
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: {
        ...coordinates,
      },
    });

    const place = (await derivePlacesLocationFromCoordinates(coordinates)) || {
      label: "Mein Standort",
      value: { place_id: "123" },
    };

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: place,
    });
  };

  const searchButtonDisabled =
    searchContextState.searchBusy ||
    !searchContextState.location?.lat ||
    !searchContextState.location?.lng ||
    searchContextState.transportationParams.length === 0 ||
    searchContextState.transportationParams.some((t) => !t.amount) ||
    searchContextState.localityParams.length === 0 ||
    searchContextState.preferredLocations?.some(
      ({ coordinates }) => !coordinates
    );

  const increaseLimitExpressButton: ReactNode = (
    <button
      data-tour="start-search"
      type="button"
      disabled={searchButtonDisabled}
      className="btn bg-secondary-gradient w-full sm:w-auto ml-auto"
    >
      <span>One-Klick</span>
    </button>
  );

  const increaseLimitSearchButton: ReactNode = (
    <button
      type="button"
      disabled={searchButtonDisabled}
      data-tour="start-search"
      className="btn bg-primary-gradient w-full sm:w-auto"
    >
      {isNewRequest ? "Analyse Starten " : "Analyse aktualisieren "}
      <img className="ml-1 -mt-0.5" src={nextIcon} alt="icon-next" />
    </button>
  );

  const increaseRequestLimitExpressModalConfig: ModalConfig = {
    modalTitle: "Abfragelimit erreicht",
    submitButtonTitle: "Neues Kontingent kaufen",
    modalButton: increaseLimitExpressButton,
  };

  const increaseRequestLimitSearchModalConfig: ModalConfig = {
    modalTitle: "Abfragelimit erreicht",
    submitButtonTitle: "Neues Kontingent kaufen",
    modalButton: increaseLimitSearchButton,
  };

  const IncreaseLimitModal: FunctionComponent<{ modalConfig: ModalConfig }> = ({
    modalConfig,
  }) => (
    <FormModal modalConfig={modalConfig}>
      <IncreaseLimitFormHandler
        limitType={limitType || ApiSubscriptionLimitsEnum.NUMBER_OF_REQUESTS}
        modelName={modelData?.name}
        modelId={modelData?.id}
      />
    </FormModal>
  );

  const hasCensusData =
    user.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.CENSUS
    );

  const hasElectionData =
    user.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.FEDERAL_ELECTION
    );

  const hasPollutionData =
    user.subscription?.config.appFeatures.dataSources.includes(
      ApiDataSource.PARTICLE_POLLUTION
    );

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

    const search: ApiSearch = {
      searchTitle: searchContextState?.placesLocation?.label || "Mein Standort",
      coordinates: searchContextState.location!,
      preferredLocations: searchContextState.preferredLocations || [],
      meansOfTransportation: searchContextState.transportationParams,
      preferredAmenities: searchContextState.localityParams.map(
        (l: ApiOsmEntity) => l.name
      ),
    };

    const { data: searchResponse } = await post<ApiSearchResponse>(
      "/api/location/search",
      search
    );

    searchContextDispatch({
      type: SearchContextActionTypes.SET_SEARCH_RESPONSE,
      payload: searchResponse,
    });

    if (hasElectionData) {
      items.push({
        key: "fetch-election-data",
      });
      setBusyModalItems([...items]);

      const federalElectionData = await fetchElectionData(
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
        type: SearchContextActionTypes.SET_PARTICLE_POLLUTION_ELECTION_DATA,
        payload: particlePollutionData,
      });
    }

    if (hasCensusData) {
      items.push({
        key: "fetch-census-data",
      });
      setBusyModalItems([...items]);

      const zensusData = await fetchNearData(searchContextState.location!);

      searchContextDispatch({
        type: SearchContextActionTypes.SET_ZENSUS_DATA,
        payload: zensusData!,
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
      payload: deriveInitialEntityGroups(
        searchResponse,
        undefined,
        filteredRealEstateListings,
        searchContextState.preferredLocations
      ),
    });

    return searchResponse;
  };

  const performLocationSearch = async () => {
    try {
      setIsShownBusyModal(true);
      setBusyModalItemCount(
        +(hasElectionData || 0) +
          +(hasPollutionData || 0) +
          +(hasCensusData || 0) +
          1
      );

      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_BUSY,
        payload: true,
      });

      const items: IBusyModalItem[] = [];
      await fetchLocationSearchData(items);

      history.push("/search-result");
    } catch (error) {
      toastError(
        "Fehler bei der Suchausführung. Bitte zu einem späteren Zeitpunkt wiederholen."
      );

      console.error(error);
    } finally {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_SEARCH_BUSY,
        payload: false,
      });

      setIsShownBusyModal(false);
      setBusyModalItems([]);
    }
  };

  const SearchButton: FunctionComponent<{ classes?: string }> = ({
    classes = "btn bg-primary-gradient w-full sm:w-auto",
  }) => {
    return (
      <button
        data-tour="start-search"
        type="button"
        disabled={searchButtonDisabled}
        onClick={performLocationSearch}
        className={
          searchContextState.searchBusy ? `${classes} loading` : classes
        }
      >
        <span className="-mt-1">
          {isNewRequest ? "Analyse Starten " : "Analyse aktualisieren "}
        </span>
        <img className="ml-1 -mt-1" src={nextIcon} alt="icon-next" />
      </button>
    );
  };

  const performExpressAnalysis = async (): Promise<void> => {
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

      // TODO unite createSnapshot and the put requests
      const createdSnapshotResponse = await createSnapshot(
        items,
        setBusyModalItems,
        user.email,
        searchResponse
      );

      items.push({
        key: "create-snapshot",
      });
      setBusyModalItems([...items]);

      const { config: snapshotConfig } = createdSnapshotResponse;
      snapshotConfig!.primaryColor = user.color;
      snapshotConfig!.mapIcon = user.mapIcon;

      const { data: updatedSnapshotResponse } =
        await put<ApiUpdateSearchResultSnapshot>(
          `/api/location/snapshot/${createdSnapshotResponse?.id}`,
          {
            config: snapshotConfig,
            snapshot: {
              ...createdSnapshotResponse?.snapshot,
            },
          }
        );

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: updatedSnapshotResponse.config,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
        payload: updatedSnapshotResponse.snapshot.transportationParams,
      });

      if (updatedSnapshotResponse.snapshot.realEstateListing) {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
          payload: updatedSnapshotResponse.snapshot.realEstateListing,
        });
      }

      setSnapshotResponse(createdSnapshotResponse);
      setIsShownMapSnippetModal(true);
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
      setIsShownBusyModal(false);
      setBusyModalItems([]);
    }
  };

  const ExpressAnalysisButton: FunctionComponent<{ classes?: string }> = ({
    classes = "btn bg-secondary-gradient w-full sm:w-auto ml-auto",
  }) => {
    return (
      <button
        data-tour="start-search"
        type="button"
        disabled={searchButtonDisabled}
        onClick={performExpressAnalysis}
        className={
          searchContextState.searchBusy ? `${classes} loading` : classes
        }
      >
        <span>One-Klick</span>
      </button>
    );
  };

  return (
    <DefaultLayout
      title="Suche"
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
      actionsBottom={
        limitType
          ? [
              <IncreaseLimitModal
                key="express-analysis-button"
                modalConfig={increaseRequestLimitExpressModalConfig}
              />,
              <IncreaseLimitModal
                key="search-button"
                modalConfig={increaseRequestLimitSearchModalConfig}
              />,
            ]
          : [
              <ExpressAnalysisButton key="express-analysis-button" />,
              <SearchButton key="search-button" />,
            ]
      }
      timelineStep={1}
    >
      <TourStarter tour="search" />
      {isShownBusyModal && (
        <BusyModal
          items={busyModalItems}
          itemCount={busyModalItemCount}
          isAnimated={true}
          isRandomMessages={true}
        />
      )}
      <ExpressAnalysisModal
        snapshotResponse={snapshotResponse!}
        isShownModal={isShownMapSnippetModal}
        closeModal={() => {
          setIsShownMapSnippetModal(false);
        }}
      />
      <Formik initialValues={{ lat: "", lng: "" }} onSubmit={() => {}}>
        <Form>
          <h2 className="search-params-first-title">Lage</h2>
          <div className="sub-content grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <LatestUserRequestsDropDown />
            <RealEstateDropDown />
          </div>
          <h2>Mobilität</h2>
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
          <h2>Wichtige Adressen</h2>
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
          <h2>Lokalitäten</h2>
          <LocalityParams
            values={searchContextState.localityParams}
            onChange={(newValues) => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
                payload: newValues,
              });
            }}
          />
        </Form>
      </Formik>
    </DefaultLayout>
  );
};

export default SearchParamsPage;
