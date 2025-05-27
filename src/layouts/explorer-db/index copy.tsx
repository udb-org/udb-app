import { openMenu } from "@/api/menu";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import VirtualList from "@/components/virtual-scroll";
import { IDataBase, IDataBaseTable, ISqlResult } from "@/types/db";

import { ChevronDownIcon, ChevronRightIcon, DatabaseIcon, DotIcon, MoreHorizontalIcon, TableIcon } from "lucide-react";
import React, { useEffect } from "react";
import { openDialog } from "../dialog";
import { DialogType } from "@/types/dialog";
import { openView } from "@/api/view";
import { ViewType } from "@/types/view";
export interface IExplorerDbRow {
  name: string;
  type: "database" | "table"|"tables"|"columns"|"indexes"|"triggers"|"functions"|"procedures"|"views",
  expand?: boolean;
  description?: string;
}
export function ExplorerDbCP(props:{
  isVisible:boolean;
}) {
  const [rows, setRows] = React.useState<IExplorerDbRow[]>([]);
  const [databases, setDatabases] = React.useState<IDataBase[]>([]);
  function calcRows() {
    const _rows:IExplorerDbRow[] = [];
    databases.forEach(db => {
      _rows.push({
        name: db.Database,
        type: "database",
        expand: db.expand,

      });
      if(db.expand){
        // console.log("db.expand",db.expand);
        _rows.push({
          name: "Tables",
          type: "tables",
       
        });
        db.tables&&db.tables.forEach(tab=>{
          _rows.push({
            name: tab.TABLE_NAME,
            type: "table",
            
            description: tab.TABLE_COMMENT
          });
        })
      }
    });
    console.log("databases",databases);
    console.log("calcRows",_rows);  
    setRows(_rows);
  }
  useEffect(() => {
    calcRows();
  }, [databases]); 
  useEffect(() => {
    const getDatabasesing = (res:ISqlResult) => {
      console.log("getDatabasesing",res);
      if(res.status=="success"){
        setDatabases((pre)=>res.data.data as IDataBase[]);
      }
    
    }
    window.api.on("db:getDatabasesing", getDatabasesing);
    const getTablesing = (res:ISqlResult) => {
      console.log("getTablesing",res);
      if(res.status==="success"){
        const tables=res.data.data as IDataBaseTable[];
        console.log("tables",tables);
        if(tables.length>0){
          const TABLE_SCHEMA=tables[0].TABLE_SCHEMA;
          // 添加空值检查并创建新数组来更新状态
          setDatabases(prevDbs => {
            const newDbs = [...prevDbs];
            const database = newDbs.find(db => db.Database === TABLE_SCHEMA);
            console.log("database",database);
            if (database) {
              database.tables = tables;
              database.expand = true;
            }
            console.log("newDbs",newDbs);
            return newDbs;
          });
        }
      }
    }
    window.api.on("db:getTablesing", getTablesing);
    const explorer_db_actioning=(params:any)=>{
      console.log("explorer-db-actioning",params);
      if(params.command==="addDatabase"){
        openDialog({
          type:DialogType.AddDatabase,
          params:params.params
        })
      }else if(params.command==="deleteDatabase"){
        openDialog({
          type:DialogType.DeleteDatabase,
          params:params.params
        })
      }
      else if(params.command==="addTable"){
        openView({
          type:ViewType.Table,
          params:{
            database:params.params.database,
        
          },
          path:[params.params.database]
        });
       
      }else if (params.command === "selectRows") {
        openView({
          type: ViewType.Sql,
          name: params.params.table+" Select Rows",
          params: {
            sql: `SELECT * FROM ${params.params.table} limit 100`,
            // database: params.params.database,
            // table: params.params.table,
          },
          path: [params.params.database, params.params.table]
        });
      }else if(params.command==="alterTable"){
        openView({
          type:ViewType.Table,
          name:"Alter "+params.params.table,
          params:{
            table:params.params.table
          },
          path:[params.params.database]
        });
       
      }
    }
    window.api.on("explorer:db-actioning",explorer_db_actioning);

    return ()=>{
      window.api.removeListener("db:getDatabasesing", getDatabasesing);
      window.api.removeListener("db:getTablesing", getTablesing);
      window.api.removeAllListeners("explorer:db-actioning");
    }
  }, []);
  return <div className="h-full w-full  flex-col"
    style={{
      display: props.isVisible ? "flex" : "none"
    }}
  >
    <div className="text-sm flex items-center flex-shrink-0 ">
      <div className="text-sm font-bold">
        Databases
      </div>
      <div className="flex-1"></div>
      <Button variant={"ghost"} size={"icon"} className="w-[28px] h-[28px] m-[0px]"
        onClick={()=>{
          openMenu({
            channel:"explorer:db-actioning",
            items:[
              {
                name:"Add Database",
                command:"addDatabase"
              }
            ]
          })
        }}
      
      >
        <MoreHorizontalIcon size={14}></MoreHorizontalIcon>
      </Button>
    </div>
    {/* <ScrollArea className="flex-1">
      <ScrollBar orientation="vertical" />
      

    </ScrollArea> */}
    <VirtualList items={rows}  estimateHeight={32} renderItem={(item: IExplorerDbRow, i: number) => {
      return <div className="flex items-center gap-[5px] h-[32px] hover:bg-accent rounded-lg select-none text-sm "
        onClick={()=>{
          console.log("item",item);
          if(item.type==="database"){
            
            if(item.expand){
              console.log("item.expand",item.expand);
        
              setDatabases(prevDbs => {
                console.log("prevDbs");
                const newDbs = [...prevDbs];
                const database = newDbs.find(db => db.Database === item.name);
                console.log("database",database);
                if (database) {
                  database.expand = false;
                }
                return newDbs;
              });
            }else{
              window.api.send("db:selectDatabase",item.name);
            }
          }
        
        }}
      
        onContextMenu={()=>{

          if(item.type=="database"){
            openMenu({
              channel:"explorer:db-actioning",
              params:{
                database:item.name
              },
              items:[
                {
                  name:"Add Table",
                  command:"addTable"
                }
                ,{
                  type:"separator"
                },
                {
                  name:"Alter Database",
                  command:"alterDatabase"
                },
                {
                  name:"Drop Database",
                  command:"deleteDatabase"
                },{
                  type:"separator"
                }
                ,{
                  name:"Export Database",
                  command:"exportDatabase"
                },{
                   name:"Import Database",
                  command:"importDatabase"
                }
               
              ]
            })
          }else  if(item.type=="table"){
            openMenu({
              channel:"explorer:db-actioning",
              params:{
            
                table:item.name
              },
              items:[
                {
                  name:"Select Rows",
                  command:"selectRows"
                },{
                  type:"separator"
                },
                {
                  name:"Alter Table",
                  command:"alterTable"
                }
                ,
                {
                  name:"Drop Table",
                  command:"deleteTable"
                },{
                  type:"separator"
                }
                ,{
                  name:"Export Table",
                  command:"exportTable"
                },{
                   name:"Import Table",
                  command:"importTable"
                }
               
              ]
            })
          }



       
        }}
      >
        {/* <div className="w-[32px] h-[32px] rounded-md bg-amber-800"></div> */}

        {item.type === "database" && <>
          <div
            className="flex-shrink-0"
            style={{
              width:2
            }}
          >
          </div>
          {item.expand ? <ChevronDownIcon size={14} className="flex-shrink-0" /> : <ChevronRightIcon size={14} className="flex-shrink-0" />}
          <DatabaseIcon size={14} className="flex-shrink-0" />
        </>}
        {item.type === "table" && <>
          <div
            className="flex-shrink-0"
            style={{
              width: 14
            }}
          >
          </div>
          <DotIcon size={14} className="flex-shrink-0" />
          <TableIcon size={14} className="flex-shrink-0" />
        </>}
    
        <div className="flex-1 text-ellipsis text-nowrap">
          {item.name} <span className="text-muted-foreground">{item.description}</span>
        </div>
      </div>

    }} />

  </div>
}