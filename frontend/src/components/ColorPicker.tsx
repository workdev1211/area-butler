import { FC, useRef, useState } from "react";
import { SketchPicker } from "react-color";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import clearIcon from "../assets/icons/cross.svg";
import useOnClickOutside from "../hooks/onclickoutside";
import TooltipBadge from "./TooltipBadge";

interface IColorPickerProps {
  onChange: (color?: string) => void;
  setColor: (color?: string) => void;

  color?: string;
  isDisabled?: boolean;
  label?: string;
  tooltip?: string;
}

const ColorPicker: FC<IColorPickerProps> = ({
  color,
  isDisabled,
  label,
  onChange,
  setColor,
  tooltip,
}) => {
  const { t } = useTranslation();
  const pickerRef = useRef(null);

  const [isShowPopover, setIsShowPopover] = useState(false);

  useOnClickOutside(pickerRef, () => {
    if (isDisabled) {
      return;
    }

    onChange(color);
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

      <div className="flex items-center gap-6">
        <div
          className={
            `w-[100px] h-[60px] border-2 border-dashed border-[var(--base-anthracite)] mt-1` +
            `${isDisabled ? "" : " cursor-pointer"}`
          }
          onClick={() => {
            if (isDisabled) {
              return;
            }

            setIsShowPopover(!isShowPopover);
          }}
          style={{ backgroundColor: color || "#FFFFFF" }}
        />

        {!isDisabled && isShowPopover && (
          <div className="absolute z-10" ref={pickerRef}>
            <SketchPicker
              color={color}
              onChangeComplete={(newColor) => setColor(newColor.hex)}
            />
          </div>
        )}

        {!isDisabled && color && (
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
    </div>
  );
};

export default ColorPicker;
