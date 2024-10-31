import { FunctionComponent, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";
import { useHistory } from "react-router-dom";

import {
  setBackgroundColor,
  toastSuccess,
} from "../../../shared/shared.functions";
import fileIcon from "../../../assets/icons/file.svg";
import editIcon from "../../../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import copyIcon from "../../../assets/icons/copy.svg";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../context/SearchContext";
import { ConfigContext } from "../../../context/ConfigContext";
import { useLocationData } from "../../../hooks/locationdata";

interface ICustomerDataProps {
  backgroundColor: string;
  snapshotId: string;
}

const CustomerData: FunctionComponent<ICustomerDataProps> = ({
  backgroundColor,
  snapshotId,
}) => {
  const { t } = useTranslation();
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { push: historyPush } = useHistory();
  const { duplicateSnapshot } = useLocationData();

  const [isCustomerDataOpen, setIsCustomerDataOpen] = useState(false);

  return (
    <div
      q-id='customer-data'
      className={
        "collapse collapse-arrow view-option" +
        (isCustomerDataOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsCustomerDataOpen(!isCustomerDataOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={fileIcon} alt="customer-data-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">
              {t(IntlKeys.snapshotEditor.dataTab.ownFiles)}
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        <ul>
          <li>
            <h3
              className="max-w-fit items-center cursor-pointer"
              onClick={() => {
                if (!searchContextState.localityParams.length) {
                  toastSuccess(
                    t(IntlKeys.snapshotEditor.dataTab.loadingClickAgain)
                  );
                  return;
                }

                searchContextDispatch({
                  type: SearchContextActionTypes.SET_STORED_CONTEXT_STATE,
                  payload: {
                    preferredLocations: searchContextState.preferredLocations,
                    routingProfiles: searchContextState.transportationParams,
                    preferredAmenities: searchContextState.localityParams.map(
                      (l) => l.name
                    ),
                  },
                });

                historyPush("/potential-customers/from-result");
              }}
            >
              <img className="w-4 h-4" src={editIcon} alt="pdf" />
              {t(IntlKeys.snapshotEditor.dataTab.saveTargetGroup)}
            </h3>
          </li>
          {!integrationType && (
            <li>
              <h3
                className="max-w-fit items-center cursor-pointer"
                onClick={() => {
                  if (!searchContextState.placesLocation?.label) {
                    toastSuccess(
                      t(IntlKeys.snapshotEditor.dataTab.loadingClickAgain)
                    );
                    return;
                  }

                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_STORED_CONTEXT_STATE,
                    payload: {
                      address: searchContextState.placesLocation?.label,
                    },
                  });

                  historyPush("/real-estates/from-result");
                }}
              >
                <img className="w-4 h-4" src={editIcon} alt="pdf" />
                {t(IntlKeys.realEstate.createObject)}
              </h3>
            </li>
          )}
          <li>
            <h3
              className="max-w-fit items-center cursor-pointer"
              onClick={async () => {
                await duplicateSnapshot(snapshotId);
              }}
            >
              <img className="w-4 h-4" src={copyIcon} alt="pdf" />
              {t(IntlKeys.mapSnapshots.duplicateCard)}
            </h3>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerData;
