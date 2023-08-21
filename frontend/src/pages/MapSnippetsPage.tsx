import { FunctionComponent, useContext, useEffect } from "react";

import DefaultLayout from "../layout/defaultLayout";
// TODO implement a tour
// import TourStarter from "tour/TourStarter";
import { UserActionTypes, UserContext } from "context/UserContext";
import EmbeddableMapsTable from "../map-snippets/EmbeddableMapsTable";
import { useLocationData } from "../hooks/locationdata";

const MapSnippetsPage: FunctionComponent = () => {
  const { fetchSnapshots } = useLocationData();
  const { userState, userDispatch } = useContext(UserContext);

  const user = userState.user!;
  const hasSubscription = !!user?.subscription;
  const hasHtmlSnippet =
    hasSubscription && user?.subscription!.config.appFeatures.htmlSnippet;

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
    <DefaultLayout title="Meine Karten" withHorizontalPadding={false}>
      {/* TODO implement a tour */}
      {/*<TourStarter tour="realEstates" />*/}
      {hasSubscription && hasHtmlSnippet && embeddableMaps.length > 0 && (
        <EmbeddableMapsTable embeddableMaps={embeddableMaps} />
      )}
    </DefaultLayout>
  );
};

export default MapSnippetsPage;
