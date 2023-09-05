import { FunctionComponent, InputHTMLAttributes } from "react";
import { useField } from "formik";

import "./Input.scss";

interface IRangeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
  type?: string;
}

const RangeInput: FunctionComponent<IRangeInputProps> = ({
  label = "",
  icon,
  type,
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

      <div className="flex w-full items-center gap-2">
        <input type="range" {...field} {...props} />
        <div>{meta.value}</div>
      </div>

      {icon && <img src={icon} alt="input-icon" />}

      {meta.touched && meta.error && (
        <label className="label">
          <span className="error">{meta.error}</span>
        </label>
      )}
    </div>
  );
};

export default RangeInput;
