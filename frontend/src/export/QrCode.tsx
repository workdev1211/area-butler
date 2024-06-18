import { FunctionComponent, useEffect, useState } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { QRCodeToDataURLOptions, toDataURL } from "qrcode";

import { useTools } from "../hooks/tools";

interface IQrCodeProps {
  snapshotToken?: string;
  containerClasses?: string;
  imageClasses?: string;
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
    options.color = { dark: color };
  }

  return toDataURL(text, options);
};

export const QrCode: FunctionComponent<IQrCodeProps> = ({
  snapshotToken,
  containerClasses = "",
  imageClasses = "h-20",
}) => {
  const { t } = useTranslation();
  const { createDirectLink } = useTools();
  const [qrCodeImage, setQrCodeImage] = useState<string>();

  useEffect(() => {
    if (!snapshotToken) {
      return;
    }

    const createQrCode = async (): Promise<void> => {
      setQrCodeImage(await getQrCodeBase64(createDirectLink(snapshotToken)));
    };

    void createQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!snapshotToken || !qrCodeImage) {
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
        <div>{t(IntlKeys.snapshotEditor.exportTab.scanAndNew)}</div>
        <div>{t(IntlKeys.snapshotEditor.exportTab.discoverResidentialArea)}</div>
      </div>
    </div>
  );
};
