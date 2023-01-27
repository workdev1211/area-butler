import { useField } from "formik";
import React from "react";

const Checkbox = ({ children, ...props }: any) => {
    const [field, meta] = useField({ ...props, type: "checkbox" });
    return (
      <div>
        <label className="cursor-pointer label justify-start pl-0">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            {...field}
            {...props}
          />
          <span className="label-text ml-2">{children}</span>
        </label>
        {meta.touched && meta.error ? (
            <label className="label">
                <span className="error">{meta.error}</span>
            </label>
        ) : null}
      </div>
    );
  };
export default Checkbox;
