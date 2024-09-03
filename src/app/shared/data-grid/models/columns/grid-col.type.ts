export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean' | 'singleSelect' | 'actions';
// Use to get autocompletion for GridNativeColTypes types.
export type GridColType = GridNativeColTypes | string;
/**
 * The union type representing the [[GridColDef]] column header class type.
 */
export type GridColumnHeaderClassNamePropType = string | (() => string);
