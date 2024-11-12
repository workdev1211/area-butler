import { FC, useMemo, useState } from "react";
import { CSSObjectWithLabel, GroupBase, StylesConfig } from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { useUserState } from "../hooks/userstate";
import { useLocationData } from "../hooks/locationdata";
import {
  ApiSearchResultSnapshotResponse,
  IApiFetchReqParams,
} from "../../../shared/types/types";
import { debounce } from "../../../shared/functions/shared.functions";

const DEFAULT_DELAY_MS = 3000;
const INITIAL_SNAPSHOT_NUM = 10;

const CompanyTemplateId: FC = () => {
  const { getCurrentUser, updateCompanyConfig } = useUserState();
  const { fetchCompanySnapshots } = useLocationData();
  const { t } = useTranslation();

  const [fetchDelayInMs, setFetchDelayInMs] = useState<number>(0);

  const user = getCurrentUser();

  const loadOptions = useMemo(
    () =>
      debounce(
        async (
          inputValue: string,
          callback: (options: ApiSearchResultSnapshotResponse[]) => void
        ): Promise<void> => {
          if (inputValue.length !== 0 && inputValue.length < 3) {
            return;
          }

          const fetchSnapshotParams: IApiFetchReqParams = {
            limit: INITIAL_SNAPSHOT_NUM,
          };

          if (inputValue) {
            fetchSnapshotParams.filter = {
              "snapshot.placesLocation.label": {
                $regex: inputValue,
                $options: "i",
              },
            };
          }

          setFetchDelayInMs(DEFAULT_DELAY_MS);
          const options = await fetchCompanySnapshots(fetchSnapshotParams);
          callback(options);
        },
        fetchDelayInMs
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchCompanySnapshots]
  );

  const customStyles: StylesConfig<
    ApiSearchResultSnapshotResponse,
    false,
    GroupBase<ApiSearchResultSnapshotResponse>
  > = {
    control: (base: CSSObjectWithLabel) => ({
      ...base,
      border: "1px solid var(--base-bright-silver)",
      boxShadow: "none",
      ":hover": {
        border: "1px solid var(--primary)",
      },
      ":focus": {
        border: "1px solid var(--primary)",
      },
    }),
  };

  return (
    <div className="form-control">
      <label className="label font-bold" htmlFor="company-template-id">
        {t(IntlKeys.company.profile.templateIdLabel)}
      </label>

      <AsyncCreatableSelect
        name="company-template-id"
        styles={customStyles}
        placeholder={t(IntlKeys.company.profile.templatePlaceholder)}
        isClearable={true}
        isSearchable={true}
        defaultOptions={true}
        cacheOptions={true}
        createOptionPosition="first"
        classNames={{
          control: () => "2xl:max-w-2xl",
        }}
        defaultValue={
          user.config.companyTemplateSnapshotId
            ? ({
                id: user.config.companyTemplateSnapshotId,
              } as ApiSearchResultSnapshotResponse)
            : undefined
        }
        loadOptions={loadOptions}
        getOptionLabel={(option) =>
          option.snapshot?.placesLocation?.label || option.id
        }
        getNewOptionData={(inputValue: string) =>
          ({ id: inputValue } as ApiSearchResultSnapshotResponse)
        }
        getOptionValue={(option) => option.id}
        onChange={(option) =>
          updateCompanyConfig({
            companyTemplateSnapshotId: option?.id || null,
          })
        }
      />
    </div>
  );
};

export default CompanyTemplateId;
