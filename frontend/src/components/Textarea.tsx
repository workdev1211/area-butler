import { useField } from "formik";
import React, {InputHTMLAttributes, TextareaHTMLAttributes} from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

const Textarea: React.FunctionComponent<TextAreaProps> = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <textarea className="textarea h-24 textarea-bordered" {...field} {...props} />
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="label-text-alt text-red-500">{meta.error}</span>
        </label>
      ) : null}
    </>
  );
};

export default Textarea;