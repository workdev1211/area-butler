import { FunctionComponent, useContext } from "react";

import "./ExportTab.scss";

import { IExportTabProps } from "shared/search-result.types";
import { SearchContext } from "../../../context/SearchContext";
import { useTools } from "../../../hooks/tools";
import DigitalMedia from "./components/DigitalMedia";
import LocationExport from "./components/LocationExport";
import MapScreenshots from "./components/MapScreenshots";
import OpenAiTexts from "./components/OpenAiTexts";
// import CustomerLinks from "./components/CustomerLinks";
import CustomerData from "./components/CustomerData";

const ExportTab: FunctionComponent<IExportTabProps> = ({
  codeSnippet,
  directLink,
  searchAddress,
  snapshotId,
  performUnlock,
}) => {
  const { searchContextState } = useContext(SearchContext);

  const { getActualUser } = useTools();
  const user = getActualUser();
  const isIntegrationUser = "accessToken" in user;

  const hasOpenAiFeature =
    isIntegrationUser || !!user?.subscription?.config.appFeatures.openAi;

  const backgroundColor =
    searchContextState.responseConfig?.primaryColor ||
    "var(--primary-gradient)";

  return (
    <div className="export-tab z-9000">
      <MapScreenshots
        searchAddress={searchAddress}
        backgroundColor={backgroundColor}
      />

      <DigitalMedia
        codeSnippet={codeSnippet}
        directLink={directLink}
        searchAddress={searchAddress}
        backgroundColor={backgroundColor}
        performUnlock={performUnlock}
      />

      <LocationExport
        snapshotId={snapshotId}
        hasOpenAiFeature={hasOpenAiFeature}
        backgroundColor={backgroundColor}
        performUnlock={performUnlock}
      />

      {hasOpenAiFeature && (
        <OpenAiTexts
          snapshotId={snapshotId}
          backgroundColor={backgroundColor}
          performUnlock={performUnlock}
        />
      )}

      {/* TODO waits for the customer */}
      {/*<CustomerLinks backgroundColor={backgroundColor} />*/}

      <CustomerData backgroundColor={backgroundColor} snapshotId={snapshotId} />
    </div>
  );
};

export default ExportTab;
