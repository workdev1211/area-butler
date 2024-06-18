import { FunctionComponent, useContext } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { saveAs } from "file-saver";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import deleteIcon from "../../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import sendToIntegrationIcon from "../../assets/icons/entrance-alt1.svg";
import { ConfigContext } from "../../context/ConfigContext";
import { useIntegrationTools } from "../../hooks/integration/integrationtools";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/integration-user";
import { integrationNames } from "../../../../shared/constants/integration";

interface IMapClippingsCollapsableProps {
  clippings: MapClipping[];
  searchAddress: string;
}

const MapClippingsCollapsable: FunctionComponent<
  IMapClippingsCollapsableProps
> = ({ clippings, searchAddress}) => {
  const { t } = useTranslation();
  const { integrationType } = useContext(ConfigContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const { sendToIntegration } = useIntegrationTools();

  const parsedAddress = (searchAddress || t(IntlKeys.snapshotEditor.exportTab.myLocation))
    .replace(",", "-")
    .replace(/\s/g, "");

  const removeAllClippings = (): void => {
    window.confirm(t(IntlKeys.snapshotEditor.exportTab.deleteAllMapSectionsConfirmation)) &&
      searchContextDispatch({
        type: SearchContextActionTypes.CLEAR_MAP_CLIPPINGS,
      });
  };

  const removeClipping = (clipping: MapClipping): void => {
    window.confirm(t(IntlKeys.snapshotEditor.exportTab.deleteThisMapSectionsConfirmation)) &&
      searchContextDispatch({
        type: SearchContextActionTypes.REMOVE_MAP_CLIPPING,
        payload: clipping,
      });
  };

  const downloadClipping = (clipping: MapClipping, i: number): void => {
    saveAs(
      clipping.mapClippingDataUrl,
      `${parsedAddress}-${t(IntlKeys.snapshotEditor.exportTab.mapSection)}-${i + 1}.png`
    );
  };

  return (
    <div className="p-5 flex flex-col items-center gap-2">
      {clippings.map((clipping, i) => (
        <div className="flex items-center lg:gap-10 gap-2" key={i}>
          <img
            onClick={() => {
              downloadClipping(clipping, i);
            }}
            src={clipping.mapClippingDataUrl}
            className="lg:w-96 w-80 cursor-pointer"
            alt="img-clipping"
          />

          <div className="flex gap-5 flex-wrap">
            <button
              className="w-6 h-6 cursor-pointer border-b-2 border-b-black"
              onClick={() => {
                downloadClipping(clipping, i);
              }}
            >
              ↓
            </button>

            <img
              src={deleteIcon}
              className="w-6 h-6 cursor-pointer"
              alt="icon-delete"
              onClick={() => {
                removeClipping(clipping);
              }}
            />

            {!!integrationType && (
              <div
                className="flex cursor-pointer"
                onClick={() => {
                  void sendToIntegration({
                    base64Content: clipping.mapClippingDataUrl,
                    exportType: AreaButlerExportTypesEnum.SCREENSHOT,
                    fileTitle: `Lageplan ${i + 1}`,
                    filename: `Lageplan-${i + 1}.png`,
                  });
                }}
              >
                <img
                  src={sendToIntegrationIcon}
                  className="w-6 h-6"
                  alt="send-to-integration"
                />
                <span>{integrationNames[integrationType]}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={() => {
          removeAllClippings();
        }}
        className="mt-5 btn btn-sm btn-secondary w-full"
      >
        {t(IntlKeys.common.deleteAll)}
      </button>
    </div>
  );
};

export default MapClippingsCollapsable;
