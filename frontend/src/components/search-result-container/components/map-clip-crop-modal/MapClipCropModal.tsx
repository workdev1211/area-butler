import { FC, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  PercentCrop,
  ReactCrop,
} from "react-image-crop";
import { renderToStaticMarkup } from "react-dom/server";
import { toPng } from "html-to-image";

import "react-image-crop/src/ReactCrop.scss";
import "./MapClipCropModal.scss";

import { toastDefaultError } from "../../../../shared/shared.functions";
import { getQrCodeBase64 } from "../../../../export/QrCode";
import { MapClipQrCode } from "./MapClipQrCode";

interface ICropParams {
  name: string;
  aspect: number;
}

interface IMapClipCropModalProps {
  mapClipping: string;
  closeModal: (croppedMapClipping?: string) => void;
  color?: string;
  directLink?: string;
}

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
    name: "Benutzerdefinierten",
    aspect: 0,
  },
];

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
  closeModal,
  color,
  directLink,
}) => {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);

  const [initMapClipping, setInitMapClipping] = useState<string>(mapClipping);
  const [resultMapClipping, setResultMapClipping] = useState<string>();
  const [qrCodeImage, setQrCodeImage] = useState<HTMLImageElement>();
  const [cropState, setCropState] = useState<PercentCrop>();
  const [cropParams, setCropParams] = useState<ICropParams>(
    fourToThreeCropParams
  );
  const [isShownQrCode, setIsShownQrCode] = useState(false);

  const handleCropComplete = async (
    completedCropState: PercentCrop
  ): Promise<void> => {
    setResultMapClipping(undefined);
    const image = imgRef?.current;

    if (!image || !completedCropState) {
      toastDefaultError();
      console.error("Crop canvas does not exist!");
      return;
    }

    if (completedCropState.width < 1 || completedCropState.height < 1) {
      return;
    }

    const pixelCropState = convertToPixelCrop(
      completedCropState,
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

    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    try {
      setResultMapClipping(await convertBlobToBase64(blob));
    } catch (e) {
      toastDefaultError();
      console.error(`Error: ${e}`);
    }
  };

  const generateQrCodeImage = async (): Promise<HTMLImageElement> => {
    const rawQrCodeImage = await getQrCodeBase64(directLink!, color);
    const renderedQrCode = renderToStaticMarkup(
      <MapClipQrCode qrCodeImage={rawQrCodeImage} color={color} />
    );
    const qrCodeElement = document.createElement("div");
    qrCodeElement.innerHTML = renderedQrCode;

    const renderedQrCodeImage = await toPng(qrCodeElement, {
      pixelRatio: 1,
      width: 300,
      height: 300,
    });

    qrCodeElement.remove();

    const resQrCodeImage = new Image();
    resQrCodeImage.src = renderedQrCodeImage;
    await resQrCodeImage.decode();
    setQrCodeImage(resQrCodeImage);

    return resQrCodeImage;
  };

  const drawQrCode = async (): Promise<void> => {
    const isDrawnQrCode = !isShownQrCode;
    setIsShownQrCode(isDrawnQrCode);
    const image = imgRef?.current;

    if (!image || !cropState) {
      return;
    }

    if (!isDrawnQrCode) {
      setInitMapClipping(mapClipping);
      return;
    }

    const offscreen = new OffscreenCanvas(
      image.naturalWidth,
      image.naturalHeight
    );
    const ctx = offscreen.getContext("2d");

    if (!ctx) {
      toastDefaultError();
      console.error("No 2d context!");
      return;
    }

    ctx.drawImage(image, 0, 0);
    const resQrCodeImage = qrCodeImage || (await generateQrCodeImage());

    const pixelCropState = convertToPixelCrop(
      cropState,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.drawImage(
      resQrCodeImage,
      pixelCropState.x + 15,
      pixelCropState.y + pixelCropState.height - resQrCodeImage.height
    );

    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    try {
      setInitMapClipping(await convertBlobToBase64(blob));
    } catch (e) {
      setInitMapClipping(mapClipping);
      toastDefaultError();
      console.error(`Error: ${e}`);
    }
  };

  // handles the image redrawing
  useEffect(() => {
    const image = imgRef?.current;

    if (!image || !cropState) {
      return;
    }

    void handleCropComplete(cropState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initMapClipping]);

  // handles the initial image load and the change of the aspect ratio
  useEffect(() => {
    const image = imgRef?.current;

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
    void handleCropComplete(crop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropParams]);

  return (
    <div className="map-clip-crop-modal modal modal-open z-9999">
      <div className="modal-box">
        <ReactCrop
          className="react-image-crop"
          crop={cropState}
          aspect={cropParams.aspect}
          onChange={(crop, percentCrop) => {
            setCropState(percentCrop);
          }}
          onComplete={async (crop, percentCrop) => {
            void handleCropComplete(percentCrop);
          }}
        >
          <img ref={imgRef} src={initMapClipping} alt="To be croppped" />
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
                  onChange={drawQrCode}
                  className="checkbox checkbox-xs checkbox-primary mr-2"
                />
                <span className="label-text">
                  {t(IntlKeys.snapshotEditor.showQRCode)}
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
              disabled={!resultMapClipping}
              onClick={() => {
                closeModal(resultMapClipping);
              }}
            >
              {t(IntlKeys.snapshotEditor.crop)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapClipCropModal;
