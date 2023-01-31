import { FunctionComponent, useState } from "react";

import {
  OpenAiCustomTextEnum,
  OpenAiTonalityEnum,
} from "../../../../shared/types/open-ai";
import {
  openAiCustomText,
  openAiTonalities,
} from "../../../../shared/constants/open-ai";
import CustomTextareaSelect from "../inputs/formik/CustomTextareaSelect";

interface IOpenAiModuleProps {
  searchResultSnapshotId: string;
}

const OpenAiModule: FunctionComponent<IOpenAiModuleProps> = ({
  searchResultSnapshotId,
}) => {
  const [a1, setA1] = useState();

  const meansOfTransportation: any[] = [];

  return (
    <div>
      <div className="form-control">
        <label htmlFor="queryType" className="label">
          <span className="label-text">Option wählen</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          name="queryType"
          // disabled={meansOfTransportation.length === 1}
        >
          <option selected disabled>
            Was möchten Sie generieren?
          </option>
          {/*{meansOfTransportation.map(({ label, value }) => (*/}
          {/*  <option value={value} key={value}>*/}
          {/*    {label}*/}
          {/*  </option>*/}
          {/*))}*/}
        </select>
      </div>
      <div className="form-control">
        <label htmlFor="meanOfTransportation" className="label">
          <span className="label-text">Transportmitteln</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          name="meanOfTransportation"
          disabled={meansOfTransportation.length === 1}
        >
          <option selected disabled>
            Transportmitteln
          </option>
          {meansOfTransportation.map(({ label, value }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label htmlFor="tonality" className="label">
          <span className="label-text">Texttonalität</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          name="tonality"
        >
          <option selected disabled>
            Texttonalität
          </option>
          {Object.values(OpenAiTonalityEnum).map((key) => (
            <option value={key} key={key}>
              {openAiTonalities[key]}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control mt-3">
        <div className="indicator">
          <div
            className="indicator-item badge w-5 h-5 text-white"
            style={{
              border: "1px solid var(--primary)",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
            }}
          >
            <div
              className="tooltip tooltip-left tooltip-accent text-justify font-medium"
              data-tip="In dieses Feld können Sie einen zusätzlichen Wunsch an die KI eingeben. Dieser Wunsch wird bei der Erstellung des Textes möglichst berücksichtigt."
            >
              i
            </div>
          </div>
          <div className="grid place-items-center">
            {/*<CustomTextareaSelect*/}
            {/*  label="Benutzerdefinierter Text"*/}
            {/*  name="customText"*/}
            {/*  customTextValue={OpenAiCustomTextEnum.CUSTOM}*/}
            {/*  emptyTextValue={OpenAiCustomTextEnum.NONE}*/}
            {/*  onChange={setA1}*/}
            {/*  value={a1}*/}
            {/*>*/}
            {/*  <option selected disabled>*/}
            {/*    Benutzerdefinierter Text*/}
            {/*  </option>*/}
            {/*  {openAiCustomText.map(({ type, label }) => (*/}
            {/*    <option value={type} key={type}>*/}
            {/*      {label}*/}
            {/*    </option>*/}
            {/*  ))}*/}
            {/*</CustomTextareaSelect>*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAiModule;
