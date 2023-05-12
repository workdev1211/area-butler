import { FunctionComponent, useContext, useState, Fragment } from "react";

import "./UserCrmSettings.scss";

import { UserActionTypes, UserContext } from "../context/UserContext";
import { useHttp } from "../hooks/http";
import {
  IApiUserApiConnectionSettingsReq,
  TApiUserApiConnections,
} from "../../../shared/types/types";
import { ApiRealEstateExtSourcesEnum } from "../../../shared/types/real-estate";
import { apiConnectionTypeNames } from "../../../shared/constants/real-estate";
import { toastError, toastSuccess } from "../shared/shared.functions";

const UserCrmSettings: FunctionComponent = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { post } = useHttp();

  const apiConnections =
    userState.user?.apiConnections || ({} as TApiUserApiConnections);

  const [apiKey, setApiKey] = useState<string | undefined>(
    apiConnections[ApiRealEstateExtSourcesEnum.PROPSTACK]?.apiKey
  );

  return (
    <div className="flex flex-col mt-10 gap-3">
      <h1 className="text-xl font-bold">CRM-Einstellungen</h1>
      <div>
        Die folgenden Einstellungen definieren die Parameter, die zum Abrufen
        der Daten aus externen CRMs erforderlich sind, z.b. Propstack, onOffice
        usw.
      </div>
      <div className="api-connections-grid grid items-center gap-5">
        {Object.values(ApiRealEstateExtSourcesEnum).map((connectionType) => (
          <Fragment key={connectionType}>
            <div className="font-bold pt-4">
              {apiConnectionTypeNames[connectionType]}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">API Key</span>
              </label>
              <input
                type="text"
                placeholder="API Key"
                className="input input-bordered"
                value={apiKey}
                onChange={({ target: { value } }) => {
                  setApiKey(value);
                }}
              />
            </div>
            <div className="pt-4">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!apiKey?.length) {
                    return;
                  }

                  try {
                    const connectionSettings = { connectionType, apiKey };

                    await post<void, IApiUserApiConnectionSettingsReq>(
                      "/api/real-estate-listing/crm-test",
                      connectionSettings
                    );

                    toastSuccess("Die Verbindung wurde erfolgreich getestet.");

                    userDispatch({
                      type: UserActionTypes.SET_API_CONNECTION,
                      payload: connectionSettings,
                    });
                  } catch (e) {
                    toastError("Der Fehler ist aufgetreten!");
                    setApiKey(undefined);
                  }
                }}
              >
                Testen und speichern
              </button>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default UserCrmSettings;
