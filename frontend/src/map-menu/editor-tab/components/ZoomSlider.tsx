import { FunctionComponent } from "react";
import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

interface IZoomSliderProps {
  zoomLevel?: number;
  onChange: (zoomLevel: number) => void;
}

const ZoomSlider: FunctionComponent<IZoomSliderProps> = ({
  zoomLevel,
  onChange,
}) => {
  const { t } = useTranslation();
    
  return (
    <div className="flex flex-col gap-2 w-full">
      <h4 className="font-bold">{t(IntlKeys.snapshotEditor.zoomLevel)}:</h4>
      <div
        className="grid auto-rows-fr gap-2"
        style={{ gridTemplateColumns: "2fr 0.5fr 1.5fr" }}
      >
        <input
          className="range"
          type="range"
          min="0"
          max="18"
          value={zoomLevel}
          onChange={({ target: { value } }) => {
            onChange(parseInt(value));
          }}
        />
      </div>
    </div>
  );
};

export default ZoomSlider;
