import React, {InputHTMLAttributes} from "react";
import "./Input.css";
import {useField} from "formik";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: string;
}

const Input: React.FunctionComponent<InputProps> = ({ label, icon, ...props}) => {
    let [field, meta] = useField(props as any);
    const classes = icon ? 'input-with-icon form-control min-flex relative' : 'form-control min-flex relative';
    return (
        <div className={classes}>
            <label className="label" htmlFor={props.id || props.name}>
                <span>{label}</span>
            </label>
            <input
                {...field}
                {...props}
            />
            {icon && <img src={icon} alt="input-icon" />}
            {meta.touched && meta.error && (
                <label className="label">
                    <span className="label-text-alt text-red-500">{meta.error}</span>
                </label>
            )}
        </div>
    )
}

export default Input;
