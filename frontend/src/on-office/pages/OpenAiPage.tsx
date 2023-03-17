import { FunctionComponent, useContext, useEffect, useState } from "react";

import { useHttp } from "../../hooks/http";
import { ApiSearchResultSnapshotResponse } from "../../../../shared/types/types";
import { OnOfficeContext } from "../../context/OnOfficeContext";
import OpenAiModule from "../../components/open-ai/OpenAiModule";
import { LoadingMessage } from "../../OnOffice";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";

const OpenAiPage: FunctionComponent = () => {
  const { post } = useHttp();

  const { onOfficeContextState } = useContext(OnOfficeContext);

  const [searchResultSnapshotId, setSearchResultSnapshotId] =
    useState<string>();
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);

  useEffect(() => {
    console.log(1, "OpenAiPage");

    const findOrCreateSnapshot = async () => {
      const { id } = (
        await post<ApiSearchResultSnapshotResponse>(
          "/api/on-office/find-create-snapshot",
          {
            integrationType: IntegrationTypesEnum.ON_OFFICE,
            estateId: onOfficeContextState.estateId,
            extendedClaim: onOfficeContextState.extendedClaim,
          }
        )
      ).data;

      console.log(9, "OpenAiPage", id);
      setSearchResultSnapshotId(id);
    };

    void findOrCreateSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!searchResultSnapshotId) {
    return <LoadingMessage />;
  }

  return (
    <div className="flex flex-col mx-10 my-5 gap-5">
      <h1 className="text-xl flex items-center gap-2">
        <span>KI Texte aus der magischen Feder</span>
        <span className="badge badge-primary">BETA</span>
      </h1>
      <div className="text-justify text-base">
        Unser KI-Textgenerator bietet Inspiration für die Konstruktion von
        Texten, insbesondere bei Schwierigkeiten bei der Struktur und
        Formulierung. Er bezieht Umgebungsdaten und Informationen zur Immobilie
        mit ein. Das Feature befindet sich derzeit in der Beta-Phase und es wird
        empfohlen, die Fakten vor Verwendung zu überprüfen.
      </div>
      <OpenAiModule
        searchResultSnapshotId={searchResultSnapshotId}
        onModuleStatusChange={(isReady) => {
          setIsGenerateButtonDisabled(!isReady);
        }}
        isFetchResponse={isFetchResponse}
        onResponseFetched={() => {
          setIsFetchResponse(false);
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
  );
};

export default OpenAiPage;
