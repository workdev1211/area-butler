import { FunctionComponent, useContext } from "react";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../context/SearchContext";
import { ConfigContext } from "../../../../context/ConfigContext";
import { UserActionTypes, UserContext } from "../../../../context/UserContext";
import { invertFilter } from "../../../../shared/shared.constants";
import pdfIcon from "../../../../assets/icons/icons-16-x-16-outline-ic-pdf.svg";

const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

const LocationExport: FunctionComponent = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const {
    userState: { user },
    userDispatch,
  } = useContext(UserContext);

  const isIntegration = !!integrationType;

  const hasFullyCustomizableExpose =
    isIntegration ||
    !!user?.subscription?.config.appFeatures.fullyCustomizableExpose;

  return (
    <ul>
      <li>
        <h3
          className="max-w-fit items-center cursor-pointer"
          onClick={() => {
            hasFullyCustomizableExpose
              ? searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
                  payload: true,
                })
              : userDispatch({
                  type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                  payload: {
                    open: true,
                    message: subscriptionUpgradeFullyCustomizableExpose,
                  },
                });
          }}
        >
          <img
            className="w-6 h-6"
            style={invertFilter}
            src={pdfIcon}
            alt="pdf"
          />
          <span>Lage Exposé generieren</span>
          {/*<span className="badge badge-primary">NEU</span>*/}
        </h3>
      </li>
      <li>
        <h3
          className="max-w-fit items-center cursor-pointer"
          onClick={() => {
            hasFullyCustomizableExpose
              ? searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                  payload: true,
                })
              : userDispatch({
                  type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                  payload: {
                    open: true,
                    message: subscriptionUpgradeFullyCustomizableExpose,
                  },
                });
          }}
        >
          <img
            className="w-6 h-6"
            style={invertFilter}
            src={pdfIcon}
            alt="pdf"
          />
          Umfeldanalyse PDF
        </h3>
      </li>
      <li>
        <h3
          className="max-w-fit items-center cursor-pointer"
          onClick={() => {
            hasFullyCustomizableExpose
              ? searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
                  payload: true,
                })
              : userDispatch({
                  type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                  payload: {
                    open: true,
                    message: subscriptionUpgradeFullyCustomizableExpose,
                  },
                });
          }}
        >
          <img
            className="w-6 h-6"
            style={invertFilter}
            src={pdfIcon}
            alt="pdf"
          />
          Umfeldanalyse DOC
        </h3>
      </li>
      <li>
        <h3
          className="max-w-fit items-center cursor-pointer"
          onClick={() => {
            hasFullyCustomizableExpose
              ? searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
                  payload: true,
                })
              : userDispatch({
                  type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                  payload: {
                    open: true,
                    message: subscriptionUpgradeFullyCustomizableExpose,
                  },
                });
          }}
        >
          <img
            className="w-6 h-6"
            style={invertFilter}
            src={pdfIcon}
            alt="pdf"
          />
          Überblick PDF
        </h3>
      </li>
    </ul>
  );
};

export default LocationExport;
