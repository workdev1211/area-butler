import React, {useRef, useState} from "react";
import "./ColorPicker.css";
import {SketchPicker} from "react-color";
import useOnClickOutside from "../hooks/onclickoutside";

export interface ColorPickerProps {
    label?: string;
    color?: string;
    setColor: (color: string) => void;
    onChange: (color: string) => void;
}

const ColorPicker: React.FunctionComponent<ColorPickerProps> = ({
                                                                    color,
                                                                    setColor,
                                                                    label = 'Deine Primärfarbe',
                                                                    onChange
                                                                }) => {
    const pickerRef = useRef(null);
    const [showPopover, setShowPopover] = useState(false);

    const handleChange = (newColor: string) => {
        setColor(newColor);
    };

    useOnClickOutside(pickerRef, () => {
        onChange(color!);
        setShowPopover(false);
    });

    return (
        <div className="color-picker">
            <div>
                <label htmlFor="color-picker">
                    {label}:
                </label>
                <div className="color-picker-field mt-1" onClick={() => setShowPopover(!showPopover)}
                     style={{backgroundColor: color || '#FFFFFF'}}/>
                {showPopover && <div className="color-picker-popover" ref={pickerRef}>
                    <SketchPicker
                        color={color}
                        onChangeComplete={(newColor) => handleChange(newColor.hex)}
                    />
                </div>}
            </div>
        </div>
    )
}

export default ColorPicker;
