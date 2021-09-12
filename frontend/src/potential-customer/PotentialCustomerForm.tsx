import { Input } from "components/Input";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";

export interface PotentialCustomerFormData {
    formId: string;
    onSubmit: (values: any) => any;
    customer: Partial<ApiPotentialCustomer>;
}

export const PotentialCustomerForm: React.FunctionComponent<PotentialCustomerFormData> = ({
    formId,
    onSubmit,
    customer
  }) => {
    return (
      <Formik
        initialValues={{
          name: customer.name || "",
          email: customer.email || "",
        }}
        validationSchema={Yup.object({
          name: Yup.string().required("Bitte geben den Namen ein"),
          email: Yup.string().email().required("Bitte geben Sie eine gültige Email-Adresse ein"),
        })}
        onSubmit={onSubmit}
      >
        <Form id={formId}>
          <div className="form-control">
            <Input
              label="Name des Interessenten"
              name="name"
              type="text"
              placeholder="Name"
            />
          </div>
          <div className="form-control">
            <Input
              label="Email des Interessenten"
              name="email"
              type="text"
              placeholder="Email"
            />
          </div>
        </Form>
      </Formik>
    );
  };
  
  export default PotentialCustomerForm;
  