import { FunctionComponent, useContext, useEffect, useState } from "react";
import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import { IApiOpenAiRealEstateDescriptionQuery } from "../../../../shared/types/open-ai";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../../context/RealEstateContext";
import { TFormikInnerRef } from "../../shared/shared.types";
import { useRealEstateData } from "../../hooks/realestatedata";
import { UserContext } from "../../context/UserContext";
import { SearchContext } from "../../context/SearchContext";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";

interface IOpenAiRealEstateDescriptionFormListenerProps {
  onValuesChange: (values: IApiOpenAiRealEstateDescriptionQuery) => void;
}

const OpenAiRealEstateDescriptionFormListener: FunctionComponent<
  IOpenAiRealEstateDescriptionFormListenerProps
> = ({ onValuesChange }) => {
  const { values } = useFormikContext<IApiOpenAiRealEstateDescriptionQuery>();

  useEffect(() => {
    onValuesChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.realEstateListingId]);

  return null;
};

interface IRealEstateDescriptionFormProps {
  formId: string;
  initialValues?: IApiOpenAiRealEstateDescriptionQuery;
  onValuesChange?: (values: IApiOpenAiRealEstateDescriptionQuery) => void;
  onSubmit?: (values: IApiOpenAiRealEstateDescriptionQuery) => void;
  formRef?: TFormikInnerRef<IApiOpenAiRealEstateDescriptionQuery>;
}

const OpenAiRealEstateDescriptionForm: FunctionComponent<
  IRealEstateDescriptionFormProps
> = ({ formId, initialValues, onValuesChange, onSubmit, formRef }) => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);
  const { searchContextState } = useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);

  const { fetchRealEstates } = useRealEstateData();

  const [realEstates, setRealEstates] = useState<ApiRealEstateListing[]>([]);

  useEffect(() => {
    if (integrationUser) {
      setRealEstates([searchContextState.realEstateListing!]);
      return;
    }

    const fetchRealEstateData = async () => {
      const realEstateData = await fetchRealEstates();

      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: realEstateData,
      });

      setRealEstates(realEstateData);
    };

    void fetchRealEstateData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationUser, realEstateDispatch]);

  const getInitRealEstListId = (): string | undefined => {
    if (
      initialValues &&
      realEstates.some(({ id }) => id === initialValues.realEstateListingId)
    ) {
      return initialValues.realEstateListingId;
    }

    if (realEstates.length === 1) {
      return realEstates[0].id;
    }

    return;
  };

  const processedInitialValues = {
    realEstateListingId: getInitRealEstListId(),
  };

  const validationSchema = Yup.object({
    realEstateListingId: Yup.string(),
  });

  return (
    <Formik
      initialValues={processedInitialValues}
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
              disabled={realEstates.length < 2}
              defaultValue={
                processedInitialValues.realEstateListingId ||
                placeholderSelectOptionKey
              }
            >
              {realEstates.length > 1 && (
                <option
                  value={placeholderSelectOptionKey}
                  key={placeholderSelectOptionKey}
                  disabled={true}
                >
                  Immobilie auswählen
                </option>
              )}
              {realEstates.map(({ id, name, address }) => (
                <option value={id} key={id}>
                  {name} ({address})
                </option>
              ))}
            </Select>
          </div>

          {typeof onValuesChange === "function" && (
            <OpenAiRealEstateDescriptionFormListener
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

export default OpenAiRealEstateDescriptionForm;
