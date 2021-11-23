import React, {useState} from "react";
import "./ImageUpload.css";
import {toastError} from "../shared/shared.functions";

export interface ImageUploadProps {
    label?: string;
    src?: string;
    onChange: (logo: string) => void;
}

const ImageUpload: React.FunctionComponent<ImageUploadProps> = ({src, label = 'Dein Logo', onChange}) => {
    const [image, setImage] = useState(src || '');

    const getBase64 = (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files![0];
        if (file.size > 5242880) {
            toastError('Dein Logo darf nicht größer als 5 MB sein!');
            return;
        }
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setImage(`${reader.result}`);
            onChange(`${reader.result}`);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files!.length && e.target.files![0]) {
            getBase64(e);
        }
    };

    return (
        <div className="img-upload">
            <div>
                <label htmlFor="upload-button">
                    {label}:
                    {image ? (
                        <div className="img-container">
                            <img src={image} alt="logo"/>
                        </div>
                    ) : (
                        <div className="img-placeholder">
                            <span>Logo Hochladen</span>
                        </div>
                    )}
                </label>
                <input
                    type="file"
                    id="upload-button"
                    accept="image/*"
                    style={{display: "none"}}
                    onChange={handleChange}
                />
            </div>
            <small>Unterstützte Formate: png, jpg, maximale Größe: 5MB</small>
        </div>
    )
}

export default ImageUpload;
