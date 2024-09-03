/**
 * Abstract model NgClass in Angular IO
 */
export interface NgClassModel {
  [key: string]: boolean;
}

/**
 * Column tailwind css classes
 */
export class ColumnCssClass {
  [key: string]: NgClassModel;
}
/**
 * Row tailwind css classes
 */
export class RowCssClass {
  [key: string]: NgClassModel;
}
/**
 * Header Cell tailwind css classes
 */
export class HeaderCellCssClass {
  [key: string]: NgClassModel;
}
/**
 * Cell tailwind css classes
 */
export class CellCssClass {
  [key: string]: NgClassModel;
}
