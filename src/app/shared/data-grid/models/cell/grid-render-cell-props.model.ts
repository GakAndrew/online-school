import { Component, Injector, Type } from '@angular/core';
import { GridRowModel } from '../rows/grid-row.model';

/**
 * This interface describes the properties object who will return from {@function renderCell}
 */
export interface GridRenderCellProps {
  component: Type<Component & IRenderCellInputs>;
  injector?: Injector;
}

/**
 * This interface describes the input properties of a dynamic component for rendering a cell inside data grid component
 */
export interface IRenderCellInputs<R extends GridRowModel = any, V = any, F = V> {
  row: R;
  value: V;
  formattedValue: F;
}
