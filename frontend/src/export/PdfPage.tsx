import React, { CSSProperties } from "react";
import AreaButlerLogo from "../assets/img/logo.jpg";

export interface PdfPageProps {
    nextPageNumber?: () => string;
    logo?: any;
    title?: string
}

export const PdfPage: React.FunctionComponent<PdfPageProps> = ({ nextPageNumber = () => "01", title = 'Umgebungsanalyse', children, logo = AreaButlerLogo }) => {
  const style = {
    pageBreakAfter: "always",
    minHeight: "29.6cm",
  } as CSSProperties;

  const pageNumber = nextPageNumber();

  return (
    <div className="flex flex-col justify-between" style={style}>
      <div className="flex justify-end py-6 px-8 border-b-2">
        <img className="h-14 w-auto" src={logo} alt="Logo" />
      </div>
      <div className="page flex-1" >
        {children}
      </div>
      <div className="flex border-t-2 justify-between items-center">
        <div className="py-5 px-10 border-r-2">
            <img className="h-12 w-auto" src={logo} alt="Logo" />
        </div>
        <div className="flex-1 py-5 px-10 text-2xl">
            {title}
        </div>
        <div className="py-5 px-10 text-2xl border-l-2">
            Seite - {pageNumber}
        </div>
      </div>
    </div>
  );
};
