import { FunctionComponent, useState } from "react";
import { useField } from "formik";

import { ISelectTextValue } from "../../../../../shared/types/types";

interface ICustomTextSelectProps {
  label: string;
  name: string;
  selectOptions: ISelectTextValue[];
  customTextValue: string;
  emptyTextValue?: string;
  initialText?: string;
  textLengthLimit?: number;
  placeholder?: string;
  isDisabled?: boolean;
  isSimple?: boolean;
}

const CustomTextSelect: FunctionComponent<ICustomTextSelectProps> = ({
  label,
  name,
  selectOptions,
  customTextValue,
  emptyTextValue,
  initialText,
  textLengthLimit,
  placeholder,
  isDisabled,
  isSimple,
}) => {
  const [, meta, helpers] = useField<string>(name);
  const { value: textValue } = meta;
  const { setValue } = helpers;

  let selectValue = emptyTextValue || selectOptions[0]?.value;

  if (initialText) {
    selectValue =
      selectOptions.find(({ text }) => text === initialText)?.value ||
      customTextValue;
  }

  const [isCustomText, setIsCustomText] = useState(
    selectValue === customTextValue
  );

  return (
    <div
      className={`rounded-lg p-2 ${isCustomText && !isSimple ? "pb-0" : ""}`}
      style={{ border: "1px solid lightgray" }}
    >
      <select
        className="select select-bordered w-full"
        defaultValue={selectValue}
        disabled={isDisabled}
        onChange={({ target: { selectedOptions } }) => {
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
          setValue(selectedOptions[0].text);
        }}
      >
        {selectOptions.map(({ text, value }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>

      {isCustomText && (
        <div>
          <label htmlFor={name} className="label">
            <span className="label-text">{label}</span>
          </label>

          {isSimple ? (
            <input
              className="input input-bordered w-full"
              type="text"
              placeholder={placeholder}
              value={textValue}
              onChange={({ target: { value: currentText } }) => {
                if (
                  !textLengthLimit ||
                  currentText.length < textLengthLimit + 1 ||
                  currentText.length < textValue.length
                ) {
                  setValue(currentText);
                }
              }}
            />
          ) : (
            <textarea
              className="textarea h-36 textarea-bordered w-full pb-0"
              placeholder={placeholder}
              value={textValue}
              onChange={({ target: { value: currentText } }) => {
                if (
                  !textLengthLimit ||
                  currentText.length < textLengthLimit + 1 ||
                  currentText.length < textValue.length
                ) {
                  setValue(currentText);
                }
              }}
            />
          )}
        </div>
      )}

      {meta.touched && meta.error && (
        <label className="label">
          <span className="label-text-alt text-red-500">{meta.error}</span>
        </label>
      )}
    </div>
  );
};

export default CustomTextSelect;
