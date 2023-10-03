import {
  CSSProperties,
  FunctionComponent,
  useContext,
  useMemo,
  useState,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  ColumnDef,
  RowData,
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import "./RealEstatesTableV2.scss";

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
import { LocIndexPropsEnum } from "../../../shared/types/location-index";
import { locationIndexNames } from "../../../shared/constants/location-index";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line
  interface ColumnMeta<TData extends RowData, TValue> {
    headStyles?: CSSProperties;
    cellStyles?: CSSProperties;
  }
}

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

  const columns = useMemo<ColumnDef<ApiRealEstateListing, any>[]>(
    () => [
      columnHelper.accessor("status", {
        header: "typ",
        cell: (props) =>
          allRealEstateStatuses.find(
            (estate) => estate.status === props.getValue()
          )?.label,
        size: 150,
      }),
      columnHelper.accessor("name", {
        cell: (props) => props.getValue(),
        size: 300,
        meta: {
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      columnHelper.accessor("address", {
        cell: (props) => props.getValue(),
        size: 300,
        meta: {
          cellStyles: { whiteSpace: "normal" },
        },
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
        size: 200,
        meta: {
          headStyles: { height: "130px" },
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      ...Object.values(LocIndexPropsEnum).reduce<
        Array<ColumnDef<ApiRealEstateListing, any>>
      >((result, locIndexProp) => {
        const column = columnHelper.accessor(
          (row) =>
            row.locationIndices ? row.locationIndices[locIndexProp] : undefined,
          {
            id: locIndexProp,
            header: locationIndexNames[locIndexProp],
            cell: (props) =>
              props.getValue()?.value ? `${props.getValue()!.value}%` : null,
            size: 65,
            meta: {
              headStyles: {
                transform: "rotate(-180deg)",
                writingMode: "vertical-rl",
                whiteSpace: "normal",
                height: "100px",
              },
              cellStyles: { whiteSpace: "normal", textAlign: "center" },
            },
          }
        );

        result.push(column);

        return result;
      }, []),
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
        size: 300,
        meta: {
          cellStyles: { whiteSpace: "normal" },
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable<ApiRealEstateListing>({
    data: listings,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // shows performance data
    // debugTable: true,
  });

  const pageSizes = [10, 20, 30, 40, 50];

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Seite</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Gehe zu Seite:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {pageSizes.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Zeigen {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div
        className="overflow-x-auto"
        style={{
          transform: "rotateX(180deg)",
        }}
      >
        <table className="real-estates-table table w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup, headGroupIndex) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    {...{
                      key: header.id,
                      colSpan: header.colSpan,
                      style: {
                        minWidth: header.getSize(),
                        maxWidth: header.getSize(),
                        ...(header.column.columnDef.meta?.headStyles || {}),
                      },
                    }}
                  >
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={
                  realEstateHighlightId === row.original.id ? "active" : ""
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    {...{
                      key: cell.id,
                      style: {
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                        ...(cell.column.columnDef.meta?.cellStyles || {}),
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RealEstatesTableV2;
