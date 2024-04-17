import { FunctionComponent, useContext, useEffect } from "react";
import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import {
  IApiOpenAiRealEstDescQuery,
  OpenAiRealEstTypesEnum,
} from "../../../../shared/types/open-ai";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../../context/RealEstateContext";
import { TFormikInnerRef } from "../../shared/shared.types";
import { useRealEstateData } from "../../hooks/realestatedata";
import { SearchContext } from "../../context/SearchContext";
import {
  defaultRealEstType,
  openAiRealEstTypeOptions,
} from "../../../../shared/constants/open-ai";
import CustomTextSelect from "../inputs/formik/CustomTextSelect";
import { ConfigContext } from "../../context/ConfigContext";

interface IOpenAiRealEstDescFormListenProps {
  onValuesChange: (values: IApiOpenAiRealEstDescQuery) => void;
}

const OpenAiRealEstDescFormListener: FunctionComponent<
  IOpenAiRealEstDescFormListenProps
> = ({ onValuesChange }) => {
  const { values } = useFormikContext<IApiOpenAiRealEstDescQuery>();

  useEffect(() => {
    onValuesChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.realEstateId, values.realEstateType]);

  return null;
};

interface IOpenAiRealEstDescFormProps {
  formId: string;
  initialValues?: IApiOpenAiRealEstDescQuery;
  onValuesChange?: (values: IApiOpenAiRealEstDescQuery) => void;
  onSubmit?: (values: IApiOpenAiRealEstDescQuery) => void;
  formRef?: TFormikInnerRef<IApiOpenAiRealEstDescQuery>;
}

const OpenAiRealEstDescForm: FunctionComponent<IOpenAiRealEstDescFormProps> = ({
  formId,
  initialValues = {
    realEstateId: "",
    realEstateType: defaultRealEstType,
  },
  onValuesChange,
  onSubmit,
  formRef,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);
  const {
    realEstateState: { listings },
    realEstateDispatch,
  } = useContext(RealEstateContext);

  const { fetchRealEstates } = useRealEstateData();

  const isIntegration = !!integrationType;

  useEffect(() => {
    if (isIntegration) {
      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: [realEstateListing!],
      });

      return;
    }

    void fetchRealEstates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationType]);

  const getInitRealEstateId = (): string => {
    if (
      initialValues &&
      listings.some(({ id }) => id === initialValues.realEstateId)
    ) {
      return initialValues.realEstateId;
    }

    if (realEstateListing) {
      return realEstateListing.id;
    }

    if (listings.length === 1) {
      return listings[0].id;
    }

    return "";
  };

  const resultInitValues: IApiOpenAiRealEstDescQuery = {
    ...initialValues,
    realEstateId: getInitRealEstateId(),
  };

  const validationSchema = Yup.object({
    realEstateId: Yup.string(),
    realEstateType: Yup.string(),
  });

  return (
    <Formik
      initialValues={resultInitValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (typeof onSubmit === "function") {
          onSubmit(values);
        }
      }}
      innerRef={formRef}
    >
      <Form id={formId}>
        <>
          <div className="form-control">
            <Select
              className="select select-bordered w-full max-w-full"
              label="Immobilienbeschreibung"
              placeholder="Immobilienbeschreibung"
              name="realEstateId"
              disabled={listings.length < 2}
              defaultValue={
                resultInitValues.realEstateId || placeholderSelectOptionKey
              }
            >
              {listings.length > 1 && (
                <option
                  value={placeholderSelectOptionKey}
                  key={placeholderSelectOptionKey}
                  disabled={true}
                >
                  Immobilie auswählen
                </option>
              )}
              {listings.map(({ id, name, address }) => (
                <option value={id} key={id}>
                  {name} ({address})
                </option>
              ))}
            </Select>
          </div>

          <div className="form-control">
            <CustomTextSelect
              label="Objektart"
              placeholder="Objektart"
              name="realEstateType"
              selectOptions={openAiRealEstTypeOptions}
              customTextValue={OpenAiRealEstTypesEnum.CUSTOM}
              initialText={resultInitValues?.realEstateType}
            />
          </div>

          {typeof onValuesChange === "function" && (
            <OpenAiRealEstDescFormListener
              onValuesChange={(values) => {
                onValuesChange(values);
              }}
            />
          )}
        </>
      </Form>
    </Formik>
  );
};

export default OpenAiRealEstDescForm;
