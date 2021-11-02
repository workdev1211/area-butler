import FormModal, { ModalConfig } from "components/FormModal";
import { PotentialCustomerActions, PotentialCustomerContext } from "context/PotentialCustomerContext";
import { RealEstateActions, RealEstateContext } from "context/RealEstateContext";
import { UserContext } from "context/UserContext";
import { Form, Formik } from "formik";
import PotentialCustomerDropDown from "potential-customer/PotentialCustomerDropDown";
import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import RealEstateDropDown from "real-estates/RealEstateDropDown";
import { deriveAddressFromCoordinates as derivePlacesLocationFromCoordinates, deriveTotalRequestContingent, toastError } from "shared/shared.functions";
import IncreaseRequestLimitFormHandler from "user/IncreaseRequestLimitFormHandler";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { ApiCoordinates, ApiOsmEntity, ApiSearch, ApiSearchResponse, ApiUser } from "../../../shared/types/types";
import nextIcon from "../assets/icons/icons-16-x-16-outline-ic-next.svg";
import ImportantAddresses from "../components/ImportantAddresses";
import Input from "../components/Input";
import LocalityParams from "../components/LocalityParams";
import LocationAutocomplete from "../components/LocationAutocomplete";
import MyLocationButton from "../components/MyLocationButton";
import TransportationParams from "../components/TransportationParams";
import { SearchContext, SearchContextActions } from "../context/SearchContext";
import { useCensusData } from "../hooks/censusdata";
import { useHttp } from "../hooks/http";
import DefaultLayout from "../layout/defaultLayout";

