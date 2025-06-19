import React, { useEffect } from "react";
import { ViewTitle } from "../view-title";
import { ViewContainer } from "../view-container";
import { ConnectionConfig } from "@/types/db";
import ViewData from "../view-data";
import ViewDump from "../view-dump";
import ViewSQL from "../view-sql";
import ViewTable from "../view-table";
import ViewTables from "../view-tables";
import ViewText from "../view-text";
import ViewUserProtocal from "../view-user-protocal";
import ViewPrivacyPolicy from "../view-privacy-policy";
import ViewOpenSource from "../view-open-source";
import ViewImport from "../view-import";
import ViewExport from "../view-export";
import { CodeIcon, CogIcon, DatabaseZapIcon, DownloadIcon, FileIcon, HardDriveDownloadIcon, ImportIcon, Table2Icon, TableIcon } from "lucide-react";
import { ViewType } from "@/types/view";

export const  Views:{
  [key: string]: {
    view: (key:string)=>React.ReactNode;
    icon:React.ReactNode;
  }
}= {
  sql: {
    view:(key:string)=><ViewSQL viewKey={key} />,
    icon:<CodeIcon className="w-[12px]" />
  },

  table: {
    view: (key:string)=><ViewTable viewKey={key} />,
    icon:<TableIcon className="w-[12px]" />
  },

  data: {
    view:(key:string)=><ViewData viewKey={key} />,
    icon:<DatabaseZapIcon className="w-[12px]" />
  },
  text: {
    view:(key:string)=><ViewText viewKey={key} />,
    icon:<FileIcon className="w-[12px]" />
  },
  tables: {
    view: (key:string)=><ViewTables viewKey={key} />,
    icon:<Table2Icon className="w-[12px]" />
  },
  dump: {
    view:(key:string)=><ViewDump viewKey={key} />,
    icon:<HardDriveDownloadIcon className="w-[12px]" />
  },
  user_protocal: {
    view: (key:string)=><ViewUserProtocal viewKey={key} />,
    icon:<FileIcon className="w-[12px]" />
  },
  privacy_policy: {
    view: (key:string)=><ViewPrivacyPolicy viewKey={key} />,
    icon:<FileIcon className="w-[12px]" />
  },
  open_source: {
    view: (key:string)=><ViewOpenSource viewKey={key} />,
    icon:<FileIcon className="w-[12px]" />
  },
  import_data: {
    view: (key:string)=><ViewImport viewKey={key} />,
    icon:<ImportIcon className="w-[12px]" />
  },
  export_data: {
    view: (key:string)=><ViewExport viewKey={key} />,
    icon:<DownloadIcon className="w-[12px]" />
  }
};

export function View() {
  return <div className="h-full w-full box-border flex flex-col">
    <ViewTitle />
    <ViewContainer />
  </div>
}