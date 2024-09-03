/**
 * The union type representing the [[GridColDef]] cell class type.
 */
export type GridCellClassNamePropType<R> = string | ((row: R) => string);
