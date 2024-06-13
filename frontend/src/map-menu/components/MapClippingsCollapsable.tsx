import { FC, useContext } from "react";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

import {
  MapClipping,
  SearchContext,
  SearchContextActionTypes,
} from "context/SearchContext";
import deleteIcon from "../../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import sendToIntegrationIcon from "../../assets/icons/entrance-alt1.svg";
import { ConfigContext } from "../../context/ConfigContext";
import { useIntegrationTools } from "../../hooks/integration/integrationtools";
import { integrationNames } from "../../../../shared/constants/integration";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/types";
import { IntlKeys } from "i18n/keys";

interface IMapClippingsCollapsableProps {
  clippings: MapClipping[];
  searchAddress: string;
}

const MapClippingsCollapsable: FC<IMapClippingsCollapsableProps> = ({
  clippings,
  searchAddress,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const { sendToIntegration } = useIntegrationTools();
  const { t } = useTranslation();

  const parsedAddress = (
    searchAddress || t(IntlKeys.snapshotEditor.exportTab.myLocation)
  )
    .replace(",", "-")
    .replace(/\s/g, "");
  const screenshotName = t(IntlKeys.snapshotEditor.screenshotName);

  const removeAllClippings = (): void => {
    window.confirm(
      t(IntlKeys.snapshotEditor.exportTab.deleteAllMapSectionsConfirmation)
    ) &&
      searchContextDispatch({
        type: SearchContextActionTypes.CLEAR_MAP_CLIPPINGS,
      });
  };

  const removeClipping = (clipping: MapClipping): void => {
    window.confirm(
      t(IntlKeys.snapshotEditor.exportTab.deleteThisMapSectionsConfirmation)
    ) &&
      searchContextDispatch({
        type: SearchContextActionTypes.REMOVE_MAP_CLIPPING,
        payload: clipping,
      });
  };

  const downloadClipping = (clipping: MapClipping, i: number): void => {
    saveAs(
      clipping.mapClippingDataUrl,
      `${parsedAddress}-${t(IntlKeys.snapshotEditor.exportTab.mapSection)}-${
        i + 1
      }.png`
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
                    base64Image: clipping.mapClippingDataUrl,
                    exportType: AreaButlerExportTypesEnum.SCREENSHOT,
                    filename: `${screenshotName}-${i + 1}.png`,
                    fileTitle: `${screenshotName} ${i + 1}`,
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
