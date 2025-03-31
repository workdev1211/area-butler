import { Footer, PageNumber, Paragraph, TextRun } from "docx";

export const createFooter = () => {
  return {
    default: new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({ font: "Arial", children: ["Environmental analysis"] }),
            new TextRun("\t\t\t\t\t\t\t\t\t"),
            new TextRun({
              font: "Arial",
              children: ["Page ", PageNumber.CURRENT]
            })
          ]
        })
      ]
    })
  };
};
