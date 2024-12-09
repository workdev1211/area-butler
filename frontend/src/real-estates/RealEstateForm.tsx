import { ChangeEvent, FC, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

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
import CustomTextSelectV2 from "../components/inputs/formik/CustomTextSelectV2";
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
  const { t } = useTranslation();
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

  const status1SelectOptions = Object.keys(
    ApiRealEstateStatusEnum
  ).map<ISelectTextValue>((status) => ({
    text: t(
      (IntlKeys.realEstate.statuses as Record<string, string>)[status],
      status
    ),
    value: status,
  }));

  const statusCustTextValue = "custom";
  const statusCustOption = {
    text: t(IntlKeys.realEstate.enterExtraStatus),
    value: statusCustTextValue,
  };

  status1SelectOptions.push(statusCustOption);

  const status2SelectOptions = Object.keys(
    ApiRealEstateStatus2Enum
  ).map<ISelectTextValue>((status) => ({
    text: t((IntlKeys.common.statuses as Record<string, string>)[status]),
    value: status,
  }));

  status2SelectOptions.push(statusCustOption);

  const initialValues: TRealEstateFormData = {
    showInSnippet: resultRealEstate.showInSnippet ?? true,
    status: resultRealEstate.status ?? "IN_PREPARATION",
    status2: resultRealEstate.status2 ?? "ACTIVE",
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
    name: Yup.string().required(t(IntlKeys.realEstate.enterObjectName)),
    externalUrl: Yup.string().url(t(IntlKeys.realEstate.enterValidUrl)),
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
      onSubmit={(values) => {
        if (!resultRealEstate.address || !resultRealEstate.coordinates) {
          toastError(t(IntlKeys.realEstate.enterRealEstateAddress));
          return;
        }

        onSubmit({
          ...values,
          status:
            values.status &&
            (Object.entries(ApiRealEstateStatusEnum)?.find(
              ([key]) => key === values.status
            )?.[1] ||
              values.status),
          status2:
            values.status2 &&
            (Object.entries(ApiRealEstateStatus2Enum)?.find(
              ([key]) => key === values.status2
            )?.[1] ||
              values.status2),
          address: resultRealEstate.address,
          coordinates: resultRealEstate.coordinates,
        });
      }}
      enableReinitialize={true}
    >
      {(props) => {
        const { setFieldValue } = props;

        return (
          <Form id={formId}>
            <div className="mb-5">
              <Checkbox name="showInSnippet" key="showInSnippet">
                {t(IntlKeys.realEstate.showInSnippet)}
              </Checkbox>
            </div>
            <div className="form-control">
              <CustomTextSelectV2
                inputLabel={t(IntlKeys.common.marketingType)}
                name="status"
                selectOptions={status1SelectOptions}
                customTextValue={statusCustTextValue}
              />
            </div>
            <div className="form-control mt-3">
              <CustomTextSelectV2
                inputLabel={t(IntlKeys.common.status)}
                name="status2"
                selectOptions={status2SelectOptions}
                customTextValue={statusCustTextValue}
              />
            </div>
            <div className="form-control">
              <Input
                label={t(IntlKeys.realEstate.objectName)}
                name="name"
                type="text"
                placeholder={t(IntlKeys.realEstate.enterObjectNamePlaceholder)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <Input
                label={t(IntlKeys.realEstate.externalLink)}
                name="externalUrl"
                type="text"
                placeholder={t(IntlKeys.realEstate.externalLinkPlaceholder)}
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
                  {t(IntlKeys.common.from)}
                </Checkbox>
              </div>
              {isMinPriceNeeded && (
                <div className="form-control flex-1">
                  <Input
                    label={`${t(IntlKeys.realEstate.minPrice)} (€)`}
                    name="minPrice"
                    type="number"
                    placeholder={t(IntlKeys.realEstate.pricePlaceholder)}
                    className="input input-bordered w-full"
                  />
                </div>
              )}
              <div className="form-control flex-1">
                <Input
                  label={`${
                    isMinPriceNeeded
                      ? t(IntlKeys.realEstate.maxPrice)
                      : t(IntlKeys.common.price)
                  } (€)`}
                  name="price"
                  type="number"
                  placeholder={t(IntlKeys.realEstate.pricePlaceholder)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control flex-1">
                <Select
                  label={t(IntlKeys.realEstate.costType)}
                  name="type"
                  type="number"
                  placeholder={t(IntlKeys.realEstate.costTypePlaceholder)}
                >
                  {allRealEstateCostTypes.map((costType) => (
                    <option value={costType.type} key={costType.type}>
                      {t(
                        (
                          IntlKeys.realEstate.costTypes as Record<
                            string,
                            string
                          >
                        )[costType.type]
                      )}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <div className="form-control mr-5 mb-2">
                <Checkbox name="propertyStartingAt" key="propertyStartingAt">
                  {t(IntlKeys.common.from)}
                </Checkbox>
              </div>
              <div className="form-control flex-1">
                <Input
                  label={t(IntlKeys.realEstate.realEstateSize)}
                  name="realEstateSizeInSquareMeters"
                  type="number"
                  placeholder={t(IntlKeys.realEstate.realEstateSizePlaceholder)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control flex-1">
                <Input
                  label={t(IntlKeys.realEstate.propertySize)}
                  name="propertySizeInSquareMeters"
                  type="number"
                  placeholder={t(IntlKeys.realEstate.propertySizePlaceholder)}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="form-control">
              <Select
                label={t(IntlKeys.realEstate.energyEfficiency)}
                name="energyEfficiency"
                placeholder={t(IntlKeys.realEstate.energyEfficiencyPlaceholder)}
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
                <strong>{t(IntlKeys.realEstate.equipment)}</strong>
              </span>
            </label>
            {allFurnishing.map((furnishing) => (
              <Checkbox name={furnishing.type} key={furnishing.type}>
                {t(IntlKeys.realEstate.furnishing[furnishing.type])}
              </Checkbox>
            ))}
          </Form>
        );
      }}
    </Formik>
  );
};

export default RealEstateForm;
