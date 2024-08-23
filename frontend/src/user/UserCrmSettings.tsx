import { FunctionComponent, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./UserCrmSettings.scss";

import { UserActionTypes, UserContext } from "../context/UserContext";
import { useHttp } from "../hooks/http";
import { ApiRealEstateExtSourcesEnum } from "../../../shared/types/real-estate";
import { apiConnectTypeNames } from "../../../shared/constants/real-estate";
import { toastError, toastSuccess } from "../shared/shared.functions";
import {
  IApiUserExtConnectSettingsReq,
  TApiUserExtConnections,
} from "../../../shared/types/types";

const UserCrmSettings: FunctionComponent = () => {
  const { t } = useTranslation();
  const { userState, userDispatch } = useContext(UserContext);
  const { post } = useHttp();

  const apiConnections =
    userState.user?.config.externalConnections ||
    ({} as TApiUserExtConnections);

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
      <h1 className="text-xl font-bold">
        {t(IntlKeys.yourProfile.CRMSettings)}
      </h1>
      <div>{t(IntlKeys.yourProfile.CRMSettingsDescription)}</div>
      <div className="api-connections-grid grid items-center gap-5">
        {/* PROPSTACK */}
        <div className="font-bold pt-4">
          {apiConnectTypeNames[ApiRealEstateExtSourcesEnum.PROPSTACK]}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t(IntlKeys.yourProfile.apiKey)}</span>
          </label>
          <input
            type="text"
            placeholder={t(IntlKeys.yourProfile.apiKey)}
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

                await post<void, IApiUserExtConnectSettingsReq>(
                  "/api/real-estate-listing/crm-test",
                  connectSettings
                );

                toastSuccess(
                  t(IntlKeys.yourProfile.connectionTestedSuccessfully)
                );

                userDispatch({
                  type: UserActionTypes.SET_EXT_CONNECTION,
                  payload: connectSettings,
                });
              } catch (e) {
                toastError(t(IntlKeys.common.errorOccurred));
                setPropstackApiKey("");
              }
            }}
          >
            {t(IntlKeys.yourProfile.testAndSave)}
          </button>
        </div>
        {/* ON_OFFICE */}
        <div className="font-bold pt-4">
          {apiConnectTypeNames[ApiRealEstateExtSourcesEnum.ON_OFFICE]}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">{t(IntlKeys.yourProfile.token)}</span>
          </label>
          <input
            type="text"
            placeholder={t(IntlKeys.yourProfile.token)}
            className="input input-bordered"
            value={onOfficeToken}
            onChange={({ target: { value } }) => {
              setOnOfficeToken(value);
            }}
          />
          <label className="label">
            <span className="label-text">{t(IntlKeys.yourProfile.secret)}</span>
          </label>
          <input
            type="text"
            placeholder={t(IntlKeys.yourProfile.secret)}
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

                await post<void, IApiUserExtConnectSettingsReq>(
                  "/api/real-estate-listing/crm-test",
                  connectSettings
                );

                toastSuccess(
                  t(IntlKeys.yourProfile.connectionTestedSuccessfully)
                );

                userDispatch({
                  type: UserActionTypes.SET_EXT_CONNECTION,
                  payload: connectSettings,
                });
              } catch (e) {
                toastError(t(IntlKeys.common.errorOccurred));
                setOnOfficeToken("");
                setOnOfficeSecret("");
              }
            }}
          >
            {t(IntlKeys.yourProfile.testAndSave)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCrmSettings;
