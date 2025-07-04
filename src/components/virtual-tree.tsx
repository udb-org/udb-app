import React, { useEffect } from "react";
import VirtualList from "./virtual-scroll";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CircleXIcon,
  DotIcon,
  FileIcon,
  FolderClosedIcon,
  FolderIcon,
  FolderOpenIcon,
  LoaderIcon,
} from "lucide-react";
import { cn } from "@/utils/tailwind";
import { Popover, PopoverContent } from "./ui/popover";
import { Dialog, DialogContent, DialogOverlay } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { useTranslation } from "react-i18next";
export interface IVirtualTreeItem {
  name: string;
  isFolder: boolean;
  expand?: boolean;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  children?: IVirtualTreeItem[];
  icon?: React.ReactNode;
  data?: any;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  isSeparator?: boolean;
  noChildren?: boolean;

}
interface IVirtualTreeRow {
  name: string;
  isFolder: boolean;
  expand?: boolean;
  icon?: React.ReactNode;
  level: number;
  path: string[];
  description?: string;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isSeparator?: boolean;
  noChildren?: boolean;

}
/**
 * 虚拟树组件
 *
 * @param props
 * @returns
 */
export function VirtualTree(props: {
  data?: IVirtualTreeItem[];
  onLoad?: (path: string[]) => Promise<IVirtualTreeItem[]>;
  onRowClick?: (row: IVirtualTreeRow) => void;
  onRowContextMenu?: (row: IVirtualTreeRow) => void;
  onRowRename?: (row: IVirtualTreeRow, newName: string) => boolean;
  onRowPreview?: (row: IVirtualTreeRow) => void;

}) {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<IVirtualTreeItem[]>([]);
  useEffect(() => {
    if (props.data) {
      setItems(props.data);
    }
  }, [props.data]);
  const [rows, setRows] = React.useState<IVirtualTreeRow[]>([]);
  const [selectedRow, setSelectedRow] = React.useState<IVirtualTreeRow>();
  /**
   * 转换items为rows
   *
   * @param items
   */
  function transformItems(
    items: IVirtualTreeItem[],
    parentPath: string[] = [],
  ) {
    const _rows: IVirtualTreeRow[] = [];
    items.forEach((item) => {
      const _path = [...parentPath, item.name];
      _rows.push({
        name: item.name,
        isFolder: item.isFolder,
        expand: item.expand,
        icon: item.icon,
        level: _path.length - 1,
        path: _path,
        description: item.description,
        expandIcon: item.expandIcon,
        collapseIcon: item.collapseIcon,
        isLoading: item.isLoading,
        isError: item.isError,
        isSeparator: item.isSeparator,
        noChildren: item.noChildren,

      });
      if (item.isFolder && item.expand && item.children) {
        const _sub_rows = transformItems(item.children, _path);
        _rows.push(..._sub_rows);
      }
    });
    // console.log("rows", _rows);
    return _rows;
  }
  /**
   * 监听items变化
   */
  useEffect(() => {
    const _rows = transformItems(items);
    setRows(_rows);
  }, [items]);
  /**
   * 更新items
   * @param parentPath
   * @param _items
   */
  function updateItems(
    parentPath: string[],
    _items: IVirtualTreeItem[],
    expand: boolean,
  ) {
    //从items中找到parentPath对应的item，需要递归更新children
    if (parentPath.length == 1) {
      let _parent = items.find((item) => item.name === parentPath[0]);
      if (_parent) {
        _parent.children = _items;
        _parent.expand = expand;
      }
      setItems([...items]);
    } else if (parentPath.length > 1) {
      let _parent = items.find((item) => item.name === parentPath[0]);
      if (_parent) {
        _updateItems(_parent, parentPath, 1, _items, expand);
        setItems([...items]);
      }
    }
  }
  /**
   * 递归更新items
   * @param parent
   * @param path
   * @param _items
   */
  function _updateItems(
    parent: IVirtualTreeItem,
    parentPath: string[],
    index: number,
    _items: IVirtualTreeItem[],
    expand: boolean,
  ) {
    if (parent.children) {
      let _parent = parent.children.find(
        (item) => item.name === parentPath[index],
      );
      if (_parent) {
        if (index == parentPath.length - 1) {
          _parent.children = _items;
          _parent.expand = expand;
        } else {
          _updateItems(_parent, parentPath, index + 1, _items, expand);
        }
      }
    }
  }
  /**
   * 更新item名称
   *
   * @param parent
   * @param parentPath
   * @param index
   * @param name
   */
  function _updateItemName(
    parent: IVirtualTreeItem,
    parentPath: string[],
    index: number,
    name: string,
  ) {
    if (parent.children) {
      let _parent = parent.children.find(
        (item) => item.name === parentPath[index],
      );
      if (_parent) {
        if (index == parentPath.length - 1) {
          _parent.name = name;
        } else {
          _updateItemName(_parent, parentPath, index + 1, name);
        }
      }
    }
  }
  /**
   * 点击行
   */
  function onClickRow(row: IVirtualTreeRow) {
    console.log("onClickRow", row);
    if (props.onRowClick) {
      props.onRowClick(row);
    }
    if (row.isFolder) {
      if (row.expand) {
        row.expand = false;
      } else {
        row.expand = true;
      }
      if (row.expand) {
        if (props.onLoad) {
          const out = setTimeout(() => {
            updateItems(row.path, [{
              name: "loading...",
              isFolder: false,
              isLoading: true,
            }], true);
          }, 50);
          props.onLoad(row.path).then((_items: IVirtualTreeItem[]) => {
            clearTimeout(out);
            updateItems(row.path, _items, true);
          });
        }
      } else {
        updateItems(row.path, [], false);
      }
    } else {
      // 打开文件
      console.log("打开文件", row.path);
    }
  }
  const [showPreview, setShowPreview] = React.useState(false);
  const [showRename, setShowRename] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");
  /**
   * 重命名完成
   *
   * @param row
   */
  function handleRenamed(row: IVirtualTreeRow) {
    setShowRename(false);
    if (props.onRowRename) {
      if (props.onRowRename(row, renameValue)) {
        //设置value
        if (row.path.length == 1) {
          let _parent = items.find((item) => item.name === row.path[0]);
          if (_parent) {
            _parent.name = renameValue;
          }
          setItems([...items]);
        } else {
          items.forEach((item) => {
            if (item.name === row.path[0]) {
              _updateItemName(item, row.path, 1, renameValue);
            }
          });
          setItems([...items]);
        }
      }
    }
  }
  return (
    <>
      <VirtualList
        items={rows}
        estimateHeight={24}
        renderItem={(row: IVirtualTreeRow, i: number) => (
          <div
            className={cn(
              "flex h-[24px] items-center gap-[5px] rounded-lg text-sm whitespace-nowrap select-none",
              selectedRow &&
              selectedRow.path.join("/") == row.path.join("/") &&
              "bg-accent",
              (row.isLoading || row.isError || row.isSeparator || row.noChildren) ? "" : "hover:bg-accent"
            )}
            tabIndex={i}
            onKeyDown={(e) => {
              if (row.isLoading || row.isError || row.isSeparator || row.noChildren) {
                return;
              }
              if (e.code === "Enter" && props.onRowRename) {
                //如果是enter键，启动重命名
                console.log("启动重命名", row.path);
                if (showRename) {
                  handleRenamed(row);
                } else {
                  setRenameValue(row.name);
                  setShowRename(true);
                }
              } else if (e.code === "Space" && props.onRowPreview) {
                //如果是空格键,显示预览
                console.log("显示预览", row.path);
                if (showPreview) {
                  setShowPreview(false);
                } else {
                  setShowPreview(true);
                }
              }
            }}
            onClick={() => {
              if (row.isLoading || row.isError || row.isSeparator || row.noChildren) {
                return;
              }
              if (showRename && selectedRow) {
                handleRenamed(selectedRow);
              }
              setSelectedRow(row);
              onClickRow(row);
            }}
            onContextMenu={() => {
              if (row.isLoading || row.isError || row.isSeparator || row.noChildren) {
                return;
              }
              setSelectedRow(row);
              if (props.onRowContextMenu) {
                props.onRowContextMenu(row);
              }
            }}
          >
            {
              //level
            }
            {
              Array(row.level).fill(0).map((item, index) => (
                <div
                  key={index}
                  // style={{ width: 14 }}
                  className="flex-shrink-0 border-r border-foreground/10 h-full pr-[7px] w-[7px]"
                >
                  
                </div>
              ))
            }
            {/* <div
              style={{ width: row.level * 14 }}
              className="flex-shrink-0"
            ></div> */}
            {row.isLoading && (
              <LoaderIcon className="w-[14px] h-[14px] animate-spin ml-2" />
            )}
            {row.isError && (
              <CircleXIcon className="w-[14px] h-[14px] ml-2 text-destructive" />
            )}
            {row.isSeparator && (
              <Separator className="w-full" />
            )}
            {row.noChildren && (
              <div className="text-xs ml-2">{t("tree.no.children")}</div>
            )}
            {!row.noChildren && !row.isLoading && !row.isError && !row.isSeparator && (
              <>
                {
                  //icon
                }
                {row.isFolder && (
                  <>
                    {row.expand ? (
                      <ChevronDownIcon size={14} className="flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon size={14} className="flex-shrink-0" />
                    )}
                    {row.expand ? (
                      row.expandIcon ? (
                        row.expandIcon
                        // <row.expandIcon size={14} className="flex-shrink-0" />
                      ) : (
                        <FolderOpenIcon size={14} className="flex-shrink-0" />
                      )
                    ) : (
                      row.collapseIcon ? (
                        row.collapseIcon
                      ) : (
                        <FolderIcon size={14} className="flex-shrink-0" />
                      )
                    )}
                  </>
                )}
                {!row.isFolder && (
                  <>
                    <div className="bg-accent-foreground/5 mr-1 ml-1 h-2 w-2 flex-shrink-0 rounded-full"></div>
                    {row.icon && row.icon}
                    {/* {!row.icon && <FileIcon size={14} className="flex-shrink-0" />} */}
                  </>
                )}
                {props.onRowRename &&
                  showRename &&
                  selectedRow?.path.join("/") == row.path.join("/") && (
                    <>
                      <Input
                        className="px-0 shadow-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        autoFocus
                        value={renameValue}
                        onChange={(e) => {
                          setRenameValue(e.target.value);
                        }}
                      />
                    </>
                  )}
                {(!props.onRowRename ||
                  !showRename ||
                  selectedRow?.path.join("/") != row.path.join("/")) && (
                    <>
                      <div>{row.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {row.description}
                      </div>
                    </>
                  )}
              </>
            )}


          </div>
        )}
      ></VirtualList>
      {showPreview && (
        <div
          className="bg-background/20 fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center"
          tabIndex={100}
          onKeyDown={(e) => {
            if (showRename && selectedRow) {
              handleRenamed(selectedRow);
            }
          }}
          onMouseDown={(e) => {
            if (showRename && selectedRow) {
              handleRenamed(selectedRow);
            }
          }}
        >
          <div className="bg-card min-h-[200px] min-w-[300px] rounded-lg border shadow-lg">
            <div className="p-2">{selectedRow && selectedRow.name}</div>
            <Separator />
            <div className="p-2"></div>
          </div>
        </div>
      )}
    </>
  );
}
