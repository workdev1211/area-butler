import { FunctionComponent } from "react";

interface IZoomSliderProps {
  zoomLevel?: number;
  onChange: (zoomLevel: number) => void;
}

const ZoomSlider: FunctionComponent<IZoomSliderProps> = ({
  zoomLevel,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h4 className="font-bold">Zoom Level</h4>
      <div
        className="grid auto-rows-fr gap-2"
        style={{ gridTemplateColumns: "2fr 0.5fr 1.5fr" }}
      >
        <input
          className="range"
          type="range"
          min="2"
          max="30"
          value={zoomLevel}
          onChange={({ target: { value } }) => {
            onChange(parseInt(value));
          }}
        />
        <div className="label-text">{zoomLevel}</div>
      </div>
    </div>
  );
};

export default ZoomSlider;
