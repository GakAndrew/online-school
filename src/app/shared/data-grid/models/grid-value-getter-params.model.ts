import { GridRowModel } from './rows/grid-row.model';

/**
 * Parameters passed to colDef.valueGetter
 */
export interface GridValueGetterParams<R extends GridRowModel = any, V = any> {
  row: R;
  value: V;
}
