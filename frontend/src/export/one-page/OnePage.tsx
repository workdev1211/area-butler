import { forwardRef, useEffect, useState } from "react";

import { allRealEstateCostTypes } from "../../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { ApiSearchResultSnapshotConfig } from "../../../../shared/types/types";
import areaButlerLogo from "../../assets/img/logo.svg";
import { getRealEstateCost } from "../../shared/real-estate.functions";
import { ILegendItem } from "../Legend";
import { getQrCodeBase64 } from "../QrCode";
import { IQrCodeState } from "../ExportModal";
import PdfOnePage from "./PdfOnePage";
import {
  createDirectLink,
  distanceToHumanReadable,
  preferredLocationsTitle,
} from "../../shared/shared.functions";
import { ISelectableMapClipping } from "../MapClippingSelection";
import downArrowIcon from "../../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import OnePageLegendIcon from "./OnePageLegendIcon";
import { ISortableEntityGroup } from "./OnePageExportModal";

interface IOnePageProps {
  addressDescription: string;
  entityGroups: ISortableEntityGroup[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  color: string;
  logo: string;
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  qrCode: IQrCodeState;
  snapshotConfig: ApiSearchResultSnapshotConfig;
  isTrial: boolean;
}

export const OnePage = forwardRef((props: IOnePageProps, ref) => {
  const [qrCodeImage, setQrCodeImage] = useState<string>();
  const [selectedMapClippings, setSelectedMapClippings] = useState<
    ISelectableMapClipping[]
  >([]);

  useEffect(() => {
    if (!props.qrCode.isShownQrCode || !props.qrCode.snapshotToken) {
      setQrCodeImage(undefined);
      return;
    }

    const createQrCode = async () => {
      setQrCodeImage(
        await getQrCodeBase64(createDirectLink(props.qrCode.snapshotToken!))
      );
    };

    void createQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.qrCode.isShownQrCode]);

  useEffect(() => {
    if (!props.mapClippings.length) {
      setSelectedMapClippings([]);
      return;
    }

    const selected = props.mapClippings.reduce<ISelectableMapClipping[]>(
      (result, mapClipping) => {
        if (mapClipping.selected) {
          result.push(mapClipping);
        }

        return result;
      },
      []
    );

    setSelectedMapClippings(selected);
  }, [props.mapClippings]);

  const filteredGroups = props.entityGroups.reduce<ISortableEntityGroup[]>(
    (result, group) => {
      if (
        group.title !== preferredLocationsTitle &&
        group.active &&
        group.items.length > 0
      ) {
        const groupIcon = props.legend.find(
          ({ title }) => title === group.title
        )?.icon;

        const items = [...group.items].slice(0, 3);

        result.push({ ...group, items, icon: groupIcon });
      }

      return result;
    },
    []
  );

  return (
    <div
      className="overflow-hidden w-0 h-0 print:overflow-visible print:w-full print:h-full print:block"
      ref={ref as any}
    >
      {/* TODO move to a separate component */}
      {props.isTrial && (
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
        {/* Logo and address */}
        {/* TODO move to a separate component? */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <img className="self-start h-14" src={props.logo} alt="Logo" />
            <div>
              {props.snapshotConfig.showAddress && !props.realEstateListing && (
                <div className="text-2xl font-bold">{props.listingAddress}</div>
              )}

              {props.realEstateListing && (
                <>
                  {props.snapshotConfig.showAddress && (
                    <div className="font-bold">
                      {props.realEstateListing.address}
                    </div>
                  )}

                  {props.snapshotConfig?.showDetailsInOnePage &&
                    props.realEstateListing?.costStructure && (
                      <div>
                        <strong>Kosten:</strong>{" "}
                        {getRealEstateCost(
                          props.realEstateListing?.costStructure
                        )}{" "}
                        (
                        {
                          allRealEstateCostTypes.find(
                            (t) =>
                              t.type ===
                              props.realEstateListing.costStructure?.type
                          )?.label
                        }
                        )
                      </div>
                    )}
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {props.addressDescription && (
            <div className="flex flex-col gap-1.5">
              <div className="text-2xl font-bold">Lagebeschreibung</div>
              <div className="text-justify">{props.addressDescription}</div>
            </div>
          )}

          {/* POIs */}
          {/* TODO move to a separate component */}
          <div className="flex flex-col gap-1.5">
            <div className="text-2xl font-bold">Überblick</div>
            <div className="flex gap-3 flex-wrap">
              {filteredGroups.map((group) => {
                return (
                  <div
                    className="flex flex-col gap-1 flex-wrap"
                    key={`one-page-group-${group.title}`}
                    style={{ flex: "0 0 21vw" }}
                  >
                    <div className="flex items-center gap-1.5">
                      {group.icon && <OnePageLegendIcon icon={group.icon} />}
                      <div className="text-base font-bold">{group.title}</div>
                    </div>
                    <div
                      className="flex flex-col gap-1"
                      style={{ marginLeft: "12px" }}
                    >
                      {group.items.map((item, i) => {
                        return (
                          <div
                            className="text-xs"
                            key={`one-page-group-item-${i}-${
                              item.name || group.title
                            }`}
                          >
                            {`${i + 1}. ${
                              item.name || group.title
                            } (${distanceToHumanReadable(
                              item.distanceInMeters
                            )})`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map and QR code */}
          {/* TODO move to a separate component */}
          {selectedMapClippings.length > 0 && (
            <div className="flex flex-col">
              <div className="text-2xl font-bold">Interaktive Karte</div>
              <div
                className="relative mt-5"
                style={{ width: "auto", height: "400px" }}
              >
                {/* Main image */}
                <img
                  style={{
                    objectFit: "cover",
                    height: "100%",
                    width: "100%",
                  }}
                  src={selectedMapClippings[0].mapClippingDataUrl}
                  alt="map-clipping-1"
                />
                {/* Inner image */}
                {selectedMapClippings[1] && (
                  <img
                    className="absolute"
                    style={{
                      objectFit: "cover",
                      width: "35%",
                      height: "auto",
                      bottom: "3px",
                      left: "3px",
                      boxShadow: "0 0 5px var(--base-anthracite)",
                    }}
                    src={selectedMapClippings[1].mapClippingDataUrl}
                    alt="map-clipping-2"
                  />
                )}
                {/* QR code and the text */}
                {qrCodeImage && (
                  <>
                    <div
                      className="flex items-center gap-1 absolute p-0.5 rounded-md"
                      style={{
                        bottom: "1.5%",
                        right: "16%",
                        background: props.color,
                        boxShadow: "0 0 5px var(--base-anthracite)",
                      }}
                    >
                      <div className="flex w-fit items-center">
                        <div className="text-white text-xs px-0.5">
                          Scannen und neue Wohnlage entdecken
                        </div>
                        <img
                          src={downArrowIcon}
                          alt="right-arrow"
                          style={{ transform: "rotate(-90deg)" }}
                        />
                      </div>
                    </div>
                    <img
                      className="absolute"
                      style={{
                        objectFit: "cover",
                        width: "15%",
                        height: "auto",
                        bottom: "3px",
                        right: "3px",
                        boxShadow: "0 0 5px var(--base-anthracite)",
                      }}
                      src={qrCodeImage}
                      alt="qr-code"
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </PdfOnePage>
    </div>
  );
});

export default OnePage;
