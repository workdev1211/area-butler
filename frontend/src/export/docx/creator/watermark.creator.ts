import {
  HorizontalPositionAlign,
  ImageRun,
  Paragraph,
  VerticalPositionAlign,
} from "docx";

import areaButlerLogo from "../../../assets/img/logo-opacity-40.png";

export const createWatermark = async (isTrial: boolean): Promise<Paragraph> => {
  if (!isTrial) {
    return new Paragraph({ children: [] });
  }

  const areaButlerLogoBase64 = btoa(
    String.fromCharCode(
      // TODO check the compiler settings
      // @ts-ignore
      ...new Uint8Array(await (await fetch(areaButlerLogo)).arrayBuffer())
    )
  );

  return new Paragraph({
    children: [
      new ImageRun({
        data: Uint8Array.from(atob(areaButlerLogoBase64), (c) =>
          c.charCodeAt(0)
        ),
        transformation: {
          width: 925 / 1.25,
          height: 251 / 1.25,
          rotation: 45,
        },
        floating: {
          horizontalPosition: {
            align: HorizontalPositionAlign.CENTER,
          },
          verticalPosition: {
            align: VerticalPositionAlign.CENTER,
          },
          // behindDocument: true,
        },
      }),
    ],
  });
};
