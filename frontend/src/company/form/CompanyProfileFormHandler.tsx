import { FC } from "react";
import structuredClone from "@ungap/structured-clone";

import CompanyProfileForm from "./CompanyProfileForm";
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
  const { updateCompanyConfig } = useUserState();

  const onSubmit = async (companyConfig: ICompanyConfig): Promise<void> => {
    const resCompanyConfig = structuredClone(companyConfig);
    const resExportMatch = resCompanyConfig.exportMatching;

    if (resExportMatch) {
      Object.keys(resExportMatch).forEach((key: string) => {
        if (resExportMatch[key as TAreaButlerExportTypes]?.fieldId === "") {
          delete resExportMatch[key as TAreaButlerExportTypes];
        }
      });
    }

    try {
      setIsBusy(true);
      await updateCompanyConfig(resCompanyConfig);
    } finally {
      setIsBusy(false);
    }
  };

  return <CompanyProfileForm formId={formId} onSubmit={onSubmit} />;
};

export default CompanyProfileFormHandler;
