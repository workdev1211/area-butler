import { FunctionComponent, useContext, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import DefaultLayout from "../layout/defaultLayout";
// TODO implement a tour
// import TourStarter from "tour/TourStarter";
import { UserActionTypes, UserContext } from "context/UserContext";
import EmbeddableMapsTable from "../map-snapshots/EmbeddableMapsTable";
import { useLocationData } from "../hooks/locationdata";
import { useUserState } from "../hooks/userstate";

const MapSnapshotsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { userState, userDispatch } = useContext(UserContext);
  const { getCurrentUser } = useUserState();
  const { fetchSnapshots } = useLocationData();

  const user = getCurrentUser();
  const isIntegrationUser = "integrationUserId" in user;
  const hasSubscription = isIntegrationUser || !!user?.subscription;

  const hasHtmlSnippet =
    isIntegrationUser ||
    (hasSubscription && user?.subscription!.config.appFeatures.htmlSnippet);

  const embeddableMaps = userState.embeddableMaps || [];

  // called too often, conditions should be reviewed
  useEffect(() => {
    if (!user || !hasHtmlSnippet) {
      return;
    }

    const fetchEmbeddableMaps = async (): Promise<void> => {
      const embeddableMaps = await fetchSnapshots();

      userDispatch({
        type: UserActionTypes.SET_EMBEDDABLE_MAPS,
        payload: embeddableMaps,
      });
    };

    void fetchEmbeddableMaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <DefaultLayout title={t(IntlKeys.nav.cards)} withHorizontalPadding={false}>
      {/* TODO implement a tour */}
      {/*<TourStarter tour="realEstates" />*/}
      {hasSubscription && hasHtmlSnippet && embeddableMaps.length > 0 && (
        <EmbeddableMapsTable embeddableMaps={embeddableMaps} />
      )}
    </DefaultLayout>
  );
};

export default MapSnapshotsPage;
