import { Paragraph, ImageRun } from "docx";

export const createImage = (imageData: string) => {
  return new Paragraph({
    children: [
      new ImageRun({
        data: Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0)),
        transformation: {
          width: 9000,
          height: 5000,
        },
      }),
    ],
  });
};
