import { GridRenderCellParams } from '../cell/grid-render-cell-params.type';
import { GridRenderCellProps } from '../cell/grid-render-cell-props.model';
import { GridCellClassNamePropType } from '../grid-cell-class-name-prop.type';
import { GridComparatorFn } from '../grid-comparator.type';
import { GridValueGetterParams } from '../grid-value-getter-params.model';
import { GridRowModel } from '../rows/grid-row.model';
import { GridColType, GridColumnHeaderClassNamePropType } from './grid-col.type';

/**
 * Column Definition base interface.
 */
export interface GridColDef<R extends GridRowModel = any, V = any, F = V> {
  /**
   * The column identifier. It's used to map with [[GridRowModel]] values.
   */
  field: string;
  /**
   * Class name that will be added in cells for that column
   */
  cellClassName?: GridCellClassNamePropType<R>;
  /**
   * The description of the column rendered as tooltip if the column header name is not fully displayed.
   */
  description?: string;
  /**
   * Class name that will be added in the column header cell.
   */
  headerClassName?: GridColumnHeaderClassNamePropType;
  /**
   * The title of the column rendered in the column header cell.
   */
  headerName?: string;
  /**
   * Toggle the visibility of the sort icons.
   * @default false
   */
  hideSortIcons?: boolean;
  /**
   * If `true`, the column is sortable.
   * @default false
   */
  sortable?: boolean;
  /**
   * A comparator function used to sort rows.
   */
  sortComparator?: GridComparatorFn<V>;
  /**
   * The type of the column
   */
  type?: GridColType;
  /**
   * Function that allows to apply a formatter before rendering its value.
   * @template V, F
   * @param {GridValueFormatterParams<V>} params Object containing parameters for the formatter.
   * @returns {F} The formatted value.
   */
  valueFormatter?: (value: V) => F;
  /**
   * Function that allows to get a specific data instead of field to render in the cell.
   * @template R, V
   * @param {GridValueGetterParams<R, any>} params Object containing parameters for the getter.
   * @returns {V} The cell value.
   */
  valueGetter?: (params: GridValueGetterParams<R, V>) => V;
  /**
   * when installing the type singleSelect additionally specify valueOptions
   * valueOptions - array of values for the select
   * if the value is different from label then use the example
   * example - valueOptions: [ { value: 'BR', label: 'Brazil' }, { value: 'FR', label: 'France' }]
   */
  valueOptions?: V[];
  /**
   * Use this function if you want to pass a cell display pattern to the data grid
   * @param row the row for which the function is applied
   * @returns html
   */
  renderCell?: (params: GridRenderCellParams<R, V, F>) => GridRenderCellProps;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((params: AggregationParams) => any);
}

export interface AggregationParams {
  field: string;
  values: any[];
}
