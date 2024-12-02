import { FC, useEffect, useState } from "react";
import { useField } from "formik";

import { ISelectTextValue } from "../../../../../shared/types/types";

interface ICustomTextSelectProps {
  customTextValue: string;
  inputLabel: string;
  name: string;
  selectOptions: ISelectTextValue[];

  emptyTextValue?: string;
  isDisabled?: boolean;
  isInput?: boolean;
  label?: string;
  placeholder?: string;
  textLengthLimit?: number;
}

const CustomTextSelectV2: FC<ICustomTextSelectProps> = ({
  customTextValue,
  emptyTextValue,
  inputLabel,
  isDisabled,
  isInput,
  label,
  name,
  placeholder,
  selectOptions,
  textLengthLimit,
}) => {
  const [field, meta, helpers] = useField<string>(name);
  const { value: currentText, initialValue: initialText } = meta;
  const { setValue } = helpers;

  const [isCustomText, setIsCustomText] = useState(false);

  let selectedValue = selectOptions.find(
    ({ text }) => text === currentText
  )?.value;

  if (!selectedValue && !isCustomText && !currentText && emptyTextValue) {
    selectedValue = emptyTextValue;
  }

  if (!selectedValue && isCustomText) {
    selectedValue = customTextValue;
  }

  useEffect(() => {
    setIsCustomText(
      initialText
        ? !selectOptions.find(({ text }) => text === initialText)?.value
        : false
    );
  }, [initialText, selectOptions]);

  return (
    <div className="form-control">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}

      <div className="input-bordered rounded-[var(--btn-border-radius)] p-2 pt-3">
        <div className="form-control">
          <select
            className="select select-bordered w-full"
            value={selectedValue}
            disabled={isDisabled}
            onChange={({ target: { selectedOptions } }) => {
              const selectedOption = selectedOptions[0];

              if (selectedOption.value === customTextValue) {
                setIsCustomText(true);
                setValue("");
                return;
              }

              if (selectedOption.value === emptyTextValue) {
                setIsCustomText(false);
                setValue("");
                return;
              }

              setIsCustomText(false);
              setValue(selectedOptions[0].text);
            }}
          >
            {selectOptions.map(({ text, value: sValue }) => (
              <option key={sValue} value={sValue}>
                {text}
              </option>
            ))}
          </select>
        </div>

        {isCustomText && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">{inputLabel}</span>
            </label>

            {isInput ? (
              <input
                className="input input-bordered w-full"
                disabled={isDisabled}
                maxLength={textLengthLimit}
                placeholder={placeholder}
                type="text"
                {...field}
              />
            ) : (
              <textarea
                className="textarea textarea-bordered w-full h-36 pb-0"
                disabled={isDisabled}
                maxLength={textLengthLimit}
                placeholder={placeholder}
                {...field}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomTextSelectV2;
