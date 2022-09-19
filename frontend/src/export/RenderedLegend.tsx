import { renderToStaticMarkup } from "react-dom/server";
import { toPng } from "html-to-image";

import { base64PrefixRegex } from "../shared/shared.constants";
import { ILegendItem } from "./Legend";

export interface IRenderedLegendItem {
  title: string;
  icon: string;
}

export const getRenderedLegend = async (
  legend: ILegendItem[]
): Promise<IRenderedLegendItem[]> =>
  Promise.all(
    legend.map(async ({ title, icon: { icon, color, isCustom } }) => {
      // Appropriate icon element styles must match the "Legend.scss" file
      // Inline styles are not applied
      const renderedIcon = renderToStaticMarkup(
        isCustom ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
            }}
          >
            <img src={icon} alt="group-icon" />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: color,
            }}
          >
            <img
              style={{ filter: "brightness(0) invert(1)" }}
              src={icon}
              alt="group-icon"
            />
          </div>
        )
      );

      const iconElement = document.createElement("div");
      iconElement.innerHTML = renderedIcon;

      const pngIcon = await toPng(iconElement, {
        quality: 1,
        pixelRatio: 2,
        width: 36,
        height: 36,
      });

      iconElement.remove();

      return { title, icon: pngIcon.replace(base64PrefixRegex, "") };
    })
  );
