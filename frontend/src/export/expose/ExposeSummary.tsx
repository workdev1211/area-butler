import { FunctionComponent } from "react";

import EntityGridSummary from "export/EntityGridSummary";
import { deriveColorPalette } from "shared/shared.functions";
import {
  meansOfTransportations,
  unitsOfTransportation,
} from "../../../../shared/constants/constants";
import {
  // allFurnishing,
  allRealEstateCostTypes,
} from "../../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
  MeansOfTransportation,
  TransportationParam,
} from "../../../../shared/types/types";
import "./ExposeSummary.scss";
import { EntityGroup } from "../../shared/search-result.types";
import { getRealEstateCost } from "../../shared/real-estate.functions";
import { QrCode } from "../QrCode";
import { IQrCodeState } from "../../../../shared/types/export";

export interface ExposeSummaryProps {
  groupedEntries: EntityGroup[];
  transportationParams: TransportationParam[];
  activeMeans: MeansOfTransportation[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
  primaryColor: string;
  qrCode: IQrCodeState;
  isFirstPage: boolean;
}

const ExposeSummary: FunctionComponent<ExposeSummaryProps> = ({
  realEstateListing,
  listingAddress,
  groupedEntries,
  transportationParams,
  activeMeans,
  primaryColor,
  qrCode,
  isFirstPage,
}) => {
  const colorPalette = deriveColorPalette(primaryColor);

  const mobilityTypeStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColor}, ${colorPalette.primaryColorDark} 40%)`,
    color: colorPalette.textColor,
  };

  return (
    <>
      {isFirstPage && (
        <div
          className={`px-10 pt-10 ${qrCode.isShownQrCode ? "pb-5" : "pb-10"}`}
        >
          <div
            className={`flex gap-6 ${!qrCode.isShownQrCode && "items-center"}`}
          >
            {/* Column 1 */}
            <div className="flex flex-col gap-5">
              <div className="text-2xl font-bold">{listingAddress}</div>
              <div>
                <h3 className="text-xl w-96 font-bold text-black">
                  Ihre Mobilitätskriterien
                </h3>
                <div className="flex gap-2">
                  {transportationParams.map(
                    (routingProfile: TransportationParam) => (
                      <div
                        className="mobility-type"
                        style={mobilityTypeStyle}
                        key={routingProfile.type}
                      >
                        <span>
                          {
                            meansOfTransportations.find(
                              (means) => means.type === routingProfile.type
                            )?.label
                          }{" "}
                          ({routingProfile.amount}{" "}
                          {
                            unitsOfTransportation.find(
                              (unit) => unit.type === routingProfile.unit
                            )?.label
                          }
                          )
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2">
              {realEstateListing && (
                <>
                  <h3 className="text-xl w-96 font-bold text-black">
                    Ihre neue Immobilie
                  </h3>
                  <div className="font-bold">{realEstateListing.address}</div>

                  {realEstateListing?.costStructure && (
                    <div className="text-justify">
                      <strong>Kosten:</strong>{" "}
                      {getRealEstateCost(realEstateListing?.costStructure)} (
                      {
                        allRealEstateCostTypes.find(
                          (t) =>
                            t.type === realEstateListing.costStructure?.type
                        )?.label
                      }
                      )
                    </div>
                  )}

                  {/* Furnishing */}
                  {/*{realEstateListing.characteristics?.furnishing && (*/}
                  {/*  <div className="text-justify">*/}
                  {/*    <strong>Ausstattung:</strong>{" "}*/}
                  {/*    {allFurnishing*/}
                  {/*      .filter((f) =>*/}
                  {/*        realEstateListing.characteristics?.furnishing.includes(*/}
                  {/*          f.type*/}
                  {/*        )*/}
                  {/*      )*/}
                  {/*      .map((f) => f.label)*/}
                  {/*      .join(", ")}*/}
                  {/*  </div>*/}
                  {/*)}*/}
                </>
              )}

              {qrCode.isShownQrCode && (
                <QrCode
                  snapshotToken={qrCode.snapshotToken}
                  containerClasses={realEstateListing ? "mt-3" : ""}
                  imageClasses="h-28"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className={!isFirstPage ? "pt-5" : ""}>
        <h3 className="text-xl w-96 font-bold mx-10 text-black">
          Die Umgebung
        </h3>
        <EntityGridSummary
          groupedEntries={groupedEntries}
          activeMeans={activeMeans}
          transportationParams={transportationParams}
          primaryColor={primaryColor}
        />
      </div>
    </>
  );
};

export default ExposeSummary;
