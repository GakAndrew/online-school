import {
  I18nPluralPipe,
  NgClass,
  NgComponentOutlet,
  NgFor,
  NgIf,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet,
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { Observable, Subject, debounceTime, distinctUntilChanged, fromEvent, of, takeUntil } from 'rxjs';

import { SelectionModel } from '@angular/cdk/collections';
import { MatDividerModule } from '@angular/material/divider';
import { ShowInMenuDirective } from './directives/show-in-menu.directive';
import { Action } from './models/action.model';
import { GridColDef } from './models/columns/grid-col-def.model';
import { CellCssClass, HeaderCellCssClass } from './models/grid-css-class-prop';
import {
  GridRowId,
  GridRowIdGetter,
  GridRowModel,
  GridRowSelectionModel,
  GridRowsProp,
  GridValidRowModel,
} from './models/rows/grid-row.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import _ from 'lodash';

export type GridPaginationModel = PageEvent;

@Component({
  selector: 'csl-data-grid',
  templateUrl: './data-grid.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatRippleModule,
    NgStyle,
    NgClass,
    NgComponentOutlet,
    NgTemplateOutlet,
    MatTooltipModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    MatMenuModule,
  ],
  styles: [
    `
      :host {
        @apply flex flex-col min-w-full;
      }

      .mat-table {
        @apply flex-auto;
      }

      .mat-row-active {
        @apply bg-sky-200 #{!important};
      }

      .hidden {
        display: none;
      }
    `,
  ],
})
export class DataGridComponent<R extends GridRowModel = any> implements OnChanges, OnDestroy, AfterViewInit {
  @Input({ required: true }) columns: GridColDef[];
  @Input({ required: true }) rows: GridRowsProp;
  @Input() checkboxSelection: boolean;
  @Input() columnVisibilityModel: { [key: string]: boolean };
  @Input() disableColumnFilter: boolean;
  @Input() disableRowSelectionOnClick: boolean;
  @Input() filterDebounceMs = 150;
  @Input() filterMode: 'client' | 'server' = 'client';
  @Input() hideFooter: boolean;
  @Input() hideFooterPagination: boolean;
  @Input() hideFooterSelectedRowCount: boolean;
  @Input() keepNonExistentRowsSelected: boolean;
  @Input() loading: boolean | Observable<boolean> = false;
  @Input() isRowSelectable: (params: { row: R }) => boolean;
  @Input() getOptionValue: (value: unknown) => unknown;
  @Input() getOptionLabel: (value: unknown) => unknown;
  @Input() getActions: (row: R) => Action[];
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() paginationMode: 'client' | 'server' = 'client';
  @Input() paginationModel: GridPaginationModel;
  @Input() rowCount: number;
  @Input() rowSelection = true;
  @Input() rowSelectionModel: GridRowId[];
  @Input() sortingMode: 'client' | 'server' = 'client';
  @Input() sortModel: Sort;
  @Input() getRowId: GridRowIdGetter;
  @Input() clearRowSelectionByDownEsc = true;
  @Input() showFooter = false;

  @Output() cellClick: EventEmitter<{ row: R; value: unknown; column: GridColDef }> = new EventEmitter<{
    row: R;
    value: unknown;
    column: GridColDef;
  }>();
  @Output() cellDoubleClick: EventEmitter<{ row: R; value: unknown; column: GridColDef }> = new EventEmitter<{
    row: R;
    value: unknown;
    column: GridColDef;
  }>();
  @Output() columnHeaderClick: EventEmitter<{ field: string }> = new EventEmitter<{ field: string }>();
  @Output() columnHeaderDoubleClick: EventEmitter<{ field: string }> = new EventEmitter<{ field: string }>();
  @Output() paginationModelChange: EventEmitter<GridPaginationModel> = new EventEmitter<GridPaginationModel>();
  @Output() rowClick: EventEmitter<{ row: R }> = new EventEmitter<{ row: R }>();
  @Output() rowDoubleClick: EventEmitter<{ row: R }> = new EventEmitter<{ row: R }>();
  @Output() rowSelectionModelChange: EventEmitter<GridRowSelectionModel> = new EventEmitter<GridRowSelectionModel>();
  @Output() sortModelChange: EventEmitter<Sort> = new EventEmitter<Sort>();
  @Output() singleSelectChange: EventEmitter<{ row: R; value: unknown }> = new EventEmitter<{
    row: R;
    value: unknown;
  }>();
  @Output() filterChange: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  @HostListener('document:keydown.escape', ['$event'])
  resetSelectedItems(event: KeyboardEvent): void {
    event.stopPropagation();
    if (this.clearRowSelectionByDownEsc) {
      this.rowsSelection.clear();
      this.rowSelectionModelChange.emit(this.rowsSelection.selected);
    }
  }

