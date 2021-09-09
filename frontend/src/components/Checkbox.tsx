import { useField } from "formik";

export const Checkbox = ({ children, ...props }: any) => {
    const [field, meta] = useField({ ...props, type: "checkbox" });
    return (
      <div>
        <label className="cursor-pointer label justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            {...field}
            {...props}
          />
          <span className="label-text">{children}</span>
        </label>
        {meta.touched && meta.error ? (
          <div className="error">{meta.error}</div>
        ) : null}
      </div>
    );
  };