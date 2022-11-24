import { FunctionComponent } from "react";

export const PdfOnePage: FunctionComponent = ({ children }) => {
  return (
    // IMPORTANT NOTE: don't use vertical margin, use vertical padding instead
    <div className="flex flex-col p-10 gap-10" style={{ minHeight: "29.6cm" }}>
      {children}
    </div>
  );
};

export default PdfOnePage;
