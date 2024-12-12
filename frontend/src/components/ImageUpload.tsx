import { ChangeEvent, FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import clearIcon from "../assets/icons/cross.svg";
import { toastError } from "../shared/shared.functions";
import TooltipBadge from "./TooltipBadge";

interface IImageUploadProps {
  image: string | undefined;
  onChange: (image?: string) => void;

  inputId?: string;
  isDisabled?: boolean;
  label?: string;
  tooltip?: string;
  uploadLabel?: string;
}

const ImageUpload: FC<IImageUploadProps> = ({
  image,
  inputId = "upload-button",
  isDisabled,
  label,
  onChange,
  tooltip,
  uploadLabel,
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
      onChange(`${reader.result}`);
    };

    reader.onerror = (e) => {
      toastError(t(IntlKeys.common.errorOccurred));
      console.error(`${t(IntlKeys.common.errorOccurred)}: `, e);
    };
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files!.length && e.target.files![0]) {
      getBase64(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="indicator">
        <div className="text-lg pr-3">
          {label || t(IntlKeys.imageUpload.defaultLabel)}
        </div>
        {tooltip && <TooltipBadge tooltip={tooltip} />}
      </div>

      <div className="flex items-center gap-6">
        <label
          htmlFor={inputId}
          className="label flex-col items-start max-w-fit p-0"
        >
          <div
            className={`w-[150px] border-2 border-dashed border-[var(--base-anthracite)]${
              isDisabled ? "" : " cursor-pointer"
            } ${image ? "p-1" : "flex items-center justify-center h-[150px]"}`}
          >
            {image ? (
              <img src={image} alt="logo" />
            ) : (
              <span className="text-center">
                {uploadLabel || t(IntlKeys.imageUpload.defaultUploadLabel)}
              </span>
            )}

            {!isDisabled && (
              <input
                id={inputId}
                className="hidden"
                type="file"
                accept="image/png,image/jpeg,image/svg"
                onChange={handleChange}
              />
            )}
          </div>
        </label>

        {!isDisabled && image && (
          <img
            className="w-5 h-5 cursor-pointer select-none"
            src={clearIcon}
            alt="clear"
            onClick={() => {
              onChange();
            }}
            style={{
              filter:
                "invert(16%) sepia(80%) saturate(3325%) hue-rotate(330deg) brightness(95%) contrast(101%)",
            }}
          />
        )}
      </div>

      {!isDisabled && <small>{t(IntlKeys.imageUpload.supportedFormats)}</small>}
    </div>
  );
};

export default ImageUpload;
