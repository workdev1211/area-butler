import { FunctionComponent } from "react";
import { useField } from "formik";

import { ISelectTextValue } from "../../../../../shared/types/types";
import Input from "./Input";

interface ICustomNumberSelectProps {
  label: string;
  mainLabel?: string;
  name: string;
  mainName: string;
  selectOptions: ISelectTextValue[];
  customTextValue: string;
  initialNumber?: number;
  placeholder?: string;
}

const CustomNumberSelect: FunctionComponent<ICustomNumberSelectProps> = ({
  label,
  mainLabel,
  name,
  mainName,
  selectOptions,
  customTextValue,
  initialNumber,
  placeholder,
}) => {
  const [field, meta] = useField<string>(mainName);
  const isCustomNumber = field.value === customTextValue;

  return (
    <>
      {mainLabel && (
        <label className="label">
          <span className="label-text">{mainLabel}</span>
        </label>
      )}
      <div className="rounded-lg p-2" style={{ border: "1px solid lightgray" }}>
        <select className="select select-bordered w-full" {...field}>
          {selectOptions.map(({ text, value }) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>

        {isCustomNumber && (
          <div>
            <Input
              defaultValue={initialNumber}
              label={label}
              name={name}
              className="input input-bordered w-full"
              type="number"
              placeholder={placeholder}
            />
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

export default CustomNumberSelect;
