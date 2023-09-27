import { FunctionComponent, useContext, useEffect } from "react";

import DefaultLayout from "../layout/defaultLayout";
// TODO implement a tour
// import TourStarter from "tour/TourStarter";
import { UserActionTypes, UserContext } from "context/UserContext";
import EmbeddableMapsTable from "../map-snapshots/EmbeddableMapsTable";
import { useLocationData } from "../hooks/locationdata";
import { useTools } from "../hooks/tools";

const MapSnapshotsPage: FunctionComponent = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { getActualUser } = useTools();
  const { fetchSnapshots } = useLocationData();

  const user = getActualUser();
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

    // TODO REMOVE IN THE FUTURE
    // let queryParams: string;
    //
    // if (isIntegrationUser) {
    //   queryParams = new URLSearchParams({
    //     filter: JSON.stringify({
    //       "integrationParams.integrationId":
    //         searchContextState.realEstateListing?.integrationId,
    //     }),
    //   }).toString();
    // }

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
    <DefaultLayout title="Meine Karten" withHorizontalPadding={false}>
      {/* TODO implement a tour */}
      {/*<TourStarter tour="realEstates" />*/}
      {hasSubscription && hasHtmlSnippet && embeddableMaps.length > 0 && (
        <EmbeddableMapsTable embeddableMaps={embeddableMaps} />
      )}
    </DefaultLayout>
  );
};

export default MapSnapshotsPage;
