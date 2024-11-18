import { FC } from "react";
import structuredClone from "@ungap/structured-clone";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import CompanyProfileForm from "./CompanyProfileForm";
import { toastError, toastSuccess } from "../../shared/shared.functions";
import { useUserState } from "../../hooks/userstate";
import { ICompanyConfig } from "../../../../shared/types/company";
import { TAreaButlerExportTypes } from "../../../../shared/types/types";

interface ICompProfFormHandlerProps {
  formId: string;
  setIsBusy: (isBusy: boolean) => void;
}

const CompanyProfileFormHandler: FC<ICompProfFormHandlerProps> = ({
  formId,
  setIsBusy,
}) => {
  const { t } = useTranslation();
  const { updateCompanyConfig } = useUserState();

  const onSubmit = async (companyConfig: ICompanyConfig): Promise<void> => {
    const resCompanyConfig = structuredClone(companyConfig);
    const resExportMatch = resCompanyConfig.exportMatching;

    if (resExportMatch) {
      Object.keys(resExportMatch).forEach((key: string) => {
        if (resExportMatch[key as TAreaButlerExportTypes]?.fieldId === "") {
          delete resExportMatch[key as TAreaButlerExportTypes]; // Remove the key if the value is empty
        }
      });
    }

    try {
      setIsBusy(true);
      await updateCompanyConfig(resCompanyConfig);
      toastSuccess(t(IntlKeys.yourProfile.profileUpdated));
    } catch (err) {
      console.error(err);
      toastError(t(IntlKeys.yourProfile.profileUpdateError));
    } finally {
      setIsBusy(false);
    }
  };

  return <CompanyProfileForm formId={formId} onSubmit={onSubmit} />;
};

export default CompanyProfileFormHandler;
