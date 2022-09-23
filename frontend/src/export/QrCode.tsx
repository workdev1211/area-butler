import { FunctionComponent, useEffect, useState } from "react";

import { toDataURL } from "qrcode";
import { createDirectLink } from "../shared/shared.functions";

export interface QrCodeProps {
  snapshotToken?: string;
  containerClasses?: string;
  imageClasses?: string;
}

export const getQrCodeBase64 = async (text: string): Promise<string> =>
  toDataURL(text, {
    type: "image/png",
    margin: 0,
  });

export const QrCode: FunctionComponent<QrCodeProps> = ({
  snapshotToken,
  containerClasses = "",
  imageClasses = "h-20",
}) => {
  const [qrCode, setQrCode] = useState<string>();

  useEffect(() => {
    if (!snapshotToken) {
      return;
    }

    const createQrCode = async () => {
      setQrCode(await getQrCodeBase64(createDirectLink(snapshotToken)));
    };

    void createQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!snapshotToken) {
    return null;
  }

  return (
    <div className={`flex flex-row items-center gap-2 ${containerClasses}`}>
      <img className={`${imageClasses} w-auto`} src={qrCode} alt="qr-code" />
      <div className="text-2xl">Scannen für interaktive Karte</div>
    </div>
  );
};
