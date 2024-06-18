import { FunctionComponent, ChangeEvent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import "./ImageUpload.scss";

import { toastError } from "../shared/shared.functions";

interface IImageUploadProps {
  label?: string;
  uploadLabel?: string;
  image: string | undefined;
  inputId?: string;
  setImage: (image: string | undefined) => void;
  onChange: (logo: string) => void;
}

const ImageUpload: FunctionComponent<IImageUploadProps> = ({
  image,
  setImage,
  label,
  uploadLabel,
  inputId = "upload-button",
  onChange,
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
      console.error("Error: ", e);
    };
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files!.length && e.target.files![0]) {
      getBase64(e);
    }
  };

  return (
    <div className="img-upload">
      <div>
        <label htmlFor={inputId}>
          {label || t(IntlKeys.imageUpload.defaultLabel)}:
          {image ? (
            <div className="img-container mt-1">
              <img src={image} alt="logo" />
            </div>
          ) : (
            <div className="img-placeholder mt-1">
              <span>{uploadLabel || t(IntlKeys.imageUpload.defaultUploadLabel)}</span>
            </div>
          )}
        </label>
        <input
          type="file"
          id={inputId}
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </div>
      <small>{t(IntlKeys.imageUpload.supportedFormats)}</small>
    </div>
  );
};

export default ImageUpload;