const SearchParamsPage: React.FunctionComponent = () => {
    const {get, post} = useHttp();
    const {fetchNearData} = useCensusData();
    const {userState} = useContext(UserContext);
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);
    const {potentialCustomerDispatch} = useContext(PotentialCustomerContext);
    const {realEstateDispatch} = useContext(RealEstateContext);

    useEffect(() => {
        const fetchCustomers = async () => {
            const response = await get<ApiPotentialCustomer[]>('/api/potential-customers');
            potentialCustomerDispatch({
                type: PotentialCustomerActions.SET_POTENTIAL_CUSTOMERS,
                payload: response.data
            })
        };
        fetchCustomers();
    }, [true]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const fetchRealEstates = async () => {
            const response = await get<ApiRealEstateListing[]>("/api/real-estate-listings")
            realEstateDispatch({
                type: RealEstateActions.SET_REAL_ESTATES,
                payload: response.data
            })
        };
        fetchRealEstates();
    }, [true]); // eslint-disable-line react-hooks/exhaustive-deps

    const onLocationAutocompleteChange = (payload: any) => {
        searchContextDispatch({type: SearchContextActions.SET_PLACES_LOCATION, payload: payload.value});
        if (payload.coordinates) {
            searchContextDispatch({type: SearchContextActions.SET_LOCATION, payload: payload.coordinates});
        }
    }

    const onMyLocationChange = async (coordinates: ApiCoordinates) => {
        searchContextDispatch({
            type: SearchContextActions.SET_LOCATION,
            payload: {
                ...coordinates
            }
        });
        const place = (await derivePlacesLocationFromCoordinates(
          coordinates
        )) || { label: "Mein Standort", value: { place_id: "123" } };
        searchContextDispatch({
          type: SearchContextActions.SET_PLACES_LOCATION,
          payload: place,
        });
    }

    const user: ApiUser = userState.user;
    const totalRequestContingent = deriveTotalRequestContingent(user);
    const requestsExecuted = user?.requestsExecuted;
    const requestLimitExceeded = requestsExecuted >= totalRequestContingent;


    const searchButtonDisabled = searchContextState.searchBusy ||
                                 !searchContextState.location?.lat ||
                                 !searchContextState.location?.lng ||
                                 searchContextState.transportationParams.length === 0 ||
                                 searchContextState.localityParams.length === 0

    const increaseLimitButton: React.ReactNode = (
      <button
        type="button"
        disabled={searchButtonDisabled}
        className="btn bg-primary-gradient w-full sm:w-auto ml-auto"
      >
        Analyse Starten{" "}
        <img className="ml-1 -mt-0.5" src={nextIcon} alt="icon-next" />
      </button>
    );
    const increaseRequestLimitModalConfig: ModalConfig = {
        modalTitle: 'Abfragelimit erreicht',
        buttonTitle: 'Analyse starten',
        submitButtonTitle: 'Neues Kontingent kaufen',
        modalButton: increaseLimitButton
    }

    const IncreaseLimitModal: React.FunctionComponent<any> = () => (
            <FormModal modalConfig={increaseRequestLimitModalConfig}>
                <IncreaseRequestLimitFormHandler />
            </FormModal>
    );

    const SearchButton: React.FunctionComponent<any> = () => {
        const history = useHistory();
        const performLocationSearch = async () => {
            try {
                searchContextDispatch({type: SearchContextActions.SET_SEARCH_BUSY, payload: true});
                const search: ApiSearch = {
                    coordinates: searchContextState.location!,
                    meansOfTransportation: searchContextState.transportationParams,
                    preferredAmenities: searchContextState.localityParams.map((l: ApiOsmEntity) => l.name),
                };
                const result = await post<ApiSearchResponse>(
                    "/api/location/search",
                    search
                );
                searchContextDispatch({
                    type: SearchContextActions.SET_SEARCH_RESPONSE,
                    payload: result.data
                })
                const zensusData = await fetchNearData(searchContextState.location);
                searchContextDispatch({
                    type: SearchContextActions.SET_ZENSUS_DATA,
                    payload: zensusData
                });
                history.push('/search-result');
            } catch (error) {
                toastError("Fehler bei der Suchausführung. Bitte zu einem späteren Zeitpunkt wiederholen.")
                console.error(error);
            } finally {
                searchContextDispatch({type: SearchContextActions.SET_SEARCH_BUSY, payload: false});
            }
        }

        const classes = 'btn bg-primary-gradient w-full sm:w-auto ml-auto';

        return <button
            type="button"
            disabled={searchButtonDisabled}
            onClick={performLocationSearch}
            className={searchContextState.searchBusy ? `${classes} loading` : classes}
        >
            Analyse starten <img className="ml-1 -mt-0.5" src={nextIcon} alt="icon-next"/>
        </button>
    }

    return (
      <DefaultLayout
        title="Umgebungsanalyse"
        withHorizontalPadding={true}
        actionBottom={[
          !requestLimitExceeded ? (
            <SearchButton key="search-button" />
          ) : (
            <IncreaseLimitModal key="search-button"></IncreaseLimitModal>
          ),
        ]}
      >
        <Formik initialValues={{ lat: "", lng: "" }} onSubmit={() => {}}>
          <Form>
            <h2>Standort</h2>
            <div className="sub-content grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LocationAutocomplete
                value={searchContextState.placesLocation}
                setValue={() => {}}
                afterChange={onLocationAutocompleteChange}
              />
              <div className="flex flex-wrap items-end gap-4">
                <RealEstateDropDown></RealEstateDropDown>
                <Input
                  label="Lat"
                  type="text"
                  name="lat"
                  readOnly={true}
                  value={searchContextState.location?.lat || "-"}
                  className="input input-bordered w-full"
                  placeholder="Latitude"
                />
                <Input
                  label="Long"
                  type="text"
                  name="long"
                  readOnly={true}
                  value={searchContextState.location?.lng || "-"}
                  className="input input-bordered w-full"
                  placeholder="Longitude"
                />
                <MyLocationButton
                  classes="tour_my_location_button btn bg-primary-gradient w-full sm:w-auto"
                  onComplete={onMyLocationChange}
                />
              </div>
            </div>
            <h2>Mobilität</h2>
            <div className="sub-content">
              <TransportationParams
                values={searchContextState.transportationParams}
                onChange={(newParams) =>
                  searchContextDispatch({
                    type: SearchContextActions.SET_TRANSPORTATION_PARAMS,
                    payload: newParams,
                  })
                }
              />
              <h3 className="mt-8">Wichtige Adressen</h3>
              <ImportantAddresses
                inputValues={searchContextState.preferredLocations}
                onChange={(importantAdresses) =>
                  searchContextDispatch({
                    type: SearchContextActions.SET_PREFERRED_LOCATIONS,
                    payload: importantAdresses,
                  })
                }
              />
              <PotentialCustomerDropDown></PotentialCustomerDropDown>
            </div>
            <h2>Lokalitäten</h2>
            <LocalityParams
              values={searchContextState.localityParams}
              onChange={(newValues) =>
                searchContextDispatch({
                  type: SearchContextActions.SET_LOCALITY_PARAMS,
                  payload: newValues,
                })
              }
            />
          </Form>
        </Formik>
      </DefaultLayout>
    );
}

export default SearchParamsPage;
