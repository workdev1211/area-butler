import { fallbackIcon, osmNameToIcons } from "map/makiIcons";
import React from "react";
import ResultTable from "search/ResultTable";
import { meansOfTransportations, unitsOfTransportation } from "../../../shared/constants/constants";
import { TransportationParam } from "../../../shared/types/types";
import { ExposeDownloadButtonProps } from "./ExposeDownloadButton";
import { PdfPage } from "./PdfPage";

export const Expose = React.forwardRef(
  (props: ExposeDownloadButtonProps, ref) => {
    const groupedEntries = props.groupedEntries.filter(
      ([label, data]: any) => label !== "Wichtige Adressen"
    );
    const transportationParams = props.transportationParams;

    return (
      <div className="hidden print:block" ref={ref as any}>
        <PdfPage>
          <div className="flex justify-center items-center flex-col mt-36">
            <div className="bg-primary w-96 h-24"></div>
            <h1 className="mx-10 mt-10 text-3xl text-primary font-bold">
              IHRE PERSÖNLICHE UMGEBUNGSANALYSE
            </h1>
            <h5>powered by Area-Butler</h5>
          </div>
          <div>
            <h1 className="m-10 text-xl font-bold">Hallo!</h1>
            <p className="mx-10 my-5">
              Wir freuen uns sehr, Ihnen Ihre persönliche Umgebungsanalyse
              präsentieren zu dürfen. Auf Basis Ihrer Bedürfnisse konnten wir
              ein passendes Objekt in unserem Bestand auswählen, das perfekt auf
              Ihre Kriterien abgestimmt ist.
            </p>
            <p className="mx-10 my-5">
              Machen Sie sich auf den nächsten Seite ein eigenes Bild
            </p>
            <div className="flex flex-col gap-6 m-10">
              <h3 className="text-xl w-56 font-bold">Unser Objekt</h3>
              <div className="font-bold">{props.listingAddress}</div>
            </div>

            <div className="flex gap-6 justify-between m-10">
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-bold">Ihre Bevorzugten Orte</h3>
                <div className="flex flex-wrap gap-2">
                  {groupedEntries.map(([label, data]: any) => (
                    <div className="w-48 bg-primary rounded p-2 text-white flex gap-2">
                      <img
                        alt="icon"
                        src={
                          osmNameToIcons.find(
                            (entry) => entry.name === data[0].type
                          )?.icon || fallbackIcon
                        }
                        className={data[0].type}
                      />
                      <h5 className="text-xs">{label}</h5>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <h3 className="text-xl w-56 font-bold">
                  Ihre Mobilitätskriterien
                </h3>
                <div className="flex flex-wrap gap-2">
                {transportationParams.map((routingProfile: TransportationParam) => (
                    <div className="w-48 bg-secondary rounded p-2 text-white text-xs flex gap-2">
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PdfPage>

        {groupedEntries.map(([label, data]: any, index: number) => {
          return (
            <PdfPage>
              <div className="m-10" key={"tab-content-" + label}>
                <ResultTable title={label} data={data} />
              </div>
            </PdfPage>
          );
        })}
      </div>
    );
  }
);

export default Expose;
