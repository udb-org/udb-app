import { DialogParams, DialogType } from "@/types/dialog";
import React, { useEffect, useState } from "react";
import { AddConnectionDialog } from "./add-connection";
import { AddDatabaseDialog } from "./add-database";
import { DelDatabaseDialog } from "./del-database";
import { DropTableDialog } from "./drop-table";
import { AddAgentDialog } from "./add-agent";
/**
 * 打开对话框
 * @param params 对话框参数
 */
export function openDialog(params: DialogParams) {
  console.log("openDialog", params);
  window.api.send("dialog:open", params);
}
export function Dialogs() {
  const [dialogParams, setDialogParams] = useState<DialogParams>({
    type: DialogType.None,
    params: {},
  });
  useEffect(() => {
    //监听对话框打开事件
    window.api.on("dialog:opening", (args: DialogParams) => {
      console.log("dialog:opening", args);
      //解决设置state后，对话框不显示的问题
      setDialogParams((prev) => args);
    });
    return () => {
      window.api.removeAllListeners("dialog:opening");
    };
  }, []);
  return (
    <>
      {dialogParams.type == DialogType.AddConnection && (
        <AddConnectionDialog
          params={dialogParams.params}
          onClose={() => {
            setDialogParams({
              type: DialogType.None,
              params: {},
            });
          }}
        />
      )}
      {dialogParams.type == DialogType.AddDatabase && (
        <AddDatabaseDialog
          params={dialogParams.params}
          onClose={() => {
            setDialogParams({
              type: DialogType.None,
              params: {},
            });
          }}
        />
      )}
      {dialogParams.type == DialogType.DeleteDatabase && (
        <DelDatabaseDialog
          params={dialogParams.params}
          onClose={() => {
            setDialogParams({
              type: DialogType.None,
              params: {},
            });
          }}
        />
      )}
      {dialogParams.type == DialogType.DropTable && (
        <DropTableDialog
          params={dialogParams.params}
          onClose={() => {
            setDialogParams({
              type: DialogType.None,
              params: {},
            });
          }}
        />
      )}
       {dialogParams.type == DialogType.AddAgent && (
        <AddAgentDialog
          params={dialogParams.params}
          onClose={() => {
            setDialogParams({
              type: DialogType.None,
              params: {},
            });
          }}
        />
      )}
    </>
  );
}
