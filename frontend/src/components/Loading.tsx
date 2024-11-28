import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

export const Loading: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center p-3 gap-3">
      <div
        className="animate-spin w-7 h-7 border-[3px] border-current border-t-transparent text-gray-800 rounded-full dark:text-white"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">{t(IntlKeys.common.loading)}</span>
      </div>
      <div className="text-lg not-sr-only">{t(IntlKeys.common.loading)}</div>
    </div>
  );
};

export const LoadingMessage: FC = () => {
  const { t } = useTranslation();
  return <div>{t(IntlKeys.common.pageLoading)}</div>;
};
