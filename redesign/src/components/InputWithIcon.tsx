import React, {InputHTMLAttributes} from "react";
import "./InputWithIcon.css";

export interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: string;
}

const InputWithIcon: React.FunctionComponent<InputWithIconProps> = ({ label, icon, ...props}) => {
    return (
        <div className="input-with-icon form-control min-flex relative">
            <label className="label">
                <span>{label}</span>
            </label>
            <input
                {...props}
            />
            <img src={icon} alt="input-icon" />
        </div>
    )
}

export default InputWithIcon;
