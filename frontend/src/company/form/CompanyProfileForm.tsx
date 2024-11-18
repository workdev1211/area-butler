import { FC } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import ExportSettingsConfig from "./ExportSettingsConfig";
import { useUserState } from "../../hooks/userstate";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/types";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { ICompanyConfig } from "../../../../shared/types/company";

interface ICompanyProfileFormProps {
  formId: string;
  onSubmit: (values: ICompanyConfig) => void;
}

export const CompanyProfileForm: FC<ICompanyProfileFormProps> = ({
  formId,
  onSubmit,
}) => {
  const { getCurrentUser } = useUserState();
  const {
    config: { exportMatching },
  } = getCurrentUser();

  const initialValues: ICompanyConfig = {
    exportMatching: {
      [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: {
        fieldId:
          (exportMatching &&
            exportMatching[OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]
              ?.fieldId) ||
          "",
      },
      [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: {
        fieldId:
          (exportMatching &&
            exportMatching[OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]
              ?.fieldId) ||
          "",
      },
      [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: {
        fieldId:
          (exportMatching &&
            exportMatching[OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]
              ?.fieldId) ||
          "",
      },
      [AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]: {
        fieldId:
          (exportMatching &&
            exportMatching[AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]
              ?.fieldId) ||
          "",
      },
      [AreaButlerExportTypesEnum.LINK_WO_ADDRESS]: {
        fieldId:
          (exportMatching &&
            exportMatching[AreaButlerExportTypesEnum.LINK_WO_ADDRESS]
              ?.fieldId) ||
          "",
      },
      [AreaButlerExportTypesEnum.INLINE_FRAME]: {
        fieldId:
          (exportMatching &&
            exportMatching[AreaButlerExportTypesEnum.INLINE_FRAME]?.fieldId) ||
          "",
      },
    },
  };

  const validationSchema = Yup.object({
    exportMatching: Yup.object({
      [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: Yup.object({
        fieldId: Yup.string(),
      }),
      [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: Yup.object({
        fieldId: Yup.string(),
      }),
      [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: Yup.object({
        fieldId: Yup.string(),
      }),
      [AreaButlerExportTypesEnum.LINK_WITH_ADDRESS]: Yup.object({
        fieldId: Yup.string(),
      }),
      [AreaButlerExportTypesEnum.LINK_WO_ADDRESS]: Yup.object({
        fieldId: Yup.string(),
      }),
      [AreaButlerExportTypesEnum.INLINE_FRAME]: Yup.object({
        fieldId: Yup.string(),
      }),
    }),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form id={formId}>
        <ExportSettingsConfig />
      </Form>
    </Formik>
  );
};

export default CompanyProfileForm;
