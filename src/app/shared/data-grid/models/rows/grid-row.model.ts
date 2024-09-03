export type GridValidRowModel = {
  [key: string | symbol]: any;
};

/**
 * The key value object representing the data of a row.
 */
export type GridRowModel<R extends GridValidRowModel = GridValidRowModel> = R;

export type GridRowsProp<R extends GridValidRowModel = GridValidRowModel> = Readonly<GridRowModel<R>[]>;

/**
 * The type of Id supported by the grid.
 */
export type GridRowId = string | number;

/**
 * The function to retrieve the id of a [[GridRowModel]].
 */
export type GridRowIdGetter<R extends GridRowModel = GridRowModel> = (row: R) => GridRowId;
/**
 * Model selection rows which represents array from grid row id
 */
export type GridRowSelectionModel = GridRowId[];
