import { FunctionComponent, useState } from "react";
import { useField } from "formik";

import { ISelectTextValue } from "../../../../../shared/types/types";

interface ICustomTextAreaSelectProps {
  label: string;
  name: string;
  customTextValue: ISelectTextValue;
  emptyTextValue: ISelectTextValue;
  selectedTextValue?: ISelectTextValue;
  textLengthLimit?: number;
  placeholder?: string;
}

const CustomTextareaSelect: FunctionComponent<ICustomTextAreaSelectProps> = ({
  label,
  name,
  customTextValue,
  emptyTextValue,
  selectedTextValue,
  textLengthLimit,
  placeholder,
  children,
}) => {
  const [, meta, helpers] = useField<ISelectTextValue>(name);
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
        defaultValue={selectedTextValue?.value}
        onChange={({ target: { selectedOptions } }): void => {
          const selectedOption = selectedOptions[0];

          if (emptyTextValue.value === selectedOption.value) {
            setValue(emptyTextValue);
            setIsCustomText(false);
            return;
          }

          if (customTextValue.value === selectedOption.value) {
            setValue(customTextValue);
            setIsCustomText(true);
            return;
          }

          setIsCustomText(false);
          setValue({
            text: selectedOptions[0].text,
            value: selectedOptions[0].value,
          });
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
                textValue.length < value.text.length
              ) {
                setValue({ ...value, text: textValue });
              }
            }}
            defaultValue={selectedTextValue?.text}
            value={value.text}
            placeholder={placeholder}
          />
        </>
      )}

      {meta.touched && meta.error && (
        <label className="label">
          <span className="label-text-alt text-red-500">{meta.error}</span>
        </label>
      )}
    </div>
  );
};

export default CustomTextareaSelect;
