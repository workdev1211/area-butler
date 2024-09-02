import { FC, useCallback, useContext, useEffect, useState } from "react";
import {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  PercentCrop,
  ReactCrop,
} from "react-image-crop";
import { toPng } from "html-to-image";
import { useTranslation } from "react-i18next";

import "react-image-crop/src/ReactCrop.scss";
import "./MapClipCropModal.scss";

import {
  deriveIconForPoiGroup,
  getPreferredLocationsIcon,
  getRealEstateListingsIcon,
  preferredLocationsTitle,
  toastDefaultError,
} from "../../../../shared/shared.functions";
import { getQrCodeBase64 } from "../../../../export/QrCode";
import { MapClipQrCode } from "./MapClipQrCode";
import { ConfigContext } from "../../../../context/ConfigContext";
import { IntlKeys } from "../../../../i18n/keys";
import { EntityGroup } from "../../../../shared/search-result.types";
import { realEstateListingsTitle } from "../../../../../../shared/constants/real-estate";
import {
  IApiPoiIcon,
  LanguageTypeEnum,
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation,
} from "../../../../../../shared/types/types";
import downloadIcon from "../../../../assets/icons/download.svg";
import caretIcon from "../../../../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import shareIcon from "../../../../assets/icons/share.svg";
import cropIcon from "../../../../assets/icons/scissors.svg";
import walkIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";
import { integrationNames } from "../../../../../../shared/constants/integration";

interface ICropParams {
  name: string;
  aspect: number;
}

const minHeight = 440;

interface IMeansBlockProps {
  means: MeansOfTransportation[];
  transportationParams: TransportationParam[];
}

