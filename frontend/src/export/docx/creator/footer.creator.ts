import { Footer, PageNumber, Paragraph, TextRun } from "docx";

export const createFooter = () => {
  return {
    default: new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({ font: "Arial", children: ["Umgebungsanalyse"] }),
            new TextRun("\t\t\t\t\t\t\t\t\t"),
            new TextRun({
              font: "Arial",
              children: ["Seite ", PageNumber.CURRENT]
            })
          ]
        })
      ]
    })
  };
};
