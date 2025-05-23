import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { getRealEstateCost } from "../../../../shared/real-estate.functions";
import { allRealEstateCostTypes } from "../../../../../../shared/constants/real-estate";
import { ApiRealEstateListing } from "../../../../../../shared/types/real-estate";
import { ApiSearchResultSnapshotConfig } from "../../../../../../shared/types/types";

interface IOnePageLogoAddressProps {
  logo: string;
  snapshotConfig: ApiSearchResultSnapshotConfig;
  realEstateListing: ApiRealEstateListing;
  listingAddress: string;
}

const OnePageLogoAddress: FunctionComponent<IOnePageLogoAddressProps> = ({
  logo,
  snapshotConfig,
  realEstateListing,
  listingAddress,
}) => {
  const { t } = useTranslation("", { lng: snapshotConfig.language });
  return (
    <div className="flex flex-col gap-1.5">
      <img className="self-start h-14" src={logo} alt="Logo" />
      <div>
        {snapshotConfig.showAddress && !realEstateListing && (
          <div className="text-2xl font-bold">{listingAddress}</div>
        )}

        {realEstateListing && (
          <>
            {snapshotConfig.showAddress && (
              <div className="font-bold">{realEstateListing.address}</div>
            )}

            {snapshotConfig?.isDetailsShown &&
              realEstateListing?.costStructure && (
                <div>
                  <strong>{t(IntlKeys.snapshotEditor.dataTab.costs)}:</strong>{" "}
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

export default OnePageLogoAddress;
