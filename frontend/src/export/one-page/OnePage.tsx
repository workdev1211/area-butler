import { forwardRef } from "react";

import areaButlerLogo from "../../assets/img/logo.svg";
import PdfOnePage from "./PdfOnePage";
import OnePageLogoAddress from "./components/pdf/OnePageLogoAddress";
import OnePagePoiList from "./components/pdf/OnePagePoiList";
import OnePageMapQrCode from "./components/pdf/OnePageMapQrCode";
import { IOnePageDownProps } from "../../shared/one-page.types";

export const OnePage = forwardRef<unknown, IOnePageDownProps>(
  (
    {
      addressDescription,
      entityGroups,
      listingAddress,
      realEstateListing,
      color,
      logo,
      legend,
      mapClippings,
      qrCodeImage,
      snapshotConfig,
      isTrial,
    },
    ref
  ) => {
    // Test string
    // addressDescription =
    //   "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu,";

    return (
      <div
        className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block"
        ref={ref as any}
      >
        {isTrial && (
          <img
            className="fixed w-0 h-0 print:w-full print:h-full top-1/2 left-1/2 opacity-40"
            src={areaButlerLogo}
            alt="watermark"
            style={{
              height: "30vh",
              transform: "translate(-50%, -50%) rotate(45deg)",
              zIndex: 100,
            }}
          />
        )}

        <PdfOnePage>
          <div className="flex flex-col gap-5">
            <OnePageLogoAddress
              logo={logo}
              snapshotConfig={snapshotConfig}
              realEstateListing={realEstateListing}
              listingAddress={listingAddress}
            />

            {/* Description */}
            {addressDescription && (
              <div className="flex flex-col gap-1.5">
                <div className="text-2xl font-bold">Lagebeschreibung</div>
                <div className="text-justify">{addressDescription}</div>
              </div>
            )}

            <OnePagePoiList filteredGroups={entityGroups} />

            {mapClippings.length > 0 && (
              <OnePageMapQrCode
                mapClippings={mapClippings}
                qrCodeImage={qrCodeImage}
                color={color}
              />
            )}
          </div>
        </PdfOnePage>
      </div>
    );
  }
);

export default OnePage;
