export interface Sidebar<R = any> {
  resolveSidebarWith: (result?: R) => void;
}

export interface SidebarButtonConfig<T> {
  label: string;
  type: 'secondary' | 'primary';
  returnValue?: T;
}

export interface SidebarConfig<T> {
  title: string;
  body?: string;
  buttons: SidebarButtonConfig<T>[];
}

export interface SidebarOptions<T> {
  closable?: boolean;
  locals?: Partial<T>;
}
