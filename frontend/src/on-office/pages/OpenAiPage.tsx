import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import OpenAiModule from "../../components/open-ai/OpenAiModule";
import { LoadingMessage } from "../OnOfficeContainer";
import { SearchContext } from "../../context/SearchContext";
import DefaultLayout from "../../layout/defaultLayout";
import { RequestStatusTypesEnum } from "../../../../shared/types/types";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { checkProdContAvailability } from "../../shared/integration.functions";

const OpenAiPage: FunctionComponent = () => {
  const { searchContextState } = useContext(SearchContext);
  const { userState, userDispatch } = useContext(UserContext);
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

  if (!snapshotId) {
    return <LoadingMessage />;
  }

  return (
    <DefaultLayout
      title="KI Texte"
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
    >
      <div className="flex flex-col my-5 gap-5">
        <h1 className="text-xl flex items-center gap-2">
          <span>KI Texte aus der magischen Feder</span>
          <span className="badge badge-primary">BETA</span>
        </h1>
        <div className="text-justify text-base">
          Unser KI-Textgenerator bietet Inspiration für die Konstruktion von
          Texten, insbesondere bei Schwierigkeiten bei der Struktur und
          Formulierung. Er bezieht Umgebungsdaten und Informationen zur
          Immobilie mit ein. Das Feature befindet sich derzeit in der Beta-Phase
          und es wird empfohlen, die Fakten vor Verwendung zu überprüfen.
        </div>
        <OpenAiModule
          searchResultSnapshotId={snapshotId}
          onModuleStatusChange={(isReady) => {
            setIsGenerateButtonDisabled(!isReady);
          }}
          isFetchResponse={isFetchResponse}
          onResponseFetched={(queryType, requestStatus) => {
            setIsFetchResponse(false);

            if (requestStatus === RequestStatusTypesEnum.FAILURE) {
              if (
                !checkProdContAvailability(
                  userState.integrationUser!,
                  queryType
                )
              ) {
                history.push("/products");
              }

              return;
            }

            userDispatch({
              type: UserActionTypes.DECR_AVAIL_PROD_CONT,
              payload: queryType,
            });
          }}
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
