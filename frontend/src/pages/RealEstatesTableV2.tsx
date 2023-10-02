import { FunctionComponent, useContext, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  allFurnishing,
  allRealEstateCostTypes,
  allRealEstateStatuses,
} from "../../../shared/constants/real-estate";
import editIcon from "../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import searchIcon from "../assets/icons/icons-16-x-16-outline-ic-search.svg";
import locationIcon from "../assets/icons/icons-16-x-16-outline-ic-type.svg";
import FormModal from "../components/FormModal";
import { RealEstateContext } from "../context/RealEstateContext";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { RealEstateDeleteHandler } from "../real-estates/RealEstateDeleteHandler";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { getRealEstateCost } from "../shared/real-estate.functions";
import { ConfigContext } from "../context/ConfigContext";
import { IRealEstatesHistoryState } from "../shared/shared.types";

interface IRealEstatesTableV2Props {
  openSnapshotsModal: (realEstate: ApiRealEstateListing) => void;
}

const deleteRealEstateModalConfig = {
  modalTitle: "Objekt löschen",
  submitButtonTitle: "Löschen",
};

const RealEstatesTableV2: FunctionComponent<IRealEstatesTableV2Props> = ({
  openSnapshotsModal,
}) => {
  const {
    realEstateState: { listings },
  } = useContext(RealEstateContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { integrationType } = useContext(ConfigContext);

  const history = useHistory<IRealEstatesHistoryState>();
  const queryParams = new URLSearchParams(useLocation().search);
  const realEstateHighlightId = queryParams.get("id");

  const [sorting, setSorting] = useState<SortingState>([]);

  const isIntegration = !!integrationType;

  const startSearchFromRealEstate = async (
    realEstate: ApiRealEstateListing
  ): Promise<void> => {
    const result = await deriveGeocodeByAddress(realEstate.address);
    const { lat, lng } = result;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: realEstate.address, value: { place_id: "123" } },
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: realEstate,
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: {
        lat,
        lng,
      },
    });

    history.push("/search", { isFromRealEstates: true });
  };

  const columnHelper = createColumnHelper<ApiRealEstateListing>();

  const columns: ColumnDef<ApiRealEstateListing, any>[] = [
    columnHelper.accessor("status", {
      header: "typ",
      cell: (props) =>
        allRealEstateStatuses.find(
          (estate) => estate.status === props.getValue()
        )?.label,
    }),
    columnHelper.accessor("name", {
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("address", {
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("costStructure", {
      header: "kosten",
      cell: (props) => {
        const costStructure = props.row.original.costStructure;

        return costStructure
          ? `${getRealEstateCost(costStructure)} (${
              allRealEstateCostTypes.find(
                (t) => t.type === props.row.original.costStructure?.type
              )?.label
            })`
          : null;
      },
    }),
    columnHelper.display({
      id: "furnishing",
      header: "ausstattung",
      cell: (props) => {
        const furnishing = props.row.original.characteristics?.furnishing;

        return allFurnishing.reduce((result, { type, label }) => {
          if (furnishing?.includes(type)) {
            result += result.length ? `, ${label}` : label;
          }

          return result;
        }, "");
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: (props) => {
        const realEstate = props.row.original;
        const index = props.row.index;

        return (
          <div className="flex gap-4">
            <img
              src={searchIcon}
              alt="icon-search"
              className="cursor-pointer"
              onClick={() => {
                void startSearchFromRealEstate(realEstate);
              }}
              data-tour={`real-estates-table-item-search-button-${index}`}
            />
            {!realEstate.isFromParent ? (
              <img
                src={editIcon}
                alt="icon-edit"
                className="cursor-pointer"
                data-tour={`"real-estates-table-item-edit-button-${index}`}
                onClick={() => history.push(`/real-estates/${realEstate.id}`)}
              />
            ) : (
              <div style={{ width: "16px", height: "16px" }} />
            )}
            <img
              src={locationIcon}
              alt="icon-location"
              className="cursor-pointer"
              onClick={() => {
                openSnapshotsModal(realEstate);
              }}
            />
            {!realEstate.isFromParent && !isIntegration && (
              <FormModal
                modalConfig={{
                  ...deleteRealEstateModalConfig,
                  modalButton: (
                    <img
                      src={deleteIcon}
                      alt="icon-delete"
                      data-tour={`real-estates-table-item-delete-button-${index}`}
                      className="cursor-pointer"
                    />
                  ),
                }}
              >
                <RealEstateDeleteHandler realEstate={realEstate} />
              </FormModal>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable<ApiRealEstateListing>({
    data: listings,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // shows performance data
    // debugTable: true,
  });

  return (
    <table className="table w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : (
                  <div
                    {...{
                      className: header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : "",
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: "  🔼",
                      desc: "  🔽",
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table
          .getRowModel()
          .rows.slice(0, 10)
          .map((row) => (
            <tr
              key={row.id}
              className={
                realEstateHighlightId === row.original.id ? "active" : ""
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default RealEstatesTableV2;
