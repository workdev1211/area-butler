import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import Input from "components/inputs/formik/Input";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/types";

const ExportSettingsConfig: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-bold text-xl">
        {t(IntlKeys.company.profile.exportMatching)}
      </h1>

      {t(IntlKeys.company.profile.exportMatchDescription)}

      <div className="form-control">
        <Input
          className="input input-bordered w-1/2"
          name={`exportMatching.${OpenAiQueryTypeEnum.LOCATION_DESCRIPTION}.fieldId`}
          type="text"
          label={t(IntlKeys.yourProfile.locationDescription)}
          placeholder={t(IntlKeys.yourProfile.locationDescription)}
        />
      </div>

      <div className="form-control">
        <Input
          className="input input-bordered w-1/2"
          name={`exportMatching.${OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION}.fieldId`}
          type="text"
          label={t(IntlKeys.yourProfile.locationRealEstateDescription)}
          placeholder={t(IntlKeys.yourProfile.locationRealEstateDescription)}
        />
      </div>

      <div className="form-control">
        <Input
          className="input input-bordered w-1/2"
          name={`exportMatching.${OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION}.fieldId`}
          type="text"
          label={t(IntlKeys.yourProfile.realEstateDescription)}
          placeholder={t(IntlKeys.yourProfile.realEstateDescription)}
        />
      </div>

      <div className="form-control">
        <Input
          className="input input-bordered w-1/2"
          name={`exportMatching.${OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION}.fieldId`}
          type="text"
          label={t(IntlKeys.yourProfile.equipmentDescription)}
          placeholder={t(IntlKeys.yourProfile.equipmentDescription)}
        />
      </div>

      <div className="form-control">
        <Input
          className="input input-bordered w-1/2"
          name={`exportMatching.${AreaButlerExportTypesEnum.LINK_WITH_ADDRESS}.fieldId`}
          type="text"
          label={t(IntlKeys.yourProfile.linkWithAddress)}
          placeholder={t(IntlKeys.yourProfile.linkWithAddress)}
        />
      </div>

      <div className="form-control">
        <Input
          className="input input-bordered w-1/2"
          name={`exportMatching.${AreaButlerExportTypesEnum.LINK_WO_ADDRESS}.fieldId`}
          type="text"
          label={t(IntlKeys.yourProfile.linkWoAddress)}
          placeholder={t(IntlKeys.yourProfile.linkWoAddress)}
        />
      </div>

      <div className="form-control">
        <Input
          className="input input-bordered w-1/2"
          name={`exportMatching.${AreaButlerExportTypesEnum.INLINE_FRAME}.fieldId`}
          type="text"
          label={t(IntlKeys.yourProfile.inlineFrame)}
          placeholder={t(IntlKeys.yourProfile.inlineFrame)}
        />
      </div>
    </div>
  );
};

export default ExportSettingsConfig;
