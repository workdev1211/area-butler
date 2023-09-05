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
import { UserContext } from "../../context/UserContext";
import { SearchContext } from "../../context/SearchContext";
import {
  defaultRealEstType,
  openAiRealEstTypeOptions,
} from "../../../../shared/constants/open-ai";
import CustomTextSelect from "../inputs/formik/CustomTextSelect";

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
  }, [values.realEstateListingId, values.realEstateType]);

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
    realEstateListingId: "",
    realEstateType: defaultRealEstType,
  },
  onValuesChange,
  onSubmit,
  formRef,
}) => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const { searchContextState } = useContext(SearchContext);
  const {
    realEstateState: { listings },
    realEstateDispatch,
  } = useContext(RealEstateContext);

  const { fetchRealEstates } = useRealEstateData();

  useEffect(() => {
    if (integrationUser) {
      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: [searchContextState.realEstateListing!],
      });

      return;
    }

    void fetchRealEstates();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationUser]);

  const getInitRealEstListId = (): string => {
    if (
      initialValues &&
      listings.some(({ id }) => id === initialValues.realEstateListingId)
    ) {
      return initialValues.realEstateListingId;
    }

    if (listings.length === 1) {
      return listings[0].id;
    }

    return "";
  };

  const resultingInitialValues: IApiOpenAiRealEstDescQuery = {
    ...initialValues,
    realEstateListingId: getInitRealEstListId(),
  };

  const validationSchema = Yup.object({
    realEstateListingId: Yup.string(),
    realEstateType: Yup.string(),
  });

  return (
    <Formik
      initialValues={resultingInitialValues}
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
              name="realEstateListingId"
              disabled={listings.length < 2}
              defaultValue={
                resultingInitialValues.realEstateListingId ||
                placeholderSelectOptionKey
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
              initialText={resultingInitialValues?.realEstateType}
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
