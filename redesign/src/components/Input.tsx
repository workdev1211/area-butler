import React, {InputHTMLAttributes} from "react";
import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: string;
}

const Input: React.FunctionComponent<InputProps> = ({ label, icon, ...props}) => {
    const classes = icon ? 'input-with-icon form-control min-flex relative' : 'form-control min-flex relative';
    return (
        <div className={classes}>
            <label className="label">
                <span>{label}</span>
            </label>
            <input
                {...props}
            />
            {icon && <img src={icon} alt="input-icon" />}
        </div>
    )
}

export default Input;
