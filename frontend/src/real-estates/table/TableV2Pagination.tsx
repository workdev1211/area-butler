import { FunctionComponent } from "react";
import { Table } from "@tanstack/react-table";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { IRealEstateTableItem } from "./RealEstatesTableV2";

interface ITableV2PaginationProps {
  table: Table<IRealEstateTableItem>;
}

const TableV2Pagination: FunctionComponent<ITableV2PaginationProps> = ({
  table,
}) => {
  const { t } = useTranslation();
  const pageSizes = [10, 20, 30, 40, 50];

  return (
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
        <div>{t(IntlKeys.common.page)}</div>
        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
      <span className="flex items-center gap-1">
        | {t(IntlKeys.common.goToPage)}:
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
            {t(IntlKeys.common.show)} {pageSize}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TableV2Pagination;
