import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import DefaultLayout from "../layout/defaultLayout";
import BackButton from "../layout/BackButton";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { RealEstateContext } from "../context/RealEstateContext";
import { RealEstateFormHandler } from "../real-estates/RealEstateFormHandler";
import { SearchContext } from "context/SearchContext";
// import { useRealEstateData } from "../hooks/realestatedata";

export interface IRealEstatePageRouterProps {
  realEstateId: string;
}

const defaultRealEstate: Partial<ApiRealEstateListing> = {
  name: "Neues Objekt",
};

const RealEstatePage: FunctionComponent = () => {
  const {
    searchContextState: { storedContextState },
  } = useContext(SearchContext);
  const { realEstateState } = useContext(RealEstateContext);

  // const { fetchRealEstates } = useRealEstateData();
  const { realEstateId } = useParams<IRealEstatePageRouterProps>();

  const isNewRealEstate =
    realEstateId === "new" || realEstateId === "from-result";

  let initialRealEstate = { ...defaultRealEstate };

  const [realEstate, setRealEstate] =
    useState<Partial<ApiRealEstateListing>>(initialRealEstate);
  const [busy, setBusy] = useState(false);

  if (realEstateId === "from-result" && storedContextState) {
    initialRealEstate = {
      ...initialRealEstate,
      address: storedContextState.address,
    };
  }

  // TODO REMOVE IN THE FUTURE
  // useEffect(() => {
  //   const getRealEstates = (): Promise<void> => {
  //     return fetchRealEstates();
  //   };
  //
  //   void getRealEstates();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (isNewRealEstate) {
      setRealEstate(initialRealEstate);
      return;
    }

    setRealEstate(
      realEstateState.listings.find(
        (e: ApiRealEstateListing) => e.id === realEstateId
      ) ?? initialRealEstate
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realEstateState.listings, isNewRealEstate, realEstateId]);

  const formId = `form-${uuid()}`;

  const beforeSubmit = (): void => {
    setBusy(true);
  };

  const postSubmit = (): void => {
    setBusy(false);
  };

  const baseClasses = "btn bg-primary-gradient w-full sm:w-auto";

  const SubmitButton: FunctionComponent = () => {
    const classes = `${baseClasses} ml-auto`;

    return (
      <button
        form={formId}
        key="submit"
        type="submit"
        disabled={busy}
        className={busy ? `busy ${classes}` : classes}
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
