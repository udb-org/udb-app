export enum ViewType {
  None = "none",
  Sql = "sql",
  Setting = "setting",
  Table = "table",
  Data = "data",
  Welcome = "welcome",
  Tables = "tables",
}
export interface ViewParams {
  name?: string;
  type: ViewType | string;
  path: string[];
  params?: any;
}
