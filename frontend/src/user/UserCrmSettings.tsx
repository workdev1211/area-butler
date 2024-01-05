import { FunctionComponent, useContext, useState } from "react";

import "./UserCrmSettings.scss";

import { UserActionTypes, UserContext } from "../context/UserContext";
import { useHttp } from "../hooks/http";
import {
  IApiUserApiConnectSettingsReq,
  TApiUserApiConnections,
} from "../../../shared/types/types";
import { ApiRealEstateExtSourcesEnum } from "../../../shared/types/real-estate";
import { apiConnectTypeNames } from "../../../shared/constants/real-estate";
import { toastError, toastSuccess } from "../shared/shared.functions";

const UserCrmSettings: FunctionComponent = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { post } = useHttp();

  const apiConnections =
    userState.user?.apiConnections || ({} as TApiUserApiConnections);

  const [propstackApiKey, setPropstackApiKey] = useState<string>(
    apiConnections[ApiRealEstateExtSourcesEnum.PROPSTACK]?.apiKey || ""
  );
  const [onOfficeToken, setOnOfficeToken] = useState<string>(
    apiConnections[ApiRealEstateExtSourcesEnum.ON_OFFICE]?.token || ""
  );
  const [onOfficeSecret, setOnOfficeSecret] = useState<string>(
    apiConnections[ApiRealEstateExtSourcesEnum.ON_OFFICE]?.secret || ""
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
        {/* PROPSTACK */}
        <div className="font-bold pt-4">
          {apiConnectTypeNames[ApiRealEstateExtSourcesEnum.PROPSTACK]}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">API Key</span>
          </label>
          <input
            type="text"
            placeholder="API Key"
            className="input input-bordered"
            value={propstackApiKey}
            onChange={({ target: { value } }) => {
              setPropstackApiKey(value);
            }}
          />
        </div>
        <div className="pt-4">
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!propstackApiKey?.length) {
                return;
              }

              try {
                const connectSettings = {
                  connectType: ApiRealEstateExtSourcesEnum.PROPSTACK,
                  apiKey: propstackApiKey,
                };

                await post<void, IApiUserApiConnectSettingsReq>(
                  "/api/real-estate-listing/crm-test",
                  connectSettings
                );

                toastSuccess("Die Verbindung wurde erfolgreich getestet.");

                userDispatch({
                  type: UserActionTypes.SET_API_CONNECTION,
                  payload: connectSettings,
                });
              } catch (e) {
                toastError("Der Fehler ist aufgetreten!");
                setPropstackApiKey("");
              }
            }}
          >
            Testen und speichern
          </button>
        </div>
        {/* ON_OFFICE */}
        <div className="font-bold pt-4">
          {apiConnectTypeNames[ApiRealEstateExtSourcesEnum.ON_OFFICE]}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Token</span>
          </label>
          <input
            type="text"
            placeholder="Token"
            className="input input-bordered"
            value={onOfficeToken}
            onChange={({ target: { value } }) => {
              setOnOfficeToken(value);
            }}
          />
          <label className="label">
            <span className="label-text">Secret</span>
          </label>
          <input
            type="text"
            placeholder="Secret"
            className="input input-bordered"
            value={onOfficeSecret}
            onChange={({ target: { value } }) => {
              setOnOfficeSecret(value);
            }}
          />
        </div>
        <div className="pt-4">
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!onOfficeToken?.length || !onOfficeSecret?.length) {
                return;
              }

              try {
                const connectSettings = {
                  connectType: ApiRealEstateExtSourcesEnum.ON_OFFICE,
                  token: onOfficeToken,
                  secret: onOfficeSecret,
                };

                await post<void, IApiUserApiConnectSettingsReq>(
                  "/api/real-estate-listing/crm-test",
                  connectSettings
                );

                toastSuccess("Die Verbindung wurde erfolgreich getestet.");

                userDispatch({
                  type: UserActionTypes.SET_API_CONNECTION,
                  payload: connectSettings,
                });
              } catch (e) {
                toastError("Der Fehler ist aufgetreten!");
                setOnOfficeToken("");
                setOnOfficeSecret("");
              }
            }}
          >
            Testen und speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCrmSettings;
