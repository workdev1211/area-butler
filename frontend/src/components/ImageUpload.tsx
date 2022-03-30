import React from "react";
import "./ImageUpload.scss";
import { toastError } from "../shared/shared.functions";

export interface ImageUploadProps {
  label?: string;
  uploadLabel?: string;
  image: string | undefined;
  inputId?: string;
  setImage: (image: string | undefined) => void;
  onChange: (logo: string) => void;
}

const ImageUpload: React.FunctionComponent<ImageUploadProps> = ({
  image,
  setImage,
  label = "Dein Logo",
  uploadLabel = "Logo hochladen",
  inputId = "upload-button",
  onChange
}) => {
  const getBase64 = (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files![0];
    if (file.size > 5242880) {
      toastError("Dein Logo darf nicht größer als 5 MB sein!");
      return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      setImage(`${reader.result}`);
      onChange(`${reader.result}`);
    };
    reader.onerror = function(error) {
      console.log("Error: ", error);
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files!.length && e.target.files![0]) {
      getBase64(e);
    }
  };

  return (
    <div className="img-upload">
      <div>
        <label htmlFor={inputId}>
          {label}:
          {image ? (
            <div className="img-container mt-1">
              <img src={image} alt="logo" />
            </div>
          ) : (
            <div className="img-placeholder mt-1">
              <span>{uploadLabel}</span>
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
      <small>Unterstützte Formate: png, jpg, svg, maximale Größe: 5MB</small>
    </div>
  );
};

export default ImageUpload;
