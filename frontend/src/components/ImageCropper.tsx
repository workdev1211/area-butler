import React, {useState} from "react";
import ReactCrop, {Crop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export interface ImageCropperProps {
    aspect: number,
    initialSrc: string
}

const ImageCropper: React.FunctionComponent<ImageCropperProps> = ({aspect, initialSrc}) => {
    const [crop, setCrop] = useState<Partial<Crop>>({
        aspect, unit: 'px',
        width: 50,
        height: 50,
    });

    const [src, setSrc] = useState<string>(initialSrc);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setSrc(reader.result as string)
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div>
            <div className="mb-5">
                <input type="file" accept="image/*" onChange={onSelectFile}/>
            </div>
            <ReactCrop crop={crop} src={src} onChange={newCrop => setCrop(newCrop)}/>
        </div>
    )
}

export default ImageCropper;
