import { FunctionComponent } from "react";
import { Column, Table } from "@tanstack/react-table";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { IRealEstateTableItem } from "./RealEstatesTableV2";
import { locationIndexNames } from "../../../../shared/constants/location-index";

interface ITableV2FilterProps {
  table: Table<IRealEstateTableItem>;
  column: Column<IRealEstateTableItem, any>;
}

const TableV2Filter: FunctionComponent<ITableV2FilterProps> = ({
  table,
  column,
}) => {
  const { t } = useTranslation();
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return Object.values(locationIndexNames).includes(column.id) ||
    typeof firstValue === "number" ? (
    <>
      {/*<div className="flex space-x-2">*/}
      <input
        className="w-full border shadow rounded"
        type="number"
        min={0}
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) =>
            e.target.value.length ? [e.target.value, old?.[1]] : undefined
          )
        }
        placeholder="Min"
      />
      {/*<input*/}
      {/*  type="number"*/}
      {/*  value={(columnFilterValue as [number, number])?.[1] ?? ""}*/}
      {/*  onChange={(e) =>*/}
      {/*    column.setFilterValue((old: [number, number]) => [*/}
      {/*      old?.[0],*/}
      {/*      e.target.value,*/}
      {/*    ])*/}
      {/*  }*/}
      {/*  placeholder={`Max`}*/}
      {/*  className="w-24 border shadow rounded"*/}
      {/*/>*/}
    </>
  ) : (
    <input
      className="w-full border shadow rounded"
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={t(IntlKeys.common.searchFor)}
    />
  );
};

export default TableV2Filter;
