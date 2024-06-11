import { FC, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import DefaultLayout from "../layout/defaultLayout";
import BackButton from "../layout/BackButton";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { RealEstateContext } from "../context/RealEstateContext";
import { RealEstateFormHandler } from "../real-estates/RealEstateFormHandler";
import { SearchContext } from "context/SearchContext";
import RealEstateIntFormHandler from "../real-estates/RealEstateIntFormHandler";
import { useTools } from "../hooks/tools";
import { useRealEstateData } from "../hooks/realestatedata";

interface IRealEstatePageRouterProps {
  realEstateId: string;
}

export type TInitRealEstate = Partial<ApiRealEstateListing> &
  Pick<ApiRealEstateListing, "name">;

const RealEstatePage: FC = () => {
  const { t } = useTranslation();
  const {
    searchContextState: { storedContextState },
  } = useContext(SearchContext);
  const {
    realEstateState: { isListingsFetched, listings },
  } = useContext(RealEstateContext);

  const defaultRealEstate: TInitRealEstate = {
    name: t(IntlKeys.realEstate.createObject),
  };

  const { realEstateId } = useParams<IRealEstatePageRouterProps>();
  const { getActualUser } = useTools();
  const { fetchRealEstates } = useRealEstateData();

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;

  const [busy, setBusy] = useState(false);

  const isNewRealEstate =
    realEstateId === "new" || realEstateId === "from-result";

  useEffect(() => {
    if (!isListingsFetched) {
      void fetchRealEstates();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListingsFetched]);

  let initialRealEstate: TInitRealEstate = { ...defaultRealEstate };

  if (realEstateId === "from-result" && storedContextState) {
    initialRealEstate = {
      ...initialRealEstate,
      address: storedContextState.address,
    };
  }

  const realEstate = isNewRealEstate
    ? initialRealEstate
    : listings.find((e: ApiRealEstateListing) => e.id === realEstateId) ??
      initialRealEstate;

  const formId = `form-${uuid()}`;

  const beforeSubmit = (): void => {
    setBusy(true);
  };

  const postSubmit = (): void => {
    setBusy(false);
  };

  const baseClasses = "btn bg-primary-gradient w-full sm:w-auto";

  const SubmitButton: FC = () => {
    const classes = `${baseClasses} ml-auto`;

    return (
      <button
        form={formId}
        key="submit"
        type="submit"
        disabled={busy}
        className={busy ? `busy ${classes}` : classes}
      >
        {realEstate.id ? t(IntlKeys.common.save) : t(IntlKeys.common.create)}
      </button>
    );
  };

  return (
    <DefaultLayout
      title={realEstate.name || t(IntlKeys.realEstate.unknownObject)}
      withHorizontalPadding={true}
      actionsBottom={[
        <BackButton to="/real-estates" key="real-estates-back" />,
        <SubmitButton key="real-estates-submit" />,
      ]}
    >
      <div className="py-20">
        {isIntegrationUser ? (
          <RealEstateIntFormHandler
            realEstate={realEstate as ApiRealEstateListing}
            formId={formId}
            beforeSubmit={beforeSubmit}
            postSubmit={postSubmit}
          />
        ) : (
          <RealEstateFormHandler
            realEstate={realEstate}
            formId={formId}
            beforeSubmit={beforeSubmit}
            postSubmit={postSubmit}
            user={user}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default RealEstatePage;
