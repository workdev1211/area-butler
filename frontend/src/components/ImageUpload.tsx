import { FC, ChangeEvent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { toastError } from "../shared/shared.functions";
import TooltipBadge from "./TooltipBadge";

interface IImageUploadProps {
  label?: string;
  uploadLabel?: string;
  image: string | undefined;
  inputId?: string;
  setImage: (image: string | undefined) => void;
  onChange: (logo: string) => void;
  tooltip?: string;
}

const ImageUpload: FC<IImageUploadProps> = ({
  image,
  setImage,
  label,
  uploadLabel,
  inputId = "upload-button",
  onChange,
  tooltip,
}) => {
  const { t } = useTranslation();

  const getBase64 = (event: ChangeEvent<HTMLInputElement>): void => {
    let file = event.target.files![0];

    if (file.size > 5242880) {
      toastError(t(IntlKeys.imageUpload.sizeError));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setImage(`${reader.result}`);
      onChange(`${reader.result}`);
    };

    reader.onerror = (e) => {
      console.error(`${t(IntlKeys.common.errorOccurred)}: `, e);
    };
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files!.length && e.target.files![0]) {
      getBase64(e);
    }
  };

  return (
    <div className="flex flex-col">
      <div>
        <label htmlFor={inputId} className="label flex-col items-start">
          <div className="indicator">
            <div className="text-lg pr-3">
              {label || t(IntlKeys.imageUpload.defaultLabel)}
            </div>
            {tooltip && <TooltipBadge tooltip={tooltip} />}
          </div>

          <div
            className={`w-[150px] border-2 border-dashed border-[var(--base-anthracite)] ${
              image
                ? "p-[4px] mt-1"
                : "flex items-center justify-center cursor-pointer h-[150px] mt-1"
            }`}
          >
            {image ? (
              <img src={image} alt="logo" />
            ) : (
              <span>
                {uploadLabel || t(IntlKeys.imageUpload.defaultUploadLabel)}
              </span>
            )}
          </div>
        </label>

        <input
          id={inputId}
          className="hidden"
          type="file"
          accept="image/png,image/jpeg,image/svg"
          onChange={handleChange}
        />
      </div>

      <small>{t(IntlKeys.imageUpload.supportedFormats)}</small>
    </div>
  );
};

export default ImageUpload;