const MeansBlock = ({ means, transportationParams }: IMeansBlockProps) => {
  const deriveBackgroundClass = (mean: MeansOfTransportation) => {
    switch (mean) {
      case MeansOfTransportation.WALK:
        return "bg-primary";
      case MeansOfTransportation.BICYCLE:
        return "bg-accent";
      case MeansOfTransportation.CAR:
        return "bg-base-content";
    }
  };

  return (
    <div className="map-nav-bar" data-tour="map-navbar">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {means.map((mean) => {
          const param = transportationParams.find((tp) => tp.type === mean);

          return (
            <button
              className="btn"
              key={`mean-${mean}`}
              data-testid={`means-toggle-${mean}`}
            >
              <span className={deriveBackgroundClass(mean)} />
              {mean === MeansOfTransportation.WALK && (
                <img src={walkIcon} alt="iconwalk" />
              )}
              {mean === MeansOfTransportation.BICYCLE && (
                <img src={bicycleIcon} alt="iconbycicle" />
              )}
              {mean === MeansOfTransportation.CAR && (
                <img src={carIcon} alt="iconcar" />
              )}
              {param?.amount}{" "}
              {param?.unit === UnitsOfTransportation.KILOMETERS ? "km" : "min"}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export enum CropActionsEnum {
  CROP = "crop",
  DOWNLOAD = "download",
  SEND_TO_INTEGRATION = "sendToIntegration",
}

interface IMapClipCropModalProps {
  closeModal: (croppedMapClipping?: string, action?: CropActionsEnum) => void;
  entityGroups: EntityGroup[];
  mapClipping: string;
  activeMeans?: MeansOfTransportation[];
  color?: string;
  invertColor?: boolean;
  outputLanguage?: LanguageTypeEnum;
  directLink?: string;
  transportationParams?: TransportationParam[];
  menuPoiIcons?: IApiPoiIcon[];
}

const getAspectCrop = (
  aspect: number,
  width: number,
  height: number
): PercentCrop =>
  centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 100,
      },
      aspect,
      width,
      height
    ),
    width,
    height
  );

const convertBlobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(`${reader.result}`);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(blob);
  });

const MapClipCropModal: FC<IMapClipCropModalProps> = ({
  mapClipping,
  entityGroups,
  closeModal,
  color,
  invertColor,
  directLink,
  menuPoiIcons,
  activeMeans,
  transportationParams,
  outputLanguage = LanguageTypeEnum.de,
}) => {
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [overlayRef, setOverlayRef] = useState<HTMLDivElement | null>(null);

  const { integrationType } = useContext(ConfigContext);
  const { t } = useTranslation();
  const { t: outputT } = useTranslation("", { lng: outputLanguage });

  const fourToThreeCropParams = {
    name: "4:3",
    aspect: +(4 / 3).toFixed(3),
  };

  const allCropParams: ICropParams[] = [
    {
      name: "1:1",
      aspect: 1,
    },
    fourToThreeCropParams,
    {
      name: "16:9",
      aspect: +(16 / 9).toFixed(3),
    },
    {
      name: "21:9",
      aspect: +(21 / 9).toFixed(3),
    },
    {
      name: "16:9 (portrait)",
      aspect: +(9 / 16).toFixed(3),
    },
    {
      name: t(IntlKeys.common.userDefined),
      aspect: 0,
    },
  ];

  const [qrCode, setQrCode] = useState<string>();
  const [cropState, setCropState] = useState<PercentCrop>();
  const [cropParams, setCropParams] = useState<ICropParams>(
    fourToThreeCropParams
  );
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [isShownQrCode, setIsShownQrCode] = useState(true);
  const [isShownLegend, setIsShownLegend] = useState(true);
  const [isShownIsochrones, setIsShownIsochrones] = useState(true);

  const ListItem: FC<EntityGroup> = (group) => {
    const isRealEstateListing = group.items[0].name === realEstateListingsTitle;
    const isPreferredLocation = group.items[0].name === preferredLocationsTitle;

    const groupIconInfo = isRealEstateListing
      ? getRealEstateListingsIcon(menuPoiIcons)
      : isPreferredLocation
      ? getPreferredLocationsIcon(menuPoiIcons)
      : deriveIconForPoiGroup(group.name, menuPoiIcons);

    return (
      <li className={"active"} key={group.name}>
        <div className="img-container">
          <img src={groupIconInfo.icon} alt="group-icon" />
        </div>
        {group.title}
      </li>
    );
  };

  const handleCropComplete = async (action: CropActionsEnum): Promise<void> => {
    const image = imgRef;

    if (!image || !cropState) {
      toastDefaultError();
      console.error("Crop canvas does not exist!");
      return;
    }

    if (cropState.width < 1 || cropState.height < 1) {
      return;
    }

    const pixelCropState = convertToPixelCrop(
      cropState,
      image.naturalWidth,
      image.naturalHeight
    );

    const offscreen = new OffscreenCanvas(
      pixelCropState.width,
      pixelCropState.height
    );
    const ctx = offscreen.getContext("2d");

    if (!ctx) {
      toastDefaultError();
      console.error("No 2d context!");
      return;
    }

    ctx.drawImage(
      image,
      pixelCropState.x,
      pixelCropState.y,
      pixelCropState.width,
      pixelCropState.height,
      0,
      0,
      pixelCropState.width,
      pixelCropState.height
    );

    if (overlayRef) {
      const resLegendImage = await generateOverlayImage(
        pixelCropState.width,
        pixelCropState.height
      );

      ctx.drawImage(resLegendImage, 0, 0);
    }

    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    try {
      const blobFile = await convertBlobToBase64(blob);
      closeModal(blobFile, action);
    } catch (e) {
      toastDefaultError();
      console.error(`Error: ${e}`);
    }
  };

  const setQrCodeFunc = useCallback(async () => {
    const rawQrCodeImage = await getQrCodeBase64(directLink!, color, invertColor);
    setQrCode(rawQrCodeImage);
  }, [directLink, color, invertColor]);

  useEffect(() => {
    void setQrCodeFunc();
  }, [setQrCodeFunc]);

  const generateOverlayImage = async (
    cropWidth: number,
    cropHeight: number
  ) => {
    const renderedImage = await toPng(overlayRef!, {
      width: cropWidth,
      height: cropHeight,
      pixelRatio: cropWidth / overlayRef!.clientWidth,
      cacheBust: true,
    });

    const resImage = new Image();
    resImage.src = renderedImage;
    await resImage.decode();

    return resImage;
  };

  const toggleDrawQrCode = async (): Promise<void> => {
    setIsShownQrCode(!isShownQrCode);
  };

  const toggleDrawLegend = async (): Promise<void> => {
    setIsShownLegend(!isShownLegend);
  };

  const toggleDrawIsochrones = async (): Promise<void> => {
    setIsShownIsochrones(!isShownIsochrones);
  };

  // handles the initial image load and the change of the aspect ratio
  useEffect(() => {
    const image = imgRef;

    if (!image || !cropParams) {
      return;
    }

    const crop: PercentCrop =
      cropParams.aspect !== 0
        ? getAspectCrop(cropParams.aspect, image.width, image.height)
        : {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            unit: "%",
          };

    const pixelCrop = convertToPixelCrop(crop, image.width, image.height);
    setImageWidth(pixelCrop.width);
    setImageHeight(pixelCrop.height);
    setCropState(crop);
  }, [cropParams, imgRef, imgRef?.width]);

  return (
    <div className="map-clip-crop-modal modal modal-open z-9999">
      <div className="modal-box">
        <ReactCrop
          className="react-image-crop"
          minHeight={minHeight}
          crop={cropState}
          aspect={cropParams.aspect}
          onChange={(crop, percentCrop) => {
            setImageWidth(crop.width);
            setImageHeight(crop.height);
            setCropState(percentCrop);
          }}
          renderSelectionAddon={() => (
            <div ref={(ref) => setOverlayRef(ref)}>
              <div className="imageSize">
                <label>
                  {Math.round(imageWidth)} x {Math.round(imageHeight)}
                </label>
              </div>
              {qrCode && isShownQrCode && (
                <div className="qrCodeContainer">
                  <MapClipQrCode
                    language={outputLanguage}
                    qrCodeImage={qrCode}
                    color={color}
                    invertColor={invertColor}
                  />
                </div>
              )}
              {isShownLegend && entityGroups.length && (
                <div className="mapMenu">
                  <ul className="menu-desktop">
                    {entityGroups.map((ge) => (
                      <ListItem
                        key={ge.name}
                        {...ge}
                        title={outputT(
                          (
                            IntlKeys.snapshotEditor.pointsOfInterest as Record<
                              string,
                              string
                            >
                          )[ge.name]
                        )}
                      />
                    ))}
                  </ul>
                </div>
              )}
              {isShownIsochrones &&
                activeMeans?.length &&
                transportationParams && (
                  <div className="means-block">
                    <MeansBlock
                      means={activeMeans}
                      transportationParams={transportationParams}
                    />
                  </div>
                )}
            </div>
          )}
        >
          <img
            ref={(ref) => setImgRef(ref)}
            src={mapClipping}
            alt="To be croppped"
          />
        </ReactCrop>

        <div className="modal-action mt-0 items-end justify-between">
          <div className="flex items-end gap-5">
            <div className="form-control indicator">
              <div
                className="indicator-item badge w-5 h-5 text-white"
                style={{
                  border: "1px solid var(--primary)",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  top: "1rem",
                }}
              >
                <div
                  className="tooltip tooltip-right tooltip-accent text-justify font-medium"
                  data-tip={t(IntlKeys.snapshotEditor.selectRatioTooltip)}
                >
                  i
                </div>
              </div>

              <label className="label" htmlFor="cropParams">
                <span className="label-text">
                  {t(IntlKeys.snapshotEditor.selectRatio)}
                </span>
              </label>

              <select
                className="select select-bordered"
                name="cropParams"
                defaultValue={cropParams.name}
                onChange={({ target: { value } }) => {
                  setCropParams(
                    allCropParams.find(({ name }) => name === value)!
                  );
                }}
              >
                {allCropParams.map(({ name }) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {directLink && (
              <label className="cursor-pointer label">
                <input
                  type="checkbox"
                  name="showQrCode"
                  checked={isShownQrCode}
                  onChange={toggleDrawQrCode}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
                <span className="label-text">
                  {t(IntlKeys.snapshotEditor.showQRCode)}
                </span>
              </label>
            )}
            {(entityGroups.length && (
              <label className="cursor-pointer label">
                <input
                  type="checkbox"
                  name="showLegend"
                  checked={isShownLegend}
                  onChange={toggleDrawLegend}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
                <span className="label-text" style={{ position: "relative" }}>
                  {t(IntlKeys.snapshotEditor.showLegend)}
                  <div
                    className="indicator-item badge w-4 h-4 text-white"
                    style={{
                      fontSize: 9,
                      padding: 0,
                      position: "absolute",
                      bottom: "100%",
                      left: "100%",
                      border: "1px solid var(--primary)",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary)",
                    }}
                  >
                    <div
                      className="tooltip tooltip-right tooltip-accent text-justify font-medium"
                      data-tip={t(IntlKeys.snapshotEditor.showLegendTooltip)}
                    >
                      i
                    </div>
                  </div>
                </span>
              </label>
            )) ||
              ""}
            {(activeMeans?.length && transportationParams && (
              <label className="cursor-pointer label">
                <input
                  type="checkbox"
                  name="showIsochrones"
                  checked={isShownIsochrones}
                  onChange={toggleDrawIsochrones}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
                <span className="label-text">
                  {t(IntlKeys.snapshotEditor.showIsochrones)}
                </span>
              </label>
            )) ||
              ""}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="btn btn-default"
              onClick={() => {
                closeModal();
              }}
            >
              {t(IntlKeys.common.discard)}
            </button>
            {(integrationType && (
              <button
                className="btn btn-primary"
                onClick={() =>
                  handleCropComplete(CropActionsEnum.SEND_TO_INTEGRATION)
                }
                disabled={!cropState?.width}
              >
                <img
                  src={shareIcon}
                  alt="icon-share"
                  className="invert h-full break-after-avoid mr-2"
                />
                {t(IntlKeys.snapshotEditor.dataTab.sendTo, {
                  integrationType: integrationNames[integrationType!],
                })}
              </button>
            )) || (
              <button
                className="btn btn-primary mb-1 whitespace-nowrap text-left w-max"
                onClick={() => handleCropComplete(CropActionsEnum.DOWNLOAD)}
                disabled={!cropState?.width}
              >
                <img
                  src={downloadIcon}
                  alt="icon-share"
                  className="invert h-full mr-2"
                />
                {t(IntlKeys.snapshotEditor.dataTab.download)}
              </button>
            )}
            <div className="dropdown dropdown-hover dropdown-top dropdown-end">
              <button
                className="btn btn-primary dropdown-btn w-14"
                disabled={!cropState?.width}
              >
                <img
                  src={caretIcon}
                  alt="icon-dropdown"
                  className="rotate-180"
                />
              </button>
              <ul
                className="dropdown-content text-right"
                style={{ top: "auto", background: "none" }}
              >
                <li
                  className="btn btn-primary mb-1 whitespace-nowrap text-left w-max"
                  onClick={() => handleCropComplete(CropActionsEnum.CROP)}
                >
                  <img
                    src={cropIcon}
                    alt="icon-share"
                    className="invert h-full mr-2"
                  />
                  {t(IntlKeys.snapshotEditor.crop)}
                </li>
                {integrationType && (
                  <li
                    className="btn btn-primary mb-1 whitespace-nowrap text-left w-max"
                    onClick={() => handleCropComplete(CropActionsEnum.DOWNLOAD)}
                  >
                    <img
                      src={downloadIcon}
                      alt="icon-share"
                      className="invert h-full mr-2"
                    />
                    {t(IntlKeys.snapshotEditor.dataTab.download)}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapClipCropModal;
