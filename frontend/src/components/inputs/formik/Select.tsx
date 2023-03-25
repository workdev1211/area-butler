import { FunctionComponent, useEffect } from "react";
import { useField } from "formik";

interface ISelectProps {
  label: string | undefined;
  defaultValue?: string;
  className?: string;
  [key: string | number | symbol]: unknown;
}

const Select: FunctionComponent<ISelectProps> = ({
  label,
  defaultValue,
  className = "select select-bordered w-full max-w-xs",
  ...props
}: any) => {
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  return (
    <div>
      <label htmlFor={props.id || props.name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <select {...field} {...props} className={className} />
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="error">{meta.error}</span>
        </label>
      ) : null}
    </div>
  );
};

export default Select;
