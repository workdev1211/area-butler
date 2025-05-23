import { FC, useContext, useEffect } from "react";
import structuredClone from "@ungap/structured-clone";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";

import Select from "../inputs/formik/Select";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import {
  IApiOpenAiRealEstDescQuery,
  OpenAiRealEstTypesEnum,
} from "../../../../shared/types/open-ai";
import {
  RealEstateActionTypeEnum,
  RealEstateContext,
} from "../../context/RealEstateContext";
import { TFormikInnerRef } from "../../shared/shared.types";
import { useRealEstateData } from "../../hooks/realestatedata";
import { SearchContext } from "../../context/SearchContext";
import { openAiRealEstTypeOptions } from "../../../../shared/constants/open-ai";
import { ConfigContext } from "../../context/ConfigContext";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import CustomTextSelectV2 from "../inputs/formik/CustomTextSelectV2";

interface IOpenAiRealEstDescFormListenProps {
  onValuesChange: (values: IApiOpenAiRealEstDescQuery) => void;
}

const getInitRealEstateId = (
  initValues: IApiOpenAiRealEstDescQuery,
  realEstates: ApiRealEstateListing[],
  realEstate?: ApiRealEstateListing
): string => {
  if (
    initValues &&
    realEstates.some(({ id }) => id === initValues.realEstateId)
  ) {
    return initValues.realEstateId;
  }

  if (realEstate) {
    return realEstate.id;
  }

  if (realEstates.length === 1) {
    return realEstates[0].id;
  }

  return placeholderSelectOptionKey;
};

const OpenAiRealEstDescFormListener: FC<IOpenAiRealEstDescFormListenProps> = ({
  onValuesChange,
}): null => {
  const { values } = useFormikContext<IApiOpenAiRealEstDescQuery>();

  useEffect(() => {
    onValuesChange(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.realEstateId, values.realEstateType]);

  return null;
};

interface IOpenAiRealEstDescFormProps {
  formId: string;
  initialValues?: IApiOpenAiRealEstDescQuery;
  onValuesChange?: (values: IApiOpenAiRealEstDescQuery) => void;
  onSubmit?: (values: IApiOpenAiRealEstDescQuery) => void;
  formRef?: TFormikInnerRef<IApiOpenAiRealEstDescQuery>;
}

const OpenAiRealEstDescForm: FC<IOpenAiRealEstDescFormProps> = ({
  formId,
  initialValues,
  onValuesChange,
  onSubmit,
  formRef,
}) => {
  const { t } = useTranslation();
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);
  const {
    realEstateState: { listings },
    realEstateDispatch,
  } = useContext(RealEstateContext);

  const { fetchRealEstates } = useRealEstateData();

  const isIntegration = !!integrationType;

  useEffect(() => {
    if (isIntegration) {
      realEstateDispatch({
        type: RealEstateActionTypeEnum.SET_REAL_ESTATES,
        payload: [realEstateListing!],
      });

      return;
    }

    void fetchRealEstates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationType]);

  const resultInitValues = initialValues
    ? structuredClone(initialValues)
    : {
        realEstateId: "",
        realEstateType: OpenAiRealEstTypesEnum.HOUSE,
      };

  resultInitValues.realEstateId = getInitRealEstateId(
    resultInitValues,
    listings,
    realEstateListing
  );

  const validationSchema = Yup.object({
    realEstateId: Yup.string(),
    realEstateType: Yup.string(),
  });

  return (
    <Formik
      initialValues={resultInitValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (typeof onSubmit === "function") {
          onSubmit(values);
        }
      }}
      enableReinitialize={true}
      innerRef={formRef}
    >
      <Form id={formId}>
        <div className="form-control">
          <Select
            className="select select-bordered w-full max-w-full"
            label={t(IntlKeys.snapshotEditor.dataTab.realEstate)}
            placeholder={t(
              IntlKeys.snapshotEditor.dataTab.realEstatePlaceholder
            )}
            name="realEstateId"
            disabled={listings.length < 2}
            defaultValue={resultInitValues.realEstateId}
          >
            {listings.length > 1 && (
              <option
                value={placeholderSelectOptionKey}
                key={placeholderSelectOptionKey}
                disabled={true}
              >
                {t(IntlKeys.snapshotEditor.dataTab.selectRealEstate)}
              </option>
            )}
            {listings.map(({ id, name, address }) => (
              <option value={id} key={id}>
                {name} ({address})
              </option>
            ))}
          </Select>
        </div>

        <div className="form-control">
          <CustomTextSelectV2
            name="realEstateType"
            label={t(IntlKeys.snapshotEditor.dataTab.objectType)}
            inputLabel={t(IntlKeys.common.description)}
            selectOptions={openAiRealEstTypeOptions.map(({ value }) => ({
              value,
              text: t(
                (
                  IntlKeys.snapshotEditor.dataTab.realEstateTypes as Record<
                    string,
                    string
                  >
                )[value]
              ),
            }))}
            customTextValue={OpenAiRealEstTypesEnum.CUSTOM}
            placeholder={t(IntlKeys.snapshotEditor.dataTab.objectType)}
          />
        </div>

        {typeof onValuesChange === "function" && (
          <OpenAiRealEstDescFormListener
            onValuesChange={(values) => {
              onValuesChange(values);
            }}
          />
        )}
      </Form>
    </Formik>
  );
};

export default OpenAiRealEstDescForm;
