export interface Action {
  icon: string;
  label: string;
  showInMenu?: boolean;
  visible?: boolean;
  tooltip?: string;
  onClick: () => void;
}
