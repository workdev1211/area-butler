import { Checkbox } from "components/Checkbox";
import { Input } from "components/Input";
import { Select } from "components/Select";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  allFurnishing, allRealEstateCostTypes
} from "../../../shared/constants/real-estate";
import {
  ApiEnergyEfficiency, ApiRealEstateCostType, ApiRealEstateListing
} from "../../../shared/types/real-estate";

export interface RealEstateListingFormData {
  formId: string;
  onSubmit: (values: any) => any; 
  realEstateListing: Partial<ApiRealEstateListing>;
}

export const RealEstateListingForm: React.FunctionComponent<RealEstateListingFormData> =
  ({ realEstateListing, onSubmit, formId}) => {


    const furnishing =  {} as any;
    (realEstateListing?.characteristics?.furnishing || []).map(f => furnishing[f] = true);

    return (
      <Formik
        initialValues={{
          name: realEstateListing?.name,
          address: realEstateListing?.address,
          price: realEstateListing?.costStructure?.price?.amount || 0,
          type: realEstateListing?.costStructure?.type ||  ApiRealEstateCostType.RENT_MONTHLY_COLD  ,
          realEstateSizeInSquareMeters: realEstateListing.characteristics?.realEstateSizeInSquareMeters || 0,
          propertySizeInSquareMeters: realEstateListing.characteristics?.propertySizeInSquareMeters || 0,
          energyEfficiency: realEstateListing.characteristics?.energyEfficiency || "A",
          ...furnishing
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
        onSubmit={onSubmit}
      >
        <Form id={formId}>
          <div className="form-control">
            <Input
              label="Objektname"
              name="name"
              type="text"
              placeholder="Objektname eingeben"
            />
          </div>
          <div className="form-control">
            <Input
              label="Adressse"
              name="address"
              type="text"
              placeholder="Adresse eingeben"
            />
          </div>
          <div className="flex items-end gap-6">
            <div className="form-control">
              <Input
                label="Preis (€)"
                name="price"
                type="number"
                placeholder="Preis eingeben"
              />
            </div>
            <div className="form-control">
              <Select
                label="Kostenart"
                name="type"
                type="number"
                placeholder="Kostenart eingeben"
              >
                {allRealEstateCostTypes.map((costType) => (
                  <option value={costType.type}>{costType.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex items-end gap-6">
            <div className="form-control">
              <Input
                label="Größe in Quadratmeer"
                name="realEstateSizeInSquareMeters"
                type="number"
                placeholder="Größe in Quadrameter"
              />
            </div>
            <div className="form-control">
              <Input
                label="Grundstück in Quadratmeer"
                name="propertySizeInSquareMeters"
                type="number"
                placeholder="Grundstück in Quadrameter"
              />
            </div>
          </div>
          <div className="form-control">
            <Select
              label="Energieeffizienklasse"
              name="energyEfficiency"
              placeholder="Energieeffizienzklasse"
            >
              {Object.keys(ApiEnergyEfficiency).map((aee) => (
                <option value={aee}>{aee}</option>
              ))}
            </Select>
          </div>
          <label className="label mt-4">
            <span className="label-text">
              <strong>Austattung</strong>
            </span>
          </label>
          {allFurnishing.map((furnishing) => (
            <Checkbox name={furnishing.type}>{furnishing.label}</Checkbox>
          ))}
        </Form>
      </Formik>
    );
  };

export default RealEstateListingForm;
