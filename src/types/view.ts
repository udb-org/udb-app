export enum ViewType {
  None = "none",
  Sql = "sql",
  Setting = "setting",
  Table = "table",
  Data = "data",
  Welcome = "welcome",
  Tables = "tables",
  Dump = "dump",
  UserProtocal = "user_protocal",
  PrivacyPolicy = "privacy_policy",
  OpenSource = "open_source",
  ExportData = "export_data",
  ImportData = "import_data",
}
export interface ViewParams {
  name?: string;
  type: ViewType | string;
  path: string[];
  params?: any;
}

export interface IAction {
  name: string;
  command: string;
  icon:"play"|"stop"|"save"|string;
}

export interface ActionParam{
  channel:string;
  command:string;
}