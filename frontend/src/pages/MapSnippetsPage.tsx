import { FunctionComponent, useContext, useEffect } from "react";

import DefaultLayout from "../layout/defaultLayout";
import { useHttp } from "../hooks/http";
// TODO implement a tour
// import TourStarter from "tour/TourStarter";
import { UserActionTypes, UserContext } from "context/UserContext";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import EmbeddableMapsTable from "../map-snippets/EmbeddableMapsTable";

const MapSnippetsPage: FunctionComponent = () => {
  const { get } = useHttp();
  const { userState, userDispatch } = useContext(UserContext);

  const user = userState.user!;
  const hasSubscription = !!user?.subscription;
  const hasHtmlSnippet =
    hasSubscription && user?.subscription!.config.appFeatures.htmlSnippet;

  const embeddableMaps = userState.embeddableMaps || [];

  useEffect(() => {
    if (user) {
      const fetchEmbeddableMaps = async () => {
        const embeddableMaps: ApiSearchResultSnapshotResponse[] = (
          await get<ApiSearchResultSnapshotResponse[]>(
            "/api/location/snapshots"
          )
        ).data;

        userDispatch({
          type: UserActionTypes.SET_EMBEDDABLE_MAPS,
          payload: embeddableMaps,
        });
      };

      if (hasHtmlSnippet) {
        void fetchEmbeddableMaps();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <DefaultLayout title="Meine Karten" withHorizontalPadding={false}>
      {/*TODO implement a tour*/}
      {/*<TourStarter tour="realEstates" />*/}
      {hasSubscription && hasHtmlSnippet && embeddableMaps.length > 0 && (
        <EmbeddableMapsTable embeddableMaps={embeddableMaps} />
      )}
    </DefaultLayout>
  );
};

export default MapSnippetsPage;
