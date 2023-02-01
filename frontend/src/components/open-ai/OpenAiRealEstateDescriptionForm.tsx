import { FunctionComponent, useContext, useEffect } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import { IOpenAiRealEstateDescriptionFormValues } from "../../../../shared/types/open-ai";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../../context/RealEstateContext";
import { useHttp } from "../../hooks/http";
import { TFormikInnerRef } from "../../shared/shared.types";

interface IRealEstateDescriptionFormProps {
  formId: string;
  onSubmit: (values: IOpenAiRealEstateDescriptionFormValues) => void;
  formRef?: TFormikInnerRef<IOpenAiRealEstateDescriptionFormValues>;
}

const OpenAiRealEstateDescriptionForm: FunctionComponent<
  IRealEstateDescriptionFormProps
> = ({ formId, onSubmit, formRef }) => {
  const { realEstateState, realEstateDispatch } = useContext(RealEstateContext);
  const { get } = useHttp();

  useEffect(() => {
    const fetchRealEstates = async () => {
      const response = await get<ApiRealEstateListing[]>(
        "/api/real-estate-listings"
      );

      realEstateDispatch({
        type: RealEstateActionTypes.SET_REAL_ESTATES,
        payload: response.data,
      });
    };

    void fetchRealEstates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validationSchema = Yup.object({
    realEstateId: Yup.string(),
  });

  return (
    <Formik
      initialValues={{
        realEstateListingId: undefined,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}
      innerRef={formRef}
    >
      <Form id={formId}>
        <div className="form-control">
          <Select
            className="input input-bordered w-full"
            label="Immobilienbeschreibung"
            placeholder="Immobilienbeschreibung"
            name="realEstateListingId"
            disabled={!realEstateState.listings.length}
            defaultValue={placeholderSelectOptionKey}
          >
            <option
              value={placeholderSelectOptionKey}
              key={placeholderSelectOptionKey}
              disabled={true}
            >
              Immobilie auswählen
            </option>
            {realEstateState.listings.map(({ id, name, address }) => (
              <option value={id} key={id}>
                {name} ({address})
              </option>
            ))}
          </Select>
        </div>
      </Form>
    </Formik>
  );
};

export default OpenAiRealEstateDescriptionForm;
