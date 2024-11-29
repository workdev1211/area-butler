import { ComponentType, FC, useEffect, useMemo, useState } from "react";
import {
  CSSObjectWithLabel,
  GroupBase,
  StylesConfig,
  components,
  OptionProps,
} from "react-select";
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
import { Loading } from "../components/Loading";
import { toastError } from "../shared/shared.functions";

const DEFAULT_DELAY_MS = 3000;
const INITIAL_SNAPSHOT_NUM = 10;

const Option: ComponentType<
  OptionProps<
    ApiSearchResultSnapshotResponse,
    false,
    GroupBase<ApiSearchResultSnapshotResponse>
  >
> = ({ children, ...props }) => {
  return (
    <components.Option {...props}>
      <div className="flex flex-col">
        <div>{children}</div>
        {props.data.description && (
          <div className="text-sm">{props.data.description}</div>
        )}
      </div>
    </components.Option>
  );
};

const CompanyTemplateId: FC = () => {
  const { getCurrentUser, updateCompanyConfig } = useUserState();
  const { fetchCompanySnapshots } = useLocationData();
  const { t } = useTranslation();

  const user = getCurrentUser();

  const [fetchDelayInMs, setFetchDelayInMs] = useState<number>(0);
  const [defaultValue, setDefaultValue] =
    useState<ApiSearchResultSnapshotResponse>();

  useEffect(() => {
    if (!user.config.companyTemplateSnapshotId) {
      return;
    }

    const fetchDefaultValue = async () => {
      const [fetchedValue] = await fetchCompanySnapshots({
        filter: {
          id: user.config.companyTemplateSnapshotId,
        },
        limit: 1,
        project: {
          "snapshot.placesLocation.label": 1,
        },
      });

      if (fetchedValue) {
        setDefaultValue(fetchedValue);
        return;
      }

      toastError(t(IntlKeys.common.errorOccurred));

      console.error(
        `Company template snapshot with id ${user.config.companyTemplateSnapshotId} not found!`
      );
    };

    void fetchDefaultValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.config.companyTemplateSnapshotId]);

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
            project: {
              description: 1,
              "snapshot.placesLocation.label": 1,
            },
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
    []
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

  const isDefValueAvail = user.config.companyTemplateSnapshotId
    ? !!defaultValue
    : true;

  return (
    <div className="form-control gap-3">
      <h1 className="font-bold text-xl">
        {t(IntlKeys.company.profile.templateIdLabel)}
      </h1>

      {!isDefValueAvail && (
        <div className="max-w-fit">
          <Loading />
        </div>
      )}

      {isDefValueAvail && (
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
            control: () => "2xl:max-w-3xl",
          }}
          components={{ Option }}
          defaultValue={defaultValue}
          loadOptions={loadOptions}
          getOptionLabel={(option) =>
            `${option.snapshot?.placesLocation?.label} (${option.id})`
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
      )}
    </div>
  );
};

export default CompanyTemplateId;