  unsubscribe$: Subject<void> = new Subject();

  rowsSelection = new SelectionModel<GridRowId>(true);
  dataSource: MatTableDataSource<GridValidRowModel>;
  displayedColumns: string[];
  headerCellStyles: HeaderCellCssClass;
  cellStyles: CellCssClass;
  rowsOnPage: GridValidRowModel[] = [];

  selectedRowsCountMessageMapping: Record<string, string> = {
    one: '# строка',
    few: '# строки',
    other: '# строк',
  };

  ngAfterViewInit(): void {
    if (this.paginationMode === 'client' && !this.hideFooterPagination) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sortingMode === 'client') {
      this.dataSource.sort = this.sort;
    }

    if (!this.disableColumnFilter) {
      this.filterListener();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']?.currentValue) {
      this.setDisplayedColumns();
      this.setStyles();
    }

    if (changes['rows']?.currentValue) {
      this.setDataSource();
      this.setRowsOnPage();
    }

    if (changes['rowSelectionModel']?.currentValue) {
      this.rowsSelection.select(...this.rowSelectionModel);
    }
  }

  setStyles(): void {
    _.each(this.columns, (column: GridColDef) => {
      this.addHeaderCellStyles(column);
      this.addCellStyles(column);
    });
  }

  setDisplayedColumns(): void {
    this.displayedColumns = _.map(this.columns, col => col.field);
    this.deleteUnavailableColumnModels();

    if (this.checkboxSelection) {
      this.displayedColumns.unshift('select');
    }
  }

  setDataSource(): void {
    this.dataSource.data = [...this.rows];
  }

  disableMatSortHeader(column: GridColDef): boolean {
    return !column.sortable;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.rowsSelection.selected.length;
    const numRows = this.keepNonExistentRowsSelected ? this.dataSource.data.length : this.paginationModel.pageSize;
    return numSelected === numRows;
  }

  selectedAll(value: boolean): void {
    if (value) {
      this.rowsSelection.select(
        ..._.map(this.keepNonExistentRowsSelected ? this.dataSource.data : this.rowsOnPage, row => this.rowId(row))
      );
      this.rowSelectionModelChange.emit(this.rowsSelection.selected);
      return;
    }

    this.rowsSelection.clear();
    this.rowSelectionModelChange.emit(this.rowsSelection.selected);
  }

  rowActive(row: R): boolean {
    return this.rowsSelection.isSelected(this.rowId(row));
  }

  onRowSelectionChange(row: R): void {
    if (!this.rowSelection || (this.isRowSelectable && !this.isRowSelectable({ row }))) {
      return;
    }

    this.updateSelectionRows(row);
  }

  onPaginationModelChange(pageEvent: PageEvent): void {
    this.paginationModel = pageEvent;
    this.setRowsOnPage();
    this.paginationModelChange.emit(this.paginationModel);
  }

  trackByFn(index: number, item: Action): boolean | undefined {
    return item.showInMenu;
  }

  onActionClick(event: MouseEvent, action: Action): void {
    event.preventDefault();
    event.stopPropagation();

    action.onClick();
  }

  getCellValue<V = any>(row: R, value: V, column: GridColDef): V {
    return column.valueGetter ? column.valueGetter({ row, value }) : value;
  }

  getCellFormattedValue<V = any, F extends V = any>(row: R, value: V, column: GridColDef): F {
    return column.valueFormatter
      ? column.valueFormatter(this.getCellValue(row, value, column))
      : this.getCellValue(row, value, column);
  }

  getNgCellClass(column: GridColDef, row: R): CellCssClass {
    return { ...this.cellStyles, ...this.getCellClassName(column, row) };
  }

  getNgHeaderClass(column: GridColDef): HeaderCellCssClass {
    return { ...this.headerCellStyles, ...this.getHeaderClassName(column) };
  }

  isLoading = (): Observable<boolean> => (_.isBoolean(this.loading) ? of(this.loading) : this.loading);

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  private setRowsOnPage(): void {
    if (this.keepNonExistentRowsSelected) {
      return;
    }

    this.rowsSelection.clear();

    this.rowsOnPage;
    this.paginationMode === 'server'
      ? this.dataSource.data
      : this.paginate(this.dataSource.data, this.paginationModel?.pageSize || 10, this.paginationModel?.pageIndex || 0);
  }

  private addHeaderCellStyles(column: GridColDef): void {
    this.headerCellStyles = {
      ...this.headerCellStyles,
      [column.field]: {
        [`${column?.headerClassName}`]: !_.isNil(column.headerClassName) && !_.isFunction(column.headerClassName),
      },
    };
  }

  private addCellStyles(column: GridColDef): void {
    this.cellStyles = {
      ...this.cellStyles,
      [column.field]: {
        [`${column.cellClassName}`]: !_.isNil(column.cellClassName) && !_.isFunction(column.cellClassName),
      },
    };
  }
  /**
   * update selection rows and emit row selection model change
   * @param row
   */
  private updateSelectionRows(row: R): void {
    const rowId = this.rowId(row);
    this.rowsSelection.isSelected(rowId) ? this.rowsSelection.deselect(rowId) : this.rowsSelection.select(rowId);
    this.rowSelectionModelChange.emit(this.rowsSelection.selected);
  }
  /**
   *
   * @param row Selection row
   * @returns Return row id use getRowId if he is not empty or prop id at the row
   */
  private rowId(row: R | GridValidRowModel): string | number {
    return this.getRowId ? this.getRowId(row) : row['id'];
  }
  /**
   * if columnVisibilityModel is not empty that pull unavailable column models
   */
  private deleteUnavailableColumnModels(): void {
    if (this.columnVisibilityModel) {
      this.displayedColumns = _.filter(this.displayedColumns, column => this.columnVisibilityModel?.[column]);
    }
  }
  /**
   *
   * @param array all rows
   * @param pageSize current page size
   * @param pageIndex current page index
   * @returns array rows which are on the page
   */
  private paginate(array: GridValidRowModel[], pageSize: number, pageIndex: number): GridValidRowModel[] {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
  }
  /**
   * add listening for a key up in input search
   */
  private filterListener(): void {
    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(debounceTime(this.filterDebounceMs), distinctUntilChanged(), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (this.filterMode === 'client') {
          this.applyFilter();
        }

        this.filterChange.emit(this.filter.nativeElement.value);
      });
  }
  /**
   * if filter mode client that apply filter to data source
   */
  private applyFilter(): void {
    const filterValue = this.filter.nativeElement.value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      this.onPaginationModelChange({
        pageIndex: this.dataSource.paginator.pageIndex,
        pageSize: this.dataSource.paginator.pageSize,
        length: this.dataSource.paginator.length,
      });
    }
  }

  private getCellClassName(column: GridColDef, row: R): CellCssClass | null {
    if (_.isFunction(column.cellClassName)) {
      return { [column.field]: { [column.cellClassName(row)]: true } };
    }

    return null;
  }

  private getHeaderClassName(column: GridColDef): HeaderCellCssClass | null {
    if (_.isFunction(column.headerClassName)) {
      return { [column.field]: { [column.headerClassName()]: true } };
    }

    return null;
  }

  calculateAggregation(column: GridColDef): any {
    if (!column.aggregation || !this.rows) return null;

    const values = this.rows
      .map(row => {
        if (column.valueGetter) {
          return column.valueGetter({ row, value: column.field });
        }
        return row[column.field];
      })
      .filter(value => value != null);

    if (typeof column.aggregation === 'function') {
      return column.aggregation({ field: column.field, values });
    }

    switch (column.aggregation) {
      case 'sum':
        return values.reduce((sum, value) => sum + (Number(value) || 0), 0);
      case 'avg':
        return values.length ? values.reduce((sum, value) => sum + (Number(value) || 0), 0) / values.length : 0;
      case 'min':
        return Math.min(...values.map(v => Number(v) || Infinity));
      case 'max':
        return Math.max(...values.map(v => Number(v) || -Infinity));
      case 'count':
        return values.length;
      default:
        return null;
    }
  }

  renderFooterCell(column: GridColDef): string {
    const value = this.calculateAggregation(column);
    if (column.valueFormatter) {
      return column.valueFormatter(value);
    }
    return String(value);
  }
}
