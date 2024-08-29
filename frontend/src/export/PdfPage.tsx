import { FunctionComponent, CSSProperties, ReactNode } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import areaButlerLogo from "../assets/img/logo.svg";
import { LanguageTypeEnum } from '../../../shared/types/types';

interface IPdfPageProps {
  nextPageNumber?: () => string;
  logo?: any;
  title?: string;
  leftHeaderElement?: ReactNode;
  outputLanguage?: LanguageTypeEnum;
}

export const PdfPage: FunctionComponent<IPdfPageProps> = ({
  nextPageNumber = () => "01",
  title,
  children,
  logo = areaButlerLogo,
  leftHeaderElement = <div />,
  outputLanguage,
}) => {
  const { t } = useTranslation("", { lng: outputLanguage });
  const style: CSSProperties = {
    pageBreakAfter: "always",
    minHeight: "29.6cm",
  };

  return (
    <div className="flex flex-col justify-between" style={style}>
      {/* HEADER */}
      <div className="flex justify-between items-center py-5 px-10 border-b-2">
        {leftHeaderElement}
        <img className="h-14 w-auto" src={logo} alt="Logo" />
      </div>

      {/* CONTENT */}
      <div className="page flex-1">{children}</div>

      {/* FOOTER */}
      <div className="flex border-t-2 justify-between items-center">
        <div className="py-5 px-10 border-r-2">
          <img className="h-12 w-auto" src={logo} alt="Logo" />
        </div>
        {title && <div className="flex-1 py-5 px-10 text-2xl">{title}</div>}
        <div className="py-5 px-10 text-2xl border-l-2">
          {t(IntlKeys.common.page)} - {nextPageNumber()}
        </div>
      </div>
    </div>
  );
};
