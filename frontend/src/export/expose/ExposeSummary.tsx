import { EntityGroup } from "pages/SearchResultPage";
import {
    meansOfTransportations,
    unitsOfTransportation
} from "../../../../shared/constants/constants";
import {
    allFurnishing,
    allRealEstateCostTypes
} from "../../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import {
    TransportationParam
} from "../../../../shared/types/types";

export interface ExposeSummaryProps {
  filteredGroups: EntityGroup[];
  transportationParams: TransportationParam[];
  listingAddress: string;
  realEstateListing: ApiRealEstateListing;
}

const ExposeSummary: React.FunctionComponent<ExposeSummaryProps> = ({
  realEstateListing,
  listingAddress,
  filteredGroups,
  transportationParams,
}) => {
  return (
    <>
      <h1 className="mx-10 mt-10 text-3xl font-bold">Hallo !</h1>
      <div>
        <p className="mx-10 my-5">
          Wir freuen uns sehr, Ihnen Ihre persönliche Umgebungsanalyse
          präsentieren zu dürfen. Auf Basis Ihrer Bedürfnisse konnten wir ein
          passendes Objekt in unserem Bestand auswählen, das perfekt auf Ihre
          Kriterien abgestimmt ist.
        </p>
        <div className="flex flex-col gap-2 m-10">
          {!realEstateListing && (
            <>
              <h3 className="text-xl w-56 font-bold">Ihr Umfeld</h3>
              <div className="font-bold">{listingAddress}</div>
            </>
          )}
          {!!realEstateListing && (
            <>
              <h3 className="text-xl w-56 font-bold">Unser Objekt</h3>
              <div className="font-bold">{realEstateListing.address}</div>

              {!!realEstateListing?.costStructure?.type &&
                !!realEstateListing?.costStructure?.price && (
                  <div>
                    <strong>Kosten:</strong>{" "}
                    {realEstateListing.costStructure.price.amount} € (
                    {
                      allRealEstateCostTypes.find(
                        (t) => t.type === realEstateListing.costStructure?.type
                      )?.label
                    }
                    )
                  </div>
                )}
              {realEstateListing.characteristics?.furnishing && (
                <div>
                  <strong>Ausstattung:</strong>{" "}
                  {allFurnishing
                    .filter((f) =>
                      realEstateListing.characteristics?.furnishing.includes(
                        f.type
                      )
                    )
                    .map((f) => f.label)
                    .join(", ")}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-4 justify-between m-10">
          <div className="flex flex-col gap-6">
            <h3 className="text-l font-bold">Ihre Bevorzugten Orte</h3>
            <div className="flex flex-wrap gap-2">
              {filteredGroups.length === 0 ? (
                <div className="w-56 bg-primary rounded p-2 text-white flex gap-2">
                  <h5 className="text-xs">Keine Orte ausgewählt</h5>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div className="w-56 bg-primary rounded p-2 text-white flex gap-2">
                    <h5 className="text-xs">
                      {group.title} (
                      {Math.round(
                        Math.min(...group.items.map((d) => d.distanceInMeters))
                      )}{" "}
                      m)
                    </h5>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="text-l w-56 font-bold">Ihre Mobilitätskriterien</h3>
            <div className="flex flex-wrap gap-2">
              {transportationParams.map(
                (routingProfile: TransportationParam) => (
                  <div className="w-48 bg-info rounded p-2 text-white text-xs flex gap-2">
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
      </div>
    </>
  );
};

export default ExposeSummary;
