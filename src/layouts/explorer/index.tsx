import React, { useEffect } from "react";
import { ExplorerDb } from "../explorer-db";
import { ExplorerHistory } from "../explorer-history";
import { ExplorerSearch } from "../explorer-search";
import { ExplorerFolder } from "../explorer-folder";
import { ExplorerFavorite } from "../explorer-favorite";
import ExplorerSetting from "../explorer-setting";
export interface IExplorerParam {
  type:
    | "db"
    | "search"
    | "history"
    | "folder"
    | "favorite"
    | "setting"
    | string;
  params: any;
}

export function Explorer() {
  const [params, setParams] = React.useState<IExplorerParam>({
    type: "db",
    params: {},
  });
  useEffect(() => {
    const opening = (params: IExplorerParam) => {
      setParams(params);
    };
    window.api.on("explorer:opening", opening);
    return () => {
      window.api.removeListener("explorer:opening", opening);
    };
  }, []);

  return (
    <div className="box-border h-full w-full">
      <ExplorerDb isVisible={params.type === "db"} />
      <ExplorerHistory isVisible={params.type === "history"} />
      <ExplorerSearch isVisible={params.type === "search"} />
      <ExplorerFolder isVisible={params.type === "folder"} />
      <ExplorerFavorite isVisible={params.type === "favorite"} />
      <ExplorerSetting isVisible={params.type === "setting"} />
    </div>
  );
}
