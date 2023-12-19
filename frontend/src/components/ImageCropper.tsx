// NOT USED FOR THE MOMENT

import { useState, FunctionComponent, ChangeEvent } from "react";
import ReactCrop, { Crop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

interface IImageCropperProps {
  aspect: number;
  initialSrc: string;
}

const ImageCropper: FunctionComponent<IImageCropperProps> = ({
  aspect,
  initialSrc,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: 50,
    height: 50,
  });

  const [src, setSrc] = useState<string>(initialSrc);

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSrc(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <input type="file" accept="image/*" onChange={onSelectFile} />
      </div>

      <ReactCrop aspect={aspect} crop={crop} onChange={setCrop}>
        <img src={src} alt="To be cropped" />
      </ReactCrop>
    </div>
  );
};

export default ImageCropper;
