import { Paragraph, ImageRun } from "docx";

export const createImage = (imageData: string) => {
  return new Paragraph({
    spacing: {
      before: 100,
      after: 100
    },
    children: [
      new ImageRun({
        data: Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0)),
        transformation: {
          width: 600,
          height: 390,
        },
      }),
    ],
  });
};
