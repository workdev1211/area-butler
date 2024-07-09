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
  deriveIconForOsmName,
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
  IApiUserPoiIcon,
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation,
} from "../../../../../../shared/types/types";
import walkIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-walk.svg";
import bicycleIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-bike.svg";
import carIcon from "../../../../assets/icons/means/icons-32-x-32-illustrated-ic-car.svg";

interface ICropParams {
  name: string;
  aspect: number;
}

// calculated manually
const defaultImgSize = 2000;
const defaultImgPixelRatio = 2.27;
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

interface IMapClipCropModalProps {
  mapClipping: string;
  closeModal: (croppedMapClipping?: string) => void;
  groupedEntries: EntityGroup[];
  color?: string;
  directLink?: string;
  userMenuPoiIcons?: IApiUserPoiIcon[];
  transportationParams?: TransportationParam[];
  activeMeans?: MeansOfTransportation[];
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
  groupedEntries,
  closeModal,
  color,
  directLink,
  userMenuPoiIcons,
  activeMeans,
  transportationParams,
}) => {
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [overlayRef, setOverlayRef] = useState<HTMLDivElement | null>(null);

  const { integrationType } = useContext(ConfigContext);
  const { t } = useTranslation();

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
  const [isShownQrCode, setIsShownQrCode] = useState(true);
  const [isShownLegend, setIsShownLegend] = useState(true);
  const [isShownIsochrones, setIsShownIsochrones] = useState(true);

  const ListItem: FC<EntityGroup> = (group) => {
    const { t } = useTranslation();

    const isRealEstateListing = group.items[0].name === realEstateListingsTitle;

    const isPreferredLocation = group.items[0].name === preferredLocationsTitle;

    const groupIconInfo = isRealEstateListing
      ? getRealEstateListingsIcon(userMenuPoiIcons)
      : isPreferredLocation
      ? getPreferredLocationsIcon(userMenuPoiIcons)
      : deriveIconForOsmName(group.items[0].osmName, userMenuPoiIcons);

    return (
      <li className={"active"} key={group.title}>
        <div className="img-container">
          <img src={groupIconInfo.icon} alt="group-icon" />
        </div>
        {t(
          (IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>)[
            group.title
          ]
        )}
      </li>
    );
  };

  const handleCropComplete = async (): Promise<void> => {
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
      const resLegendImage = await generateOverlayImage();

      ctx.drawImage(resLegendImage, 0, 0);
    }

    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    try {
      const blobFile = await convertBlobToBase64(blob);
      closeModal(blobFile);
    } catch (e) {
      toastDefaultError();
      console.error(`Error: ${e}`);
    }
  };

  const setQrCodeFunc = useCallback(async () => {
    const rawQrCodeImage = await getQrCodeBase64(directLink!, color);
    setQrCode(rawQrCodeImage);
  }, [directLink, color]);

  useEffect(() => {
    setQrCodeFunc();
  }, [setQrCodeFunc]);

  const generateOverlayImage = async () => {
    const renderedImage = await toPng(overlayRef!, {
      width: defaultImgSize,
      height: defaultImgSize,
      pixelRatio: defaultImgPixelRatio,
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
            setCropState(percentCrop);
          }}
          renderSelectionAddon={() => (
            <div ref={(ref) => setOverlayRef(ref)}>
              {qrCode && isShownQrCode && (
                <div
                  style={{
                    bottom: -59,
                    position: "absolute",
                    transform: "scale(0.5)",
                    left: -55,
                  }}
                >
                  <MapClipQrCode qrCodeImage={qrCode} color={color} />
                </div>
              )}
              {isShownLegend && (
                <div className="mapMenu">
                  <ul className="menu-desktop">
                    {groupedEntries.map((ge) => (
                      <ListItem key={ge.title} {...ge} />
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
            <label className="cursor-pointer label">
              <input
                type="checkbox"
                name="showLegend"
                checked={isShownLegend}
                onChange={toggleDrawLegend}
                className="checkbox checkbox-xs checkbox-primary mr-2"
              />
              <span className="label-text">
                {t(IntlKeys.snapshotEditor.showLegend)}
              </span>
            </label>
            {activeMeans?.length && transportationParams && (
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
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="btn btn-default"
              onClick={() => {
                closeModal();
              }}
            >
              {t(IntlKeys.common.close)}
            </button>

            <button
              className="btn btn-primary"
              onClick={handleCropComplete}
              disabled={!cropState?.width}
            >
              {t(
                integrationType
                  ? IntlKeys.integration.cropAndSend
                  : IntlKeys.snapshotEditor.crop
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapClipCropModal;
