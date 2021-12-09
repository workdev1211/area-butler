import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { SearchResultSnapshot } from '../schema/search-result-snapshot.schema';

export const mapSearchResultSnapshotToApiEmbeddableMap = (
  searchResultSnapshot: SearchResultSnapshot,
): ApiSearchResultSnapshotResponse => ({
  snapshot: searchResultSnapshot.snapshot,
  token: searchResultSnapshot.token,
  mapboxToken: searchResultSnapshot.mapboxAccessToken,
  createdAt: searchResultSnapshot.createdAt
});
