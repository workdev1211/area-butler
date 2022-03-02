import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  allFurnishing,
  allRealEstateCostTypes
} from "../../../shared/constants/real-estate";
import {
  ApiEnergyEfficiency,
  ApiRealEstateCostType,
  ApiRealEstateListing
} from "../../../shared/types/real-estate";
import Input from "../components/Input";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import React, { useEffect, useState } from "react";
import LocationAutocomplete from "../components/LocationAutocomplete";

export interface RealEstateFormProps {
  formId: string;
  onSubmit: (values: any) => any;
  realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateForm: React.FunctionComponent<RealEstateFormProps> = ({
  realEstate,
  onSubmit,
  formId
}) => {
  const furnishing = {} as any;
  (realEstate?.characteristics?.furnishing || []).map(
    f => (furnishing[f] = true)
  );

  const [localRealEstate, setLocalRealEstate] = useState<
    Partial<ApiRealEstateListing>
  >(realEstate);

  const realEstateString = JSON.stringify(realEstate);
  useEffect(() => {
    const parsedEstate = JSON.parse(realEstateString);
    setLocalRealEstate(parsedEstate);
  }, [realEstateString, setLocalRealEstate]);

  const onLocationAutocompleteChange = (payload: any) => {
    const updatedRealEstate = {
      ...realEstate,
      address: payload.value.label,
      coordinates: payload.coordinates
    };
    setLocalRealEstate(updatedRealEstate);
  };

  return (
    <Formik
      initialValues={{
        name: localRealEstate?.name ?? "",
        externalUrl: localRealEstate?.externalUrl ?? "",
        price: localRealEstate?.costStructure?.price?.amount || 0,
        type:
          localRealEstate?.costStructure?.type ||
          ApiRealEstateCostType.RENT_MONTHLY_COLD,
        realEstateSizeInSquareMeters:
          localRealEstate.characteristics?.realEstateSizeInSquareMeters ?? 0,
        propertySizeInSquareMeters:
          localRealEstate.characteristics?.propertySizeInSquareMeters ?? 0,
        energyEfficiency:
          localRealEstate.characteristics?.energyEfficiency ?? "A",
        ...furnishing
      }}
      validationSchema={Yup.object({
        name: Yup.string().required("Bitte geben Sie einen Objektnamen an"),
        externalUrl: Yup.string().url("Bitte geben Sie eine gültige URL an"),
        price: Yup.number(),
        type: Yup.string(),
        realEstateSizeInSquareMeters: Yup.number(),
        propertySizeInSquareMeters: Yup.number(),
        energyEfficiency: Yup.string()
      })}
      enableReinitialize={true}
      onSubmit={values => {
        onSubmit({
          ...values,
          address: localRealEstate.address,
          coordinates: localRealEstate.coordinates
        });
      }}
    >
      <Form id={formId}>
        <div className="form-control">
          <Input
            label="Objektname"
            name="name"
            type="text"
            placeholder="Objektname eingeben"
            className="input input-bordered w-full"
          />
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
        <LocationAutocomplete
          value={localRealEstate.address}
          setValue={() => {}}
          afterChange={onLocationAutocompleteChange}
        />
        <div className="flex flex-wrap items-end gap-6">
          <div className="form-control flex-1">
            <Input
              label="Preis (€)"
              name="price"
              type="number"
              placeholder="Preis eingeben"
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control flex-1">
            <Select
              label="Kostenart"
              name="type"
              type="number"
              placeholder="Kostenart eingeben"
            >
              {allRealEstateCostTypes.map(costType => (
                <option value={costType.type} key={costType.type}>
                  {costType.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <div className="form-control flex-1">
            <Input
              label="Größe in Quadratmeer"
              name="realEstateSizeInSquareMeters"
              type="number"
              placeholder="Größe in Quadrameter"
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control flex-1">
            <Input
              label="Grundstück in Quadratmeer"
              name="propertySizeInSquareMeters"
              type="number"
              placeholder="Grundstück in Quadrameter"
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <div className="form-control">
          <Select
            label="Energieeffizienklasse"
            name="energyEfficiency"
            placeholder="Energieeffizienzklasse"
          >
            {Object.keys(ApiEnergyEfficiency).map(aee => (
              <option value={aee} key={aee}>
                {aee}
              </option>
            ))}
          </Select>
        </div>
        <label className="label mt-4">
          <span className="label-text">
            <strong>Ausstattung</strong>
          </span>
        </label>
        {allFurnishing.map(furnishing => (
          <Checkbox name={furnishing.type} key={furnishing.type}>
            {furnishing.label}
          </Checkbox>
        ))}
      </Form>
    </Formik>
  );
};

export default RealEstateForm;
