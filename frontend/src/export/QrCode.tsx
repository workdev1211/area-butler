import { FunctionComponent, useEffect, useState } from "react";
import { toDataURL } from "qrcode";

import { useTools } from "../hooks/tools";

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
  const { createDirectLink } = useTools();

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
      <div className="flex flex-col">
        <div>Scannen und neue</div>
        <div>Wohnlage entdecken</div>
      </div>
    </div>
  );
};
