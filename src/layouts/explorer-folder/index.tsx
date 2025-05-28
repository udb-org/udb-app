import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CodeIcon, MoreHorizontalIcon } from "lucide-react"
import VirtualList from "@/components/virtual-scroll";
import { IVirtualTreeItem, VirtualTree } from "@/components/virtual-tree";
import { openMenu } from "@/api/menu";
import { getFileIcon } from "./file-icons";
import { useProjectStore } from "@/store/project-store";
import { useTranslation } from "react-i18next";

export function ExplorerFolder(props: {
  isVisible: boolean;
}) {
  const {project,setProject}=useProjectStore();
  const [files, setFiles] = React.useState<IVirtualTreeItem[]>([]);
  /**
 * Transforms an array of file objects into an array of virtual tree items.
 * @param files - An array of file objects with 'type' and 'name' properties.
 * @returns An array of IVirtualTreeItem objects.
 */
function transformFiles(files: any[]) {
    // Initialize an empty array to store virtual tree items
    const _files: IVirtualTreeItem[] = [];
    // Iterate through each file in the input array
    files.forEach(file => {
      // Check if the file is a directory
      if(file.type==="directory"){
        _files.push({
          name: file.name,
          isFolder: true,

        })
      } else if(file.type==="file"){
        // Get the file icon based on the file name
        const icon=getFileIcon(file.name);
        _files.push({
          name: file.name,
          isFolder: false,
          icon: icon,
        })
      }

      
    })
    return _files;
  }
  useEffect(() => {
    //打开项目
    const openProjecting = (files: any[]) => {
      console.log("openProjecting", files)
     const _files= transformFiles(files);
    
      setFiles(_files);
    }
    window.api.on("storage:openProjecting", openProjecting);
  
    return () => {
      window.api.removeListener("storage:openProjecting", openProjecting);
  
    }
  }, []);
  const {t}=useTranslation();
  return (
    <div className="h-full w-full  flex-col"
      style={{
        display: props.isVisible ? "flex" : "none"
      }}
    >
      <div className="font-bold text-sm flex items-center flex-shrink-0 ">
        <div className="text-sm font-bold">
          {t("active.bar.folder")}
        </div>
        <div className="flex-1"></div>
        <Button variant={"ghost"} size={"icon"} className="w-[28px] h-[28px] m-[0px]">
          <MoreHorizontalIcon size={14}></MoreHorizontalIcon>
        </Button>
      </div>
      {/* <ScrollArea className="flex-1">
      <ScrollBar orientation="vertical" />
      

    </ScrollArea> */}
      {/* <VirtualList items={rows}  estimateHeight={32} renderItem={(item: IExplorerDbRow, i: number) => {
      return <div></div>
    }}></VirtualList> */}
      <VirtualTree
        data={files}
        
        onLoad={(path: string[]) => {
          console.log("onLoad", path);
          let filePath="";
          if (path.length > 0) {
            filePath = filePath + "/" + path.join("/");
          }
         return  window.api.invoke("storage:openFolder", project.path,filePath).then((files: any) => {
            console.log("openFolder", files);
            const _files = transformFiles(files);
            return _files;
          })
        }
        } onRowClick={(row) => {
          if(!row.isFolder){
            const p=row.path.join("/");
            window.api.send("storage:openFile",project.path,p);
          }

        }}
        onRowContextMenu={(row) => {
          openMenu({
            channel: "explorer:db-actioning",
            params: {
              database: row.name
            },
            items: [
              {
                name: "Add Table",
                command: "addTable"
              }
              , {
                type: "separator"
              },
              {
                name: "Alter Database",
                command: "alterDatabase"
              },
              {
                name: "Drop Database",
                command: "deleteDatabase"
              }, {
                type: "separator"
              }
              , {
                name: "Export Database",
                command: "exportDatabase"
              }, {
                name: "Import Database",
                command: "importDatabase"
              }

            ]
          })

        }}
      ></VirtualTree>
    </div>

  )
}