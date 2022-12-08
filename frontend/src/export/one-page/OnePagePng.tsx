import { FunctionComponent } from "react";

import { allRealEstateCostTypes } from "../../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { ApiUser } from "../../../../shared/types/types";
import areaButlerLogo from "../../assets/img/logo.svg";
import { EntityGroup } from "../../components/SearchResultContainer";
import { getRealEstateCost } from "../../shared/real-estate.functions";
import { ILegendItem } from "../Legend";
import { ApiSubscriptionPlanType } from "../../../../shared/types/subscription-plan";
import { IPoiIcon } from "../../shared/shared.types";
import { distanceToHumanReadable } from "../../shared/shared.functions";
import { ISelectableMapClipping } from "../MapClippingSelection";
import downArrowIcon from "../../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import OnePageLegendIcon from "./OnePageLegendIcon";

interface IOnePageProps {
  addressDescription: string;
  filteredGroups: Array<EntityGroup & { icon?: IPoiIcon }>;
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  user: ApiUser | null;
  color?: string;
  legend: ILegendItem[];
  mapClippings: ISelectableMapClipping[];
  qrCodeImage?: string;
  isTransparentBackground: boolean;
}

export const OnePagePng: FunctionComponent<IOnePageProps> = (
  props: IOnePageProps
) => {
  const user = props.user;
  const color = props.color || user?.color || "#aa0c54";
  const logo = user?.logo || areaButlerLogo;

  return (
    <>
      <div
        style={{
          overflow: "visible",
          width: "100%",
          height: "100%",
          display: "block",
          // minWidth: "21cm",
          minWidth: "827px",
          maxWidth: "827px",
          // minHeight: "29.6cm",
          minHeight: "1169px",
          maxHeight: "1169px",
          padding: "2.5rem",
          fontFamily: "archia",
          backgroundColor: props.isTransparentBackground
            ? "transparent"
            : "white",
        }}
      >
        {/* TODO move to a separate component */}
        {user?.subscription?.type === ApiSubscriptionPlanType.TRIAL && (
          <img
            src={areaButlerLogo}
            alt="watermark"
            style={{
              width: "100%",
              height: "100%",
              transform: "translate(-50%, -50%) rotate(45deg)",
              zIndex: 100,
              position: "fixed",
              top: "50%",
              left: "50%",
              opacity: "0.4",
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
          }}
        >
          {/* Logo and address */}
          {/* TODO move to a separate component? */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <img
              style={{ height: "3.5rem", alignSelf: "flex-start" }}
              src={logo}
              alt="Logo"
            />
            <div>
              {!props.realEstateListing && (
                <div
                  style={{
                    fontSize: "1.5rem",
                    lineHeight: "2rem",
                    fontWeight: 700,
                  }}
                >
                  {props.listingAddress}
                </div>
              )}

              {props.realEstateListing && (
                <>
                  <div style={{ fontWeight: 700 }}>
                    {props.realEstateListing.address}
                  </div>
                  {props.realEstateListing?.costStructure && (
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  lineHeight: "2rem",
                  fontWeight: 700,
                }}
              >
                Lagebeschreibung
              </div>
              <div style={{ textAlign: "justify", maxWidth: "747px" }}>
                {props.addressDescription}
              </div>
            </div>
          )}

          {/* POIs */}
          {/* TODO move to a separate component */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                lineHeight: "2rem",
                fontWeight: 700,
              }}
            >
              Überblick
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
              {props.filteredGroups.map((group) => {
                return (
                  <div
                    key={`one-page-group-${group.title}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flexWrap: "wrap",
                      flex: "0 0 21vw",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {group.icon && <OnePageLegendIcon icon={group.icon} />}
                      <div
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          fontWeight: 700,
                        }}
                      >
                        {group.title}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: "12px",
                        gap: "0.25rem",
                      }}
                    >
                      {group.items.map((item, i) => {
                        return (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              lineHeight: "1rem",
                            }}
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
          {props.mapClippings.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  lineHeight: "2rem",
                  fontWeight: 700,
                }}
              >
                Interaktive Karte
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: "747px",
                  height: "auto",
                  position: "relative",
                  // marginTop: "1.25rem",
                }}
              >
                {/* Main image */}
                <img
                  style={{
                    objectFit: "cover",
                    height: "100%",
                    width: "100%",
                    alignSelf: "center",
                  }}
                  src={props.mapClippings[0].mapClippingDataUrl}
                  alt="map-clipping-1"
                />
                {/* Inner image */}
                {props.mapClippings[1] && (
                  <img
                    style={{
                      position: "absolute",
                      objectFit: "cover",
                      width: "35%",
                      height: "auto",
                      bottom: "3px",
                      left: "3px",
                      boxShadow: "0 0 5px #201c1e",
                    }}
                    src={props.mapClippings[1].mapClippingDataUrl}
                    alt="map-clipping-2"
                  />
                )}
                {/* QR code and the text */}
                {props.qrCodeImage && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        position: "absolute",
                        padding: "0.125rem",
                        borderRadius: "0.375rem",
                        bottom: "1.5%",
                        right: "16%",
                        background: color,
                        boxShadow: "0 0 5px #201c1e",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: "fit-content",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            color: "rgb(255 255 255)",
                            fontSize: "0.75rem",
                            lineHeight: "1rem",
                          }}
                        >
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
                      style={{
                        position: "absolute",
                        objectFit: "cover",
                        width: "15%",
                        height: "auto",
                        bottom: "3px",
                        right: "3px",
                        boxShadow: "0 0 5px #201c1e",
                      }}
                      src={props.qrCodeImage}
                      alt="qr-code"
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OnePagePng;
