import { useField, useFormik, Form, Formik } from "formik";
import { useHttp } from "hooks/http";
import * as Yup from "yup";
import {
  ApiRealEstateListing,
  ApiEnergyEfficiency,
} from "../../../shared/types/real-estate";
import {
  allRealEstateCostTypes,
  allFurnishing,
} from "../../../shared/constants/real-estate";

const MyTextInput = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <input className="input input-bordered" {...field} {...props} />
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="label-text-alt text-red-500">{meta.error}</span>
        </label>
      ) : null}
    </>
  );
};

const MyCheckbox = ({ children, ...props }: any) => {
  const [field, meta] = useField({ ...props, type: "checkbox" });
  return (
    <div>
      <label className="cursor-pointer label justify-start gap-3">
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          {...field}
          {...props}
        />
        <span className="label-text">{children}</span>
      </label>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </div>
  );
};

const MySelect = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);
  return (
    <div>
      <label htmlFor={props.id || props.name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        {...field}
        {...props}
        className="select select-bordered w-full max-w-xs"
      />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </div>
  );
};

export interface RealEstateListingFormData {
  realEstateListing: Partial<ApiRealEstateListing>;
}

export const RealEstatListingForm: React.FunctionComponent<RealEstateListingFormData> =
  ({ realEstateListing }) => {
    const { post, put } = useHttp();

    return (
      <>
        <Formik
          initialValues={{
            name: realEstateListing?.name,
            address: realEstateListing?.address,
            price: null,
            type: null,
            realEstateSizeInSquareMeters: null,
            propertySizeInSquareMeters: null,
            energyEfficiency: null

          }}
          validationSchema={Yup.object({
            name: Yup.string().required("Bitte geben Sie einen Objektnamen an"),
            address: Yup.string().required("Bitte geben Sie eine Adresse an"),
            price: Yup.number(),
            type: Yup.string(),
            realEstateSizeInSquareMeters: Yup.number(),
            propertySizeInSquareMeters: Yup.number(),
            energyEfficiency: Yup.string(),
          })}
          onSubmit={(values) => console.log(values)}
        >
          <Form id="realEstateListingForm">
            <div className="form-control">
              <MyTextInput
                label="Objektname"
                name="name"
                type="text"
                placeholder="Objektname eingeben"
              />
            </div>
            <div className="form-control">
              <MyTextInput
                label="Adressse"
                name="address"
                type="text"
                placeholder="Adresse eingeben"
              />
            </div>
            <div className="flex items-end gap-6">
              <div className="form-control">
                <MyTextInput
                  label="Preis (€)"
                  name="price"
                  type="number"
                  placeholder="Preis eingeben"
                />
              </div>
              <div className="form-control">
                <MySelect
                  label="Kostenart"
                  name="type"
                  type="number"
                  placeholder="Kostenart eingeben"
                >
                  {allRealEstateCostTypes.map((costType) => (
                    <option value={costType.type}>{costType.label}</option>
                  ))}
                </MySelect>
              </div>
            </div>
            <div className="flex items-end gap-6">
              <div className="form-control">
                <MyTextInput
                  label="Größe in Quadratmeer"
                  name="realEstateSizeInSquareMeters"
                  type="number"
                  placeholder="Größe in Quadrameter"
                />
              </div>
              <div className="form-control">
                <MyTextInput
                  label="Grundstück in Quadratmeer"
                  name="propertySizeInSquareMeters"
                  type="number"
                  placeholder="Grundstück in Quadrameter"
                />
              </div>
            </div>
            <div className="form-control">
              <MySelect
                label="Energieeffizienklasse"
                name="energyEfficiency"
                placeholder="Energieeffizienzklasse"
              >
                {Object.keys(ApiEnergyEfficiency).map((aee) => (
                  <option value={aee}>{aee}</option>
                ))}
              </MySelect>
            </div>
            <label className="label mt-4">
                  <span className="label-text"><strong>Austattung</strong></span>
            </label>
            {allFurnishing.map((furnishing) => (
              <>
                <MyCheckbox name={furnishing.type}>
                  {furnishing.label}
                </MyCheckbox>
              </>
            ))}
          </Form>
        </Formik>
      </>
    );
  };

export default RealEstatListingForm;
