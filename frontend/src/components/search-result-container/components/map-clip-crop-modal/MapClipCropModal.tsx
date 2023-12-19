import { FunctionComponent, useEffect, useRef, useState } from "react";
import { ReactCrop, Crop } from "react-image-crop";

import "react-image-crop/src/ReactCrop.scss";
import "./MapClipCropModal.scss";

import { toastDefaultError } from "../../../../shared/shared.functions";
import { PercentCrop } from "react-image-crop/src/types";

interface ICropParams {
  name: string;
  cropState: Crop;
  aspect: number;
}

interface IMapClipCropModalProps {
  closeModal: (croppedMapClipping?: string) => void;
  mapClipping: any;
}

const fullHdCropParams: ICropParams = {
  name: "16:9",
  cropState: {
    unit: "%",
    x: 10,
    y: 10,
    width: 50,
    height: +((50 * 9) / 16).toFixed(3),
  },
  aspect: +(16 / 9).toFixed(3),
};

const allCropParams: ICropParams[] = [
  {
    name: "1:1",
    cropState: {
      unit: "%",
      x: 50,
      y: 50,
      width: 50,
      height: 50,
    },
    aspect: 1,
  },
  {
    name: "4:3",
    cropState: {
      unit: "%",
      x: 10,
      y: 10,
      width: 50,
      height: +((50 * 3) / 4).toFixed(3),
    },
    aspect: +(4 / 3).toFixed(3),
  },
  fullHdCropParams,
  {
    name: "Benutzerdefinierten",
    cropState: {
      unit: "%",
      x: 50,
      y: 50,
      width: 50,
      height: 50,
    },
    aspect: 0,
  },
];

const MapClipCropModal: FunctionComponent<IMapClipCropModalProps> = ({
  closeModal,
  mapClipping,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const [cropState, setCropState] = useState<Crop | PercentCrop>(
    fullHdCropParams.cropState
  );
  const [cropParams, setCropParams] = useState<ICropParams>(fullHdCropParams);
  const [croppedMapClipping, setCroppedMapClipping] = useState<string>();

  const handleCropComplete = async (
    completedCropState: Crop
  ): Promise<void> => {
    const image = imgRef?.current;

    if (!image || !completedCropState) {
      setCroppedMapClipping(undefined);
      toastDefaultError();
      console.error("Crop canvas does not exist!");
      return;
    }

    if (completedCropState.width === 0 || completedCropState.height === 0) {
      setCroppedMapClipping(undefined);
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCropState.width * scaleX,
      completedCropState.height * scaleY
    );

    const ctx = offscreen.getContext("2d");

    if (!ctx) {
      setCroppedMapClipping(undefined);
      toastDefaultError();
      console.error("No 2d context!");
      return;
    }

    ctx.drawImage(
      image,
      completedCropState.x * scaleX,
      completedCropState.y * scaleY,
      completedCropState.width * scaleX,
      completedCropState.height * scaleY,
      0,
      0,
      completedCropState.width * scaleX,
      completedCropState.height * scaleY
    );

    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onload = () => {
      setCroppedMapClipping(`${reader.result}`);
    };

    reader.onerror = (e) => {
      setCroppedMapClipping(undefined);
      toastDefaultError();
      console.error(`Error: ${e}`);
    };
  };

  useEffect(() => {
    void handleCropComplete(cropState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newCropState = cropParams.cropState;
    setCropState(newCropState);
    void handleCropComplete(newCropState);
  }, [cropParams]);

  return (
    <div className="modal modal-open z-9999">
      <div className="modal-box">
        <ReactCrop
          className="react-image-crop"
          crop={cropState}
          aspect={cropParams.aspect}
          minHeight={100}
          onChange={(crop, percentCrop) => {
            setCropState(percentCrop);
          }}
          onComplete={(crop) => {
            void handleCropComplete(crop);
          }}
        >
          <img ref={imgRef} src={mapClipping} alt="To be croppped" />
        </ReactCrop>

        <div className="modal-action mt-0 items-end justify-between">
          <div className="form-control">
            <label className="label" htmlFor="cropParams">
              <span className="label-text">Seitenverhältnis wählen</span>
            </label>

            <select
              className="select select-bordered"
              name="cropParams"
              defaultValue={fullHdCropParams.name}
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

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="btn btn-default"
              onClick={() => {
                closeModal();
              }}
            >
              Schließen
            </button>

            <button
              className="btn btn-primary"
              disabled={!croppedMapClipping}
              onClick={() => {
                closeModal(croppedMapClipping);
              }}
            >
              Zuschneiden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapClipCropModal;
