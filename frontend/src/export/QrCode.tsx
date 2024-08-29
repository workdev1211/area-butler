import { FC, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { QRCodeToDataURLOptions, toDataURL } from "qrcode";

import { useTools } from "../hooks/tools";
import { LanguageTypeEnum } from "../../../shared/types/types";
import { checkIsDarkColor } from '../shared/shared.functions';

interface IQrCodeProps {
  containerClasses?: string;
  imageClasses?: string;
  outputLanguage?: LanguageTypeEnum;
}

export const getQrCodeBase64 = async (
  text: string,
  color?: string
): Promise<string> => {
  const options: QRCodeToDataURLOptions = {
    type: "image/png",
    margin: 0,
  };

  if (color) {
    const isDark = checkIsDarkColor(color)
    options.color = { dark: color, light: isDark ? '#fff': '#000' };
  }

  return toDataURL(text, options);
};

export const QrCode: FC<IQrCodeProps> = ({
  containerClasses = "",
  imageClasses = "h-20",
  outputLanguage,
}) => {
  const { t } = useTranslation("", { lng: outputLanguage });
  const { createDirectLink } = useTools();
  const [qrCodeImage, setQrCodeImage] = useState<string>();

  useEffect(() => {
    const createQrCode = async (): Promise<void> => {
      setQrCodeImage(await getQrCodeBase64(createDirectLink()));
    };

    void createQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!qrCodeImage) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${containerClasses}`}>
      <img
        className={`w-auto ${imageClasses}`}
        src={qrCodeImage}
        alt="qr-code"
      />

      <div className="flex flex-col">
        <div>{t(IntlKeys.snapshotEditor.dataTab.scanAndNew)}</div>
        <div>{t(IntlKeys.snapshotEditor.dataTab.discoverResidentialArea)}</div>
      </div>
    </div>
  );
};
