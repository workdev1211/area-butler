import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import DefaultLayout from "../layout/defaultLayout";
import { useHttp } from "../hooks/http";
import BackButton from "../layout/BackButton";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import { RealEstateFormHandler } from "../real-estates/RealEstateFormHandler";
import { localStorageSearchContext } from "../../../shared/constants/constants";
import { SearchContextState } from "context/SearchContext";

export interface RealEstatePageRouterProps {
  realEstateId: string;
}

const defaultRealEstate: Partial<ApiRealEstateListing> = {
  name: "Neues Objekt",
};

const RealEstatePage: FunctionComponent = () => {
  const { realEstateId } = useParams<RealEstatePageRouterProps>();
  const isNewRealEstate =
    realEstateId === "new" || realEstateId === "from-result";

  let initialRealEstate = { ...defaultRealEstate };

  const searchContextFromLocalStorageString = window.localStorage.getItem(
    localStorageSearchContext
  );

  if (realEstateId === "from-result" && !!searchContextFromLocalStorageString) {
    const searchContextFromLocalStorage = JSON.parse(
      searchContextFromLocalStorageString!
    ) as SearchContextState;

    initialRealEstate = {
      ...initialRealEstate,
      address: searchContextFromLocalStorage.placesLocation?.label,
    };
  }

  const [realEstate, setRealEstate] =
    useState<Partial<ApiRealEstateListing>>(initialRealEstate);
  const [busy, setBusy] = useState(false);

  const { get } = useHttp();
  const { realEstateState, realEstateDispatch } = useContext(RealEstateContext);

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

  useEffect(() => {
    if (!isNewRealEstate) {
      setRealEstate(
        realEstateState.listings.find(
          (e: ApiRealEstateListing) => e.id === realEstateId
        ) ?? initialRealEstate
      );
    } else {
      setRealEstate(initialRealEstate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realEstateState.listings, isNewRealEstate, realEstateId, setRealEstate]);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = (success: boolean) => {
    setBusy(false);
  };

  const baseClasses = "btn bg-primary-gradient w-full sm:w-auto";

  const SubmitButton: FunctionComponent = () => {
    const classes = baseClasses + " ml-auto";

    return (
      <button
        form={formId}
        key="submit"
        type="submit"
        disabled={busy}
        className={busy ? "busy " + classes : classes}
      >
        {realEstate.id ? "Speichern" : "Anlegen"}
      </button>
    );
  };

  return (
    <DefaultLayout
      title={realEstate.name || "Unbekanntes Objekt"}
      withHorizontalPadding={true}
      actionsBottom={[
        <BackButton to="/real-estates" key="real-estates-back" />,
        <SubmitButton key="real-estates-submit" />,
      ]}
    >
      <div className="py-20">
        <RealEstateFormHandler
          realEstate={realEstate}
          formId={formId}
          beforeSubmit={beforeSubmit}
          postSubmit={postSubmit}
        />
      </div>
    </DefaultLayout>
  );
};

export default RealEstatePage;
