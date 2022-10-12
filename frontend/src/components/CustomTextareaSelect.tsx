import { useState } from "react";
import { useField } from "formik";

const CustomTextareaSelect = ({
  label,
  customTextValue,
  emptyTextValue,
  ...props
}: any) => {
  const [, meta, helpers] = useField(props.name);
  const [isCustomText, setIsCustomText] = useState(false);
  const { value } = meta;
  const { setValue } = helpers;

  const allPropsWoChildren = { ...props };
  delete allPropsWoChildren.children;
  const children = [...props.children];

  return (
    <div
      className={`rounded-lg p-2 w-full ${isCustomText ? "pb-0" : ""}`}
      style={{ border: "1px solid lightgray" }}
    >
      <select
        className="select select-bordered w-full"
        onChange={({ target: { selectedOptions } }): void => {
          const selectedOption = selectedOptions[0];

          if (emptyTextValue === selectedOption.value) {
            setValue("");
            setIsCustomText(false);
            return;
          }

          if (customTextValue === selectedOption.value) {
            setValue("");
            setIsCustomText(true);
            return;
          }

          setIsCustomText(false);
          setValue(selectedOptions[0].label);
        }}
      >
        {children}
      </select>

      {isCustomText && (
        <>
          <label htmlFor={props.name} className="label">
            <span className="label-text">{label}</span>
          </label>

          <textarea
            {...allPropsWoChildren}
            className="textarea h-24 textarea-bordered w-full pb-0"
            onChange={({ target: { value: textValue } }) => {
              setValue(textValue);
            }}
            value={value}
          />
        </>
      )}

      {meta.touched && meta.error ? (
        <label className="label">
          <span className="label-text-alt text-red-500">{meta.error}</span>
        </label>
      ) : null}
    </div>
  );
};

export default CustomTextareaSelect;
