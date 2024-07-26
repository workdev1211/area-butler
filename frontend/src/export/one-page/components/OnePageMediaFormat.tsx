import { FC, useContext } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import "./../OnePageExportModal.scss";

import { ISelectableMapClipping } from "../../MapClippingSelection";
import { setBackgroundColor } from "../../../shared/shared.functions";
import OnePageMapClippingSelection from "./../OnePageMapClippingSelection";

import {
  CachingActionTypesEnum,
  CachingContext,
} from "../../../context/CachingContext";
import { IQrCodeState } from "../../../../../shared/types/export";

const SCREENSHOT_LIMIT = 2;

interface IOnePageMediaFormatProps {
  selectableMapClippings: ISelectableMapClipping[];
  setSelectableMapClippings: (
    selectedMapClippings: ISelectableMapClipping[]
  ) => void;
  isPng: boolean;
  setIsPng: (isPng: boolean) => void;
  isTransparentBackground: boolean;
  setIsTransparentBackground: (isTransparentBackground: boolean) => void;
  qrCodeState: IQrCodeState;
  setQrCodeState: (qrCodeState: IQrCodeState) => void;
  backgroundColor: string;
  isOpenCollapsable: boolean;
  toggleCollapsable: () => void;
}

const OnePageMediaFormat: FC<IOnePageMediaFormatProps> = ({
  selectableMapClippings,
  setSelectableMapClippings,
  isPng,
  setIsPng,
  isTransparentBackground,
  setIsTransparentBackground,
  qrCodeState,
  setQrCodeState,
  backgroundColor,
  isOpenCollapsable,
  toggleCollapsable,
}) => {
  const { t } = useTranslation();
  const { cachingDispatch } = useContext(CachingContext);

  return (
    <div
      className={`collapse collapse-arrow view-option ${
        isOpenCollapsable ? "collapse-open" : "collapse-closed"
      }`}
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={toggleCollapsable}
      >
        3. {t(IntlKeys.snapshotEditor.dataTab.mediaAndFormat)}
      </div>
      <div className="collapse-content">
        <div className="flex flex-col gap-5 pt-5">
          <div className="flex gap-3">
            <div className="flex cursor-pointer gap-2 p-0">
              <div
                className="flex items-center gap-2"
                onClick={() => {
                  setIsPng(false);

                  cachingDispatch({
                    type: CachingActionTypesEnum.SET_ONE_PAGE,
                    payload: { isPng: false },
                  });
                }}
              >
                <input
                  type="radio"
                  name="export-format"
                  className="radio radio-primary"
                  checked={!isPng}
                  onChange={() => {}}
                />
                <span className="label-text">{t(IntlKeys.common.pdf)}</span>
              </div>
              <div
                className="flex items-center gap-2"
                onClick={() => {
                  setIsPng(true);

                  cachingDispatch({
                    type: CachingActionTypesEnum.SET_ONE_PAGE,
                    payload: { isPng: true },
                  });
                }}
              >
                <input
                  type="radio"
                  name="export-format"
                  className="radio radio-primary"
                  checked={isPng}
                  onChange={() => {}}
                />
                <span className="label-text">{t(IntlKeys.common.png)}</span>
              </div>
            </div>

            {isPng && (
              <div
                className="flex cursor-pointer items-center gap-2 p-0"
                onClick={() => {
                  setIsTransparentBackground(!isTransparentBackground);

                  cachingDispatch({
                    type: CachingActionTypesEnum.SET_ONE_PAGE,
                    payload: {
                      isTransparentBackground: !isTransparentBackground,
                    },
                  });
                }}
              >
                <input
                  type="checkbox"
                  checked={isTransparentBackground}
                  className="checkbox checkbox-primary"
                  readOnly
                />
                <span className="label-text">{t(IntlKeys.snapshotEditor.dataTab.transparentBackground)}</span>
              </div>
            )}
          </div>

          <div className="divider m-0" />

          <label className="cursor-pointer label justify-start gap-3 p-0">
            <input
              type="checkbox"
              checked={
                selectableMapClippings.length > 0 && qrCodeState.isShownQrCode
              }
              className="checkbox checkbox-primary"
              onChange={() => {
                // TODO check if it could be simplified
                const resultingQrCodeState = {
                  isShownQrCode: qrCodeState.isShownQrCode,
                };

                setQrCodeState(resultingQrCodeState);

                cachingDispatch({
                  type: CachingActionTypesEnum.SET_ONE_PAGE,
                  payload: { qrCodeState: resultingQrCodeState },
                });
              }}
              disabled={selectableMapClippings.length === 0}
            />
            <span className="label-text">{t(IntlKeys.common.qrCode)}</span>
          </label>

          <div className="divider m-0" />

          <OnePageMapClippingSelection
            selectableMapClippings={selectableMapClippings}
            setSelectableMapClippings={(selectedMapClippings) => {
              setSelectableMapClippings(selectedMapClippings);

              cachingDispatch({
                type: CachingActionTypesEnum.SET_ONE_PAGE,
                payload: { selectableMapClippings: selectedMapClippings },
              });
            }}
            limit={SCREENSHOT_LIMIT}
          />
        </div>
      </div>
    </div>
  );
};

export default OnePageMediaFormat;
