import { FunctionComponent, useContext } from "react";

import { SearchContext } from "../context/SearchContext";
import DefaultLayout from "../layout/defaultLayout";
import OpenAiPageContent from "./OpenAiPageContent";

const OpenAiPage: FunctionComponent = () => {
  const { searchContextState } = useContext(SearchContext);

  return (
    <DefaultLayout
      title={`Adresse: ${searchContextState.placesLocation?.label}`}
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
    >
      <OpenAiPageContent embedded={true} />
    </DefaultLayout>
  );
};

export default OpenAiPage;
