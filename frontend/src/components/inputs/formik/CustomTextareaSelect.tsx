import { FunctionComponent, useState } from "react";
import { useField } from "formik";

interface ICustomTextAreaSelectProps {
  label: string;
  name: string;
  customTextValue: string;
  emptyTextValue: string;
  textLengthLimit?: number;
  placeholder?: string;
}

const CustomTextareaSelect: FunctionComponent<ICustomTextAreaSelectProps> = ({
  label,
  name,
  customTextValue,
  emptyTextValue,
  textLengthLimit,
  placeholder,
  children,
}) => {
  const [, meta, helpers] = useField(name);
  const [isCustomText, setIsCustomText] = useState(false);
  const { value } = meta;
  const { setValue } = helpers;

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
          <label htmlFor={name} className="label">
            <span className="label-text">{label}</span>
          </label>

          <textarea
            className="textarea h-36 textarea-bordered w-full pb-0"
            onChange={({ target: { value: textValue } }) => {
              if (
                !textLengthLimit ||
                textValue.length < textLengthLimit + 1 ||
                textValue.length < value.length
              ) {
                setValue(textValue);
              }
            }}
            value={value}
            placeholder={placeholder}
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
