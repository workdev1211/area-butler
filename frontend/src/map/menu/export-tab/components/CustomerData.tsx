import { FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import {
  setBackgroundColor,
  toastSuccess,
} from "../../../../shared/shared.functions";
import fileIcon from "../../../../assets/icons/file.svg";
import editIcon from "../../../../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../context/SearchContext";
import { ConfigContext } from "../../../../context/ConfigContext";

interface ICustomerDataProps {
  backgroundColor: string;
}

const CustomerData: FunctionComponent<ICustomerDataProps> = ({
  backgroundColor,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { push: historyPush } = useHistory();

  const [isCustomerDataOpen, setIsCustomerDataOpen] = useState(false);

  return (
    <div
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
            <div className="collapse-title-text-1">Eigene Dateien</div>
            <div className="collapse-title-text-2">
              Dateien und Objekt speichern, Zielgruppe anlegen
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
                  toastSuccess("Wird geladen ... bitte erneut klicken.");
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
              <img className="w-6 h-6" src={editIcon} alt="pdf" />
              Zielgruppe speichern
            </h3>
          </li>
          {!integrationType && (
            <li>
              <h3
                className="max-w-fit items-center cursor-pointer"
                onClick={() => {
                  if (!searchContextState.placesLocation?.label) {
                    toastSuccess("Wird geladen ... bitte erneut klicken.");
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
                <img className="w-6 h-6" src={editIcon} alt="pdf" />
                Objekt anlegen
              </h3>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CustomerData;
