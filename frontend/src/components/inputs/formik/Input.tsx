import { FunctionComponent, InputHTMLAttributes } from "react";
import { useField } from "formik";

import "./Input.scss";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
}

const Input: FunctionComponent<IInputProps> = ({
  label = "",
  icon,
  ...props
}) => {
  const [field, meta] = useField(props as any);

  const classes = icon
    ? "input-with-icon form-control min-flex relative"
    : "form-control min-flex relative";

  return (
    <div className={classes}>
      <label className="label" htmlFor={props.id || props.name}>
        <span>{label}</span>
      </label>

      <input {...field} {...props} />

      {icon && <img src={icon} alt="input-icon" />}

      {meta.touched && meta.error && (
        <label className="label">
          <span className="error">{meta.error}</span>
        </label>
      )}
    </div>
  );
};

export default Input;
