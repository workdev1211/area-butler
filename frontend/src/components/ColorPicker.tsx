import { FC, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { SketchPicker } from "react-color";
import useOnClickOutside from "../hooks/onclickoutside";
import TooltipBadge from "./TooltipBadge";

interface IColorPickerProps {
  setColor: (color: string) => void;
  onChange: (color: string) => void;
  color?: string;
  label?: string;
  tooltip?: string;
}

const ColorPicker: FC<IColorPickerProps> = ({
  color,
  setColor,
  label,
  onChange,
  tooltip,
}) => {
  const { t } = useTranslation();
  const pickerRef = useRef(null);
  const [isShowPopover, setIsShowPopover] = useState(false);

  const handleChange = (newColor: string) => {
    setColor(newColor);
  };

  useOnClickOutside(pickerRef, () => {
    onChange(color!);
    setIsShowPopover(false);
  });

  return (
    <div>
      <label htmlFor="color-picker" className="label">
        <div className="indicator">
          <div className="text-lg pr-3">
            {label || t(IntlKeys.yourProfile.yourPrimaryColor)}
          </div>
          {tooltip && <TooltipBadge tooltip={tooltip} />}
        </div>
      </label>

      <div
        className="w-[100px] h-[60px] border-2 border-dashed border-[var(--base-anthracite)] cursor-pointer mt-1"
        onClick={() => setIsShowPopover(!isShowPopover)}
        style={{ backgroundColor: color || "#FFFFFF" }}
      />

      {isShowPopover && (
        <div className="absolute z-10" ref={pickerRef}>
          <SketchPicker
            color={color}
            onChangeComplete={(newColor) => handleChange(newColor.hex)}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
