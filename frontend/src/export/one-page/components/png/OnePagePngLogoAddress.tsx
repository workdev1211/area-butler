import { FunctionComponent } from "react";

import { getRealEstateCost } from "../../../../shared/real-estate.functions";
import { allRealEstateCostTypes } from "../../../../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../../../../shared/types/real-estate";
import { ApiSearchResultSnapshotConfig } from "../../../../../../shared/types/types";

interface IOnePagePngLogoAddressProps {
  logo: string;
  snapshotConfig: ApiSearchResultSnapshotConfig;
  realEstateListing: ApiRealEstateListing;
  listingAddress: string;
}

const OnePagePngLogoAddress: FunctionComponent<IOnePagePngLogoAddressProps> = ({
  logo,
  snapshotConfig,
  realEstateListing,
  listingAddress,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      }}
    >
      <img
        style={{ height: "3.5rem", alignSelf: "flex-start" }}
        src={logo}
        alt="Logo"
      />

      <div>
        {snapshotConfig.showAddress && !realEstateListing && (
          <div
            style={{
              fontSize: "1.5rem",
              lineHeight: "2rem",
              fontWeight: 700,
            }}
          >
            {listingAddress}
          </div>
        )}

        {realEstateListing && (
          <>
            {snapshotConfig.showAddress && (
              <div style={{ fontWeight: 700 }}>{realEstateListing.address}</div>
            )}
            {snapshotConfig?.showDetailsInOnePage &&
              realEstateListing?.costStructure && (
                <div>
                  <strong>Kosten:</strong>{" "}
                  {getRealEstateCost(realEstateListing?.costStructure)} (
                  {
                    allRealEstateCostTypes.find(
                      (t) => t.type === realEstateListing.costStructure?.type
                    )?.label
                  }
                  )
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default OnePagePngLogoAddress;
