import {
  ChangeEvent,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import {
  allFurnishing,
  allRealEstateCostTypes,
  allRealEstateStatuses,
} from "../../../shared/constants/real-estate";
import {
  ApiEnergyEfficiency,
  ApiRealEstateCostType,
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from "../../../shared/types/real-estate";
import Input from "../components/inputs/formik/Input";
import Select from "../components/inputs/formik/Select";
import Checkbox from "../components/inputs/formik/Checkbox";

import LocationAutocomplete from "../components/LocationAutocomplete";

export interface RealEstateFormProps {
  formId: string;
  onSubmit: (values: any) => any;
  realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateForm: FunctionComponent<RealEstateFormProps> = ({
  realEstate,
  onSubmit,
  formId,
}) => {
  const furnishing = {} as any;

  (realEstate?.characteristics?.furnishing || []).map(
    (f) => (furnishing[f] = true)
  );

  const [localRealEstate, setLocalRealEstate] =
    useState<Partial<ApiRealEstateListing>>(realEstate);

  const [isNeededMinPrice, setIsNeededMinPrice] = useState(false);
  const realEstateString = JSON.stringify(realEstate);

  useEffect(() => {
    const parsedEstate = JSON.parse(realEstateString);
    setLocalRealEstate(parsedEstate);

    setIsNeededMinPrice(
      Number.isFinite(parsedEstate?.costStructure?.minPrice?.amount)
    );
  }, [realEstateString, setLocalRealEstate, setIsNeededMinPrice]);

  const onLocationAutocompleteChange = (payload: any) => {
    const updatedRealEstate = {
      ...realEstate,
      address: payload.value.label,
      coordinates: payload.coordinates,
    };

    setLocalRealEstate(updatedRealEstate);
  };

  const minPrice = localRealEstate?.costStructure?.minPrice?.amount;
  const maxPrice = localRealEstate?.costStructure?.price?.amount;

  return (
    <Formik
      initialValues={{
        name: localRealEstate?.name ?? "",
        externalUrl: localRealEstate?.externalUrl ?? "",
        minPrice: minPrice || "",
        price: !minPrice && !maxPrice ? 0 : maxPrice || "",
        priceStartingAt: Number.isFinite(
          localRealEstate?.costStructure?.minPrice?.amount
        ), // keep in mind that Number.isFinite is used instead of the global isFinite
        type:
          localRealEstate?.costStructure?.type ||
          ApiRealEstateCostType.RENT_MONTHLY_COLD,
        propertyStartingAt: localRealEstate?.characteristics?.startingAt,
        showInSnippet:
          localRealEstate === undefined ||
          localRealEstate.showInSnippet === undefined
            ? true
            : localRealEstate.showInSnippet,
        realEstateSizeInSquareMeters:
          localRealEstate.characteristics?.realEstateSizeInSquareMeters ?? 0,
        propertySizeInSquareMeters:
          localRealEstate.characteristics?.propertySizeInSquareMeters ?? 0,
        energyEfficiency:
          localRealEstate.characteristics?.energyEfficiency ?? "A",
        status:
          localRealEstate.status ?? ApiRealEstateStatusEnum.IN_PREPARATION,
        ...furnishing,
      }}
      validationSchema={Yup.object({
        name: Yup.string().required("Bitte geben Sie einen Objektnamen an"),
        externalUrl: Yup.string().url("Bitte geben Sie eine gültige URL an"),
        minPrice: Yup.number(),
        price: Yup.number(),
        priceStartingAt: Yup.boolean(),
        propertyStartingAt: Yup.boolean(),
        showInSnippet: Yup.boolean(),
        type: Yup.string(),
        realEstateSizeInSquareMeters: Yup.number(),
        propertySizeInSquareMeters: Yup.number(),
        energyEfficiency: Yup.string(),
        status: Yup.string(),
      })}
      enableReinitialize={true}
      onSubmit={(values) => {
        onSubmit({
          ...values,
          address: localRealEstate.address,
          coordinates: localRealEstate.coordinates,
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
              <Select label="Typ" name="status" placeholder="Typ">
                {allRealEstateStatuses.reduce(
                  (result: ReactNode[], { label, status }) => {
                    if (status !== ApiRealEstateStatusEnum.ALL) {
                      result.push(
                        <option value={status} key={status}>
                          {label}
                        </option>
                      );
                    }

                    return result;
                  },
                  []
                )}
              </Select>
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
              value={localRealEstate.address}
              setValue={() => {}}
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
                    setIsNeededMinPrice(checked);

                    if (!checked) {
                      setFieldValue("minPrice", "");
                    }
                  }}
                >
                  Ab
                </Checkbox>
              </div>
              {isNeededMinPrice && (
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
                  label={`${isNeededMinPrice ? "Höchstpreis" : "Preis"} (€)`}
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
