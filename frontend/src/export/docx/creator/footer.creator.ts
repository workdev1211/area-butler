import { Paragraph, TextRun, PageNumber, Footer, AlignmentType } from "docx";

export const createFooter = () => {
  return {
    default: new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.DISTRIBUTE,   
          children: [
            new TextRun("Umgebungsanalyse"),
            new TextRun("\t"),
            new TextRun({
              children: ["Seite ", PageNumber.CURRENT],
            }),
          ],
        }),
      ],
    }),
  };
};
