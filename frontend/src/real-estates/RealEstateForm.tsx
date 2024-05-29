import { ChangeEvent, FC, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../shared/constants/real-estate";
import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiRealEstateStatus2Enum,
  ApiRealEstateStatusEnum,
} from "../../../shared/types/real-estate";
import Input from "../components/inputs/formik/Input";
import Select from "../components/inputs/formik/Select";
import Checkbox from "../components/inputs/formik/Checkbox";
import LocationAutocomplete from "../components/LocationAutocomplete";
import CustomTextSelect from "../components/inputs/formik/CustomTextSelect";
import { ApiCoordinates, ISelectTextValue } from "../../../shared/types/types";
import { TInitRealEstate } from "../pages/RealEstatePage";
import { toastError } from "../shared/shared.functions";

interface IRealEstMainFormData {
  showInSnippet: boolean;
  status?: string;
  status2?: string;
  name: string;

  externalUrl?: string;
  priceStartingAt: boolean;
  minPrice?: number;
  price?: number;
  type: ApiRealEstateCostType;
  propertyStartingAt: boolean;
  realEstateSizeInSquareMeters?: number;
  propertySizeInSquareMeters?: number;
  energyEfficiency: ApiEnergyEfficiency;
}

export type TRealEstateFormData = IRealEstMainFormData &
  Partial<Record<ApiFurnishing, boolean>>;

export type TRealEstResultValues = TRealEstateFormData & {
  address: string;
  coordinates: ApiCoordinates;
};

interface IRealEstateFormProps {
  formId: string;
  onSubmit: (values: TRealEstResultValues) => void;
  realEstate: TInitRealEstate;
}

