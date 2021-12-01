import {
  Header, ImageRun, Paragraph, Table, TableCell, TableRow
} from "docx";

export const createHeader = (imageData: string | Blob ) => {
  return {
    default: new Header({
      children: [
        new Table({
          columnWidths: [8000, 1000],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("")],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: typeof imageData === 'string' ?  Uint8Array.from(atob(imageData), (c) =>
                            c.charCodeAt(0)
                          ) : imageData as any as Buffer,
                          transformation: {
                            width: 300,
                            height: 100,
                          },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  };
};
