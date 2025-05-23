import {
  CSSProperties,
  FunctionComponent,
  useContext,
  useMemo,
  useState,
  Fragment,
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
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./RealEstatesTableV2.scss";

import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../../shared/constants/real-estate";
import editIcon from "../../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import searchIcon from "../../assets/icons/icons-16-x-16-outline-ic-search.svg";
import locationIcon from "../../assets/icons/icons-16-x-16-outline-ic-type.svg";
import FormModal from "../../components/FormModal";
import { RealEstateContext } from "../../context/RealEstateContext";
import { ApiRealEstateListing } from "../../../../shared/types/real-estate";
import { RealEstateDeleteHandler } from "../RealEstateDeleteHandler";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { getRealEstateCost } from "../../shared/real-estate.functions";
import { IRealEstatesHistoryState } from "../../shared/shared.types";
import { LocIndexPropsEnum } from "../../../../shared/types/location-index";
import { locationIndexNames } from "../../../../shared/constants/location-index";
import TableV2Pagination from "./TableV2Pagination";
import TableV2Filter from "./TableV2Filter";
import { useUserState } from "../../hooks/userstate";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line
  interface ColumnMeta<TData extends RowData, TValue> {
    headStyles?: CSSProperties;
    cellStyles?: CSSProperties;
    filterStyles?: CSSProperties;
  }
}

export interface IRealEstateTableItem {
  status?: string;
  status2?: string;
  listing: ApiRealEstateListing;
  cost?: string;
  locationIndices?: Record<string, number>;
  furnishing?: string[];
}

interface IRealEstatesTableV2Props {
  openSnapshotsModal: (realEstate: ApiRealEstateListing) => void;
}

const RealEstatesTableV2: FunctionComponent<IRealEstatesTableV2Props> = ({
  openSnapshotsModal,
}) => {
  const { t } = useTranslation();
  const {
    realEstateState: { listings },
  } = useContext(RealEstateContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const history = useHistory<IRealEstatesHistoryState>();
  const queryParams = new URLSearchParams(useLocation().search);
  const realEstateHighlightId = queryParams.get("id");

  const { getCurrentUser } = useUserState();

  const user = getCurrentUser();
  const isIntegrationUser = "integrationUserId" in user;

  const [sorting, setSorting] = useState<SortingState>([]);

  const startSearchFromRealEstate = async (
    realEstate: ApiRealEstateListing
  ): Promise<void> => {
    if (!realEstate.address) {
      return;
    }

    const result = await deriveGeocodeByAddress(user, realEstate.address);
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

  const tableData: IRealEstateTableItem[] = useMemo(
    () =>
      listings.map((listing) => {
        const locationIndices = listing.locationIndices
          ? Object.keys(listing.locationIndices).reduce<Record<string, number>>(
              (result, indexName) => {
                result[
                  listing.locationIndices![indexName as LocIndexPropsEnum].name
                ] =
                  listing.locationIndices![
                    indexName as LocIndexPropsEnum
                  ].value;

                return result;
              },
              {}
            )
          : undefined;

        const furnishing = listing.characteristics?.furnishing?.map(
          (furnishName) =>
            allFurnishing.find(({ type }) => type === furnishName)!.label
        );

        return {
          listing,
          locationIndices,
          furnishing,
          status: listing.status,
          status2: listing.status2,
          cost: listing.costStructure
            ? `${getRealEstateCost(listing.costStructure)} (${
                allRealEstateCostTypes.find(
                  (t) => t.type === listing.costStructure!.type
                )?.label
              })`
            : undefined,
        };
      }),
    [listings]
  );

  const columnHelper = createColumnHelper<IRealEstateTableItem>();

  const columns = useMemo<ColumnDef<IRealEstateTableItem, any>[]>(
    () => [
      columnHelper.accessor("status", {
        header: t(IntlKeys.common.marketingType),
        cell: (props) => props.getValue() || null,
        size: 150,
        meta: {
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      columnHelper.accessor("status2", {
        header: t(IntlKeys.common.status),
        cell: (props) => props.getValue() || null,
        size: 200,
        meta: {
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      columnHelper.accessor((row) => row.listing.name, {
        id: "name",
        header: t(IntlKeys.common.name),
        cell: (props) => props.getValue(),
        size: 300,
        meta: {
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      columnHelper.accessor((row) => row.listing.address, {
        id: "address",
        header: t(IntlKeys.common.address),
        cell: (props) => props.getValue(),
        size: 300,
        meta: {
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      columnHelper.accessor("cost", {
        header: t(IntlKeys.common.price),
        cell: (props) => (props.getValue() ? props.getValue() : null),
        size: 200,
        meta: {
          headStyles: { height: "130px" },
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      ...Object.keys(locationIndexNames).reduce<
        Array<ColumnDef<IRealEstateTableItem, any>>
      >((result, indexName) => {
        const column = columnHelper.accessor(
          (row) =>
            row.locationIndices ? row.locationIndices[indexName] : undefined,
          {
            id: (locationIndexNames as Record<string, string>)[indexName],
            header: t(
              (
                IntlKeys.snapshotEditor.positionIndices as Record<
                  string,
                  string
                >
              )[indexName]
            ),
            cell: (props) => (props.getValue() ? `${props.getValue()}%` : null),
            size: 65,
            meta: {
              headStyles: {
                transform: "rotate(-180deg)",
                writingMode: "vertical-rl",
                whiteSpace: "normal",
                height: "100px",
              },
              cellStyles: {
                whiteSpace: "normal",
                textAlign: "center",
              },
              filterStyles: {
                transform: "rotate(-180deg)",
              },
            },
          }
        );

        result.push(column);

        return result;
      }, []),
      columnHelper.display({
        id: "furnishing",
        header: t(IntlKeys.realEstate.equipment),
        cell: (props) => props.row.original.furnishing?.join(", ") || null,
        size: 300,
        meta: {
          cellStyles: { whiteSpace: "normal" },
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: (props) => {
          const realEstate = props.row.original.listing;
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
              {!realEstate.isFromParent && !isIntegrationUser && (
                <FormModal
                  modalConfig={{
                    modalTitle: t(IntlKeys.common.objectDeleteTitle),
                    submitButtonTitle: t(IntlKeys.common.delete),
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

  const table = useReactTable<IRealEstateTableItem>({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // shows performance data
    // debugTable: true,
  });

  return (
    <>
      <div
        className="overflow-x-auto"
        style={{
          transform: "rotateX(180deg)",
        }}
      >
        <table className="real-estates-table table w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Fragment key={headerGroup.id}>
                <tr>
                  {headerGroup.headers.map((header) => (
                    <th
                      {...{
                        key: `${header.id}-name`,
                        colSpan: header.colSpan,
                        style: {
                          minWidth: header.getSize(),
                          maxWidth: header.getSize(),
                          ...(header.column.columnDef.meta?.headStyles || {}),
                        },
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
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
                        </>
                      )}
                    </th>
                  ))}
                </tr>
                <tr>
                  {headerGroup.headers.map((header) => (
                    <th
                      {...{
                        key: `${header.id}-filter`,
                        colSpan: header.colSpan,
                      }}
                    >
                      {header.column.getCanFilter() ? (
                        <TableV2Filter table={table} column={header.column} />
                      ) : null}
                    </th>
                  ))}
                </tr>
              </Fragment>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={
                  realEstateHighlightId === row.original.listing.id
                    ? "active"
                    : ""
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
      <TableV2Pagination table={table} />
    </>
  );
};

export default RealEstatesTableV2;
