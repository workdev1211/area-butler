import {Header, Paragraph, AlignmentType, ImageRun} from 'docx';

export const createHeader = (imageData: string) => {
    return {default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new ImageRun({
                data: Uint8Array.from(atob(imageData), (c) =>
                  c.charCodeAt(0)
                ),
                transformation: {
                  width: 200,
                  height: 50,
                },
              }),
            ],
          }),
        ],
      })}
}