export const RealEstateForm: FC<IRealEstateFormProps> = ({
  formId,
  onSubmit,
  realEstate,
}) => {
  const [resultRealEstate, setResultRealEstate] = useState<TInitRealEstate>(
    JSON.parse(JSON.stringify(realEstate))
  );
  const [isMinPriceNeeded, setIsMinPriceNeeded] = useState(
    Number.isFinite(resultRealEstate?.costStructure?.minPrice?.amount)
  );

  const onLocationAutocompleteChange = (payload: any): void => {
    setResultRealEstate({
      ...JSON.parse(JSON.stringify(resultRealEstate)), // possible overshot
      address: payload.value.label,
      coordinates: payload.coordinates,
    });
  };

  const minPrice = resultRealEstate?.costStructure?.minPrice?.amount;
  const maxPrice = resultRealEstate?.costStructure?.price?.amount;

  const status1SelectOptions = Object.values(
    ApiRealEstateStatusEnum
  ).map<ISelectTextValue>((status) => ({ text: status, value: status }));

  const statusCustTextValue = "custom";
  const statusCustOption = {
    text: "Geben Sie Ihren Extra Status ein",
    value: statusCustTextValue,
  };

  status1SelectOptions.push(statusCustOption);

  const status2SelectOptions = Object.values(
    ApiRealEstateStatus2Enum
  ).map<ISelectTextValue>((status) => ({ text: status, value: status }));

  status2SelectOptions.push(statusCustOption);

  const initialValues: TRealEstateFormData = {
    showInSnippet: resultRealEstate.showInSnippet ?? true,
    status: resultRealEstate.status ?? ApiRealEstateStatusEnum.IN_PREPARATION,
    status2: resultRealEstate.status2 ?? ApiRealEstateStatus2Enum.ACTIVE,
    name: resultRealEstate.name,
    externalUrl: resultRealEstate?.externalUrl,
    priceStartingAt: Number.isFinite(
      resultRealEstate?.costStructure?.minPrice?.amount
    ), // keep in mind that Number.isFinite is used instead of the global isFinite
    minPrice: minPrice,
    price: maxPrice,
    type:
      resultRealEstate?.costStructure?.type ??
      ApiRealEstateCostType.RENT_MONTHLY_COLD,
    propertyStartingAt: !!resultRealEstate?.characteristics?.startingAt,
    realEstateSizeInSquareMeters:
      resultRealEstate.characteristics?.realEstateSizeInSquareMeters,
    propertySizeInSquareMeters:
      resultRealEstate.characteristics?.propertySizeInSquareMeters,
    energyEfficiency:
      resultRealEstate.characteristics?.energyEfficiency ??
      ApiEnergyEfficiency.A,
  };

  Object.values<ApiFurnishing>(ApiFurnishing).forEach((value) => {
    initialValues[value] =
      resultRealEstate.characteristics?.furnishing?.includes(value) ?? false;
  });

  const validationSchema: Yup.ObjectSchema<IRealEstMainFormData> = Yup.object({
    showInSnippet: Yup.boolean().required(),
    status: Yup.string(),
    status2: Yup.string(),
    name: Yup.string().required("Bitte geben Sie einen Objektnamen an"),
    externalUrl: Yup.string().url("Bitte geben Sie eine gültige URL an"),
    priceStartingAt: Yup.boolean().required(),
    minPrice: Yup.number().min(0),
    price: Yup.number().min(0),
    type: Yup.mixed<ApiRealEstateCostType>()
      .oneOf(Object.values(ApiRealEstateCostType))
      .required(),
    propertyStartingAt: Yup.boolean().required(),
    realEstateSizeInSquareMeters: Yup.number().min(0),
    propertySizeInSquareMeters: Yup.number().min(0),
    energyEfficiency: Yup.mixed<ApiEnergyEfficiency>()
      .oneOf(Object.values(ApiEnergyEfficiency))
      .required(),
  });

  Object.values<ApiFurnishing>(ApiFurnishing).forEach((value) => {
    validationSchema.shape({ [value]: Yup.boolean().required() });
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        if (!resultRealEstate.address || !resultRealEstate.coordinates) {
          toastError("Bitte geben Sie die Immobilien-Adresse an");
          return;
        }

        onSubmit({
          ...values,
          address: resultRealEstate.address,
          coordinates: resultRealEstate.coordinates,
        });
      }}
    >
      {(props) => {
        const { setFieldValue } = props;

        return (
          <Form id={formId}>
            <div className="mb-5">
              <Checkbox name="showInSnippet" key="showInSnippet">
                In Snippet anzeigen
              </Checkbox>
            </div>
            <div className="form-control">
              <CustomTextSelect
                label="Vermarktungsart"
                name="status"
                selectOptions={status1SelectOptions}
                customTextValue={statusCustTextValue}
                initialText={resultRealEstate.status}
              />
            </div>
            <div className="form-control mt-3">
              <CustomTextSelect
                label="Status"
                name="status2"
                selectOptions={status2SelectOptions}
                customTextValue={statusCustTextValue}
                initialText={resultRealEstate.status2}
              />
            </div>
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
              value={resultRealEstate.address}
              afterChange={onLocationAutocompleteChange}
            />
            <div className="flex flex-wrap items-end justify-start gap-6">
              <div className="form-control mr-5 mb-2">
                <Checkbox
                  name="startingAt"
                  key="startingAt"
                  onChange={({
                    target: { checked },
                  }: ChangeEvent<HTMLInputElement>) => {
                    setFieldValue("startingAt", checked);
                    setIsMinPriceNeeded(checked);

                    if (!checked) {
                      setFieldValue("minPrice", "");
                    }
                  }}
                >
                  Ab
                </Checkbox>
              </div>
              {isMinPriceNeeded && (
                <div className="form-control flex-1">
                  <Input
                    label="Mindestpreis (€)"
                    name="minPrice"
                    type="number"
                    placeholder="Preis eingeben"
                    className="input input-bordered w-full"
                  />
                </div>
              )}
              <div className="form-control flex-1">
                <Input
                  label={`${isMinPriceNeeded ? "Höchstpreis" : "Preis"} (€)`}
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
                  {allRealEstateCostTypes.map((costType) => (
                    <option value={costType.type} key={costType.type}>
                      {costType.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <div className="form-control mr-5 mb-2">
                <Checkbox name="propertyStartingAt" key="propertyStartingAt">
                  Ab
                </Checkbox>
              </div>
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
                {Object.keys(ApiEnergyEfficiency).map((aee) => (
                  <option value={aee} key={aee}>
                    {aee}
                  </option>
                ))}
              </Select>
            </div>
            <label className="label mt-4">
              <span className="label-text">
                {/* TODO make the option selectable not for the whole width */}
                <strong>Ausstattung</strong>
              </span>
            </label>
            {allFurnishing.map((furnishing) => (
              <Checkbox name={furnishing.type} key={furnishing.type}>
                {furnishing.label}
              </Checkbox>
            ))}
          </Form>
        );
      }}
    </Formik>
  );
};

export default RealEstateForm;
