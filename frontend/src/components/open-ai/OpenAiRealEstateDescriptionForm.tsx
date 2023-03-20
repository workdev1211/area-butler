import { FunctionComponent, useContext, useEffect } from "react";
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
  const {
    searchContextState: { integrationId },
  } = useContext(SearchContext);
  const { realEstateState, realEstateDispatch } = useContext(RealEstateContext);

  const { fetchRealEstateByIntId, fetchRealEstates } = useRealEstateData();

  useEffect(() => {
    const fetchRealEstateData = async () => {
      const realEstates =
        integrationUser && integrationId
          ? [await fetchRealEstateByIntId(integrationId)]
          : await fetchRealEstates();

      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: realEstates,
      });
    };

    void fetchRealEstateData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationId, integrationUser, realEstateDispatch]);

  const getInitRealEstListId = (): string | undefined => {
    if (
      initialValues &&
      realEstateState.listings.some(
        ({ id }) => id === initialValues.realEstateListingId
      )
    ) {
      return initialValues.realEstateListingId;
    }

    if (realEstateState.listings.length === 1) {
      return realEstateState.listings[0].id;
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
              disabled={realEstateState.listings.length < 2}
              defaultValue={
                processedInitialValues.realEstateListingId ||
                placeholderSelectOptionKey
              }
            >
              {realEstateState.listings.length > 1 && (
                <option
                  value={placeholderSelectOptionKey}
                  key={placeholderSelectOptionKey}
                  disabled={true}
                >
                  Immobilie auswählen
                </option>
              )}
              {realEstateState.listings.map(({ id, name, address }) => (
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
