export enum DialogType {
  None = "none",
  AddConnection = "addConnection",
  AddDatabase = "addDatabase",
  DeleteDatabase = "deleteDatabase",
  DropTable = "dropTable",
  ExportDatabase = "exportDatabase",
  AddAgent = "addAgent",
}
export interface DialogParams {
  type: DialogType;
  params?: any;
}
