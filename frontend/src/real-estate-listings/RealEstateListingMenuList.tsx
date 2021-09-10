import { useHttp } from "hooks/http";
import { useEffect, useState } from "react";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface RealEstateMenuListData {
    fillAdressFromListing: (listing: ApiRealEstateListing) => void;
}

export const RealEstateMenuList: React.FunctionComponent<RealEstateMenuListData> = ({fillAdressFromListing}) => {
  const { get } = useHttp();

  const [realEstateListings, setRealEstateListings] = useState<
    ApiRealEstateListing[]
  >([]);

  useEffect(() => {
    const fetchListings = async () => {
      setRealEstateListings(
        (await get<ApiRealEstateListing[]>("/api/real-estate-listings")).data
      );
    };
    fetchListings();
  }, [true]);

  return (
    <div className="dropdown">
      <div tabIndex={0} className="m-1 btn btn-sm">
        Meine Objekte
      </div>
      <ul
        tabIndex={0}
        className="p-2 shadow menu dropdown-content bg-base-100 rounded-box"
      >
        {realEstateListings.map((realEstateListing) => (
          <li>
            <a onClick={() => fillAdressFromListing(realEstateListing)}>{realEstateListing.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RealEstateMenuList;
