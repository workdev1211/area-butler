import { FunctionComponent } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import {
  ApiRealEstateListing,
  ApiUpsertRealEstateListing,
} from "../../../shared/types/real-estate";
import Input from "../components/inputs/formik/Input";
import Checkbox from "../components/inputs/formik/Checkbox";

export interface IRealEstateIntFormProps {
  formId: string;
  onSubmit: (values: Partial<ApiUpsertRealEstateListing>) => void;
  realEstate: ApiRealEstateListing;
}

export const RealEstateIntForm: FunctionComponent<IRealEstateIntFormProps> = ({
  realEstate,
  onSubmit,
  formId,
}) => {
  return (
    <Formik
      initialValues={{
        showInSnippet: !!realEstate.showInSnippet,
        externalUrl: realEstate.externalUrl ?? "",
      }}
      validationSchema={Yup.object({
        showInSnippet: Yup.boolean().required(),
        externalUrl: Yup.string().url("Bitte geben Sie eine gültige URL an"),
      })}
      enableReinitialize={true}
      onSubmit={(values: Partial<ApiUpsertRealEstateListing>) => {
        onSubmit({ ...values });
      }}
    >
      <Form id={formId}>
        <div className="mb-5">
          <Checkbox name="showInSnippet" key="showInSnippet">
            In Snippet anzeigen
          </Checkbox>
        </div>
        <div className="form-control">
          <Input
            label="Externer Link"
            name="externalUrl"
            type="text"
            placeholder="Externer Link (z.B. https://www.google.de)"
            className="input input-bordered w-full"
          />
        </div>
      </Form>
    </Formik>
  );
};

export default RealEstateIntForm;
