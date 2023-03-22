import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import OpenAiModule from "../../components/open-ai/OpenAiModule";
import { LoadingMessage } from "../OnOfficeContainer";
import { SearchContext } from "../../context/SearchContext";
import DefaultLayout from "../../layout/defaultLayout";
import { RequestStatusTypesEnum } from "../../../../shared/types/types";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { checkProdContAvailability } from "../../shared/integration.functions";
import { ConfigContext } from "../../context/ConfigContext";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";

const OpenAiPage: FunctionComponent = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState } = useContext(SearchContext);
  const {
    userState: { integrationUser },
    userDispatch,
  } = useContext(UserContext);
  const history = useHistory();

  const [snapshotId, setSnapshotId] = useState<string>();
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);

  useEffect(() => {
    if (searchContextState.integrationSnapshotId) {
      setSnapshotId(searchContextState.integrationSnapshotId);
    }
  }, [searchContextState.integrationSnapshotId]);

  const handleResponseFetched = (
    queryType: OpenAiQueryTypeEnum,
    requestStatus: RequestStatusTypesEnum
  ) => {
    setIsFetchResponse(false);

    if (requestStatus === RequestStatusTypesEnum.FAILURE) {
      if (
        !checkProdContAvailability(
          integrationType!,
          queryType,
          integrationUser!.availProdContingents
        )
      ) {
        history.push("/products");
      }

      return;
    }

    userDispatch({
      type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
      payload: {
        integrationType: integrationType!,
        actionType: queryType,
      },
    });
  };

  if (!snapshotId) {
    return <LoadingMessage />;
  }

  return (
    <DefaultLayout
      title={`Adresse: ${searchContextState.placesLocation.label}`}
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
    >
      <div className="flex flex-col my-5 gap-5">
        <h1 className="text-xl gap-2">KI Texte aus der magischen Feder</h1>
        <div className="text-justify text-base">
          Unser KI-Textgenerator bietet Inspiration für die Konstruktion von
          Texten, insbesondere bei Schwierigkeiten bei der Struktur und
          Formulierung. Er bezieht Umgebungsdaten und Informationen zur
          Immobilie mit ein.
        </div>
        <OpenAiModule
          searchResultSnapshotId={snapshotId}
          onModuleStatusChange={(isReady) => {
            setIsGenerateButtonDisabled(!isReady);
          }}
          isFetchResponse={isFetchResponse}
          onResponseFetched={handleResponseFetched}
        />
        <div className="flex justify-end">
          <button
            className={`btn bg-primary-gradient max-w-fit self-end ${
              isFetchResponse ? "loading" : ""
            }`}
            form={"open-ai-location-description-form"}
            onClick={() => {
              setIsFetchResponse(true);
            }}
            disabled={isGenerateButtonDisabled || isFetchResponse}
          >
            Generieren
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default OpenAiPage;
