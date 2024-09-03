import { GridRowModel } from 'cloud-shared-lib';

/**
 * An interface describing the parameters of a dynamic cell
 */
export interface GridRenderCellParams<R extends GridRowModel = any, V = any, F = V> {
  row: R;
  value: V;
  formattedValue: F;
}
