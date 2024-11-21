import { FC, useState } from "react";
import { useField } from "formik";

import { ISelectTextValue } from "../../../../../shared/types/types";

interface ICustomTextSelectProps {
  label: string;
  mainLabel?: string;
  name: string;
  selectOptions: ISelectTextValue[];
  customTextValue: string;
  emptyTextValue?: string;
  initialText?: string;
  textLengthLimit?: number;
  placeholder?: string;
  isDisabled?: boolean;
  isInput?: boolean;
}

const CustomTextSelect: FC<ICustomTextSelectProps> = ({
  label,
  mainLabel,
  name,
  selectOptions,
  customTextValue,
  emptyTextValue,
  initialText,
  textLengthLimit,
  placeholder,
  isDisabled,
  isInput,
}) => {
  const [, meta, helpers] = useField<string>(name);
  const { value } = meta;
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
    <>
      {mainLabel && (
        <label className="label">
          <span className="label-text">{mainLabel}</span>
        </label>
      )}

      <div
        className={`rounded-lg p-2 ${isCustomText && !isInput ? "pb-0" : ""}`}
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
          {selectOptions.map(({ text, value: sValue }) => (
            <option key={sValue} value={sValue} selected={text === value}>
              {text}
            </option>
          ))}
        </select>

        {isCustomText && (
          <div>
            <label htmlFor={name} className="label">
              <span className="label-text">{label}</span>
            </label>

            {isInput ? (
              <input
                className="input input-bordered w-full"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={({ target: { value: currentText } }) => {
                  if (
                    !textLengthLimit ||
                    currentText.length < textLengthLimit + 1 ||
                    currentText.length < value.length
                  ) {
                    setValue(currentText);
                  }
                }}
              />
            ) : (
              <textarea
                className="textarea h-36 textarea-bordered w-full pb-0"
                placeholder={placeholder}
                value={value}
                onChange={({ target: { value: currentText } }) => {
                  if (
                    !textLengthLimit ||
                    currentText.length < textLengthLimit + 1 ||
                    currentText.length < value.length
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
    </>
  );
};

export default CustomTextSelect;
