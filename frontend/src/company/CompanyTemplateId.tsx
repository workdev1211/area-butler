import { FC, useMemo, useState } from "react";
import { ControlProps, CSSObjectWithLabel, GroupBase } from "react-select";
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

  const customStyles = {
    control: (
      provided: CSSObjectWithLabel,
      {
        isFocused,
      }: ControlProps<
        ApiSearchResultSnapshotResponse,
        false,
        GroupBase<ApiSearchResultSnapshotResponse>
      >
    ) => {
      const boxShadow = isFocused
        ? "0 0 0 2px hsl(var(--b1)),0 0 0 4px hsla(var(--bc)/.2)"
        : "none";

      return {
        ...provided,
        borderColor: "rgb(203 213 225)",
        borderWidth: "1px",
        boxShadow,
        "&:hover": {
          boxShadow,
        },
        // left just in case
        // "&:active": {
        //   boxShadow,
        // },
      };
    },
  };

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

  return (
    <div className="flex flex-col gap-1">
      <div className="font-bold">
        {t(IntlKeys.company.profile.templateIdLabel)}
      </div>

      <AsyncCreatableSelect
        styles={customStyles}
        placeholder={t(IntlKeys.company.profile.templatePlaceholder)}
        isClearable={true}
        isSearchable={true}
        defaultOptions={true}
        cacheOptions={true}
        createOptionPosition="first"
        classNames={{
          control: (
            state: ControlProps<
              ApiSearchResultSnapshotResponse,
              false,
              GroupBase<ApiSearchResultSnapshotResponse>
            >
          ) => "select select-bordered",
        }}
        value={
          {
            id: user.config.companyTemplateSnapshotId,
          } as ApiSearchResultSnapshotResponse
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
