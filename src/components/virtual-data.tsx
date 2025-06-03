/**
 * 虚拟电子表格
 *
 *
 * 1. 虚拟滚动
 * 2.支持大量数据
 * 3.支持列宽、行高调整
 * 4.支持多选单元格
 * 5.支持复制到剪切板
 * 6.支持拖拽
 *
 *
 */
import React, { useEffect, useRef } from "react";
import VirtualList from "./virtual-scroll";
import { cn } from "@/utils/tailwind";
import * as d3 from "d3";
import { Button } from "./ui/button";
import {
  ArrowDownAZIcon,
  ArrowDownNarrowWideIcon,
  ArrowUpDownIcon,
  ArrowUpNarrowWideIcon,
  ArrowUpZAIcon,
  ChartBarIcon,
  ChartPieIcon,
  DownloadIcon,
  FunnelPlus,
  RecycleIcon,
  SaveIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { SiIcon } from "@icons-pack/react-simple-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "./ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
export function VirtualData(props: { source: any; height?: number }) {
  const [data, setData] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<any[]>([]);
  //容器
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useRef(0);
  const containerHeight = useRef(0);
  useEffect(() => {
    //清楚状态
    setScrollTop(0);
    setScrollLeft(0);
    setRowCount(0);
    setRowNoWidth(0);
    setRowHeights([]);
    setRowTops([]);
    setColumnWidths([]);
    setColumnLefts([]);
    setSelectRange(null);
    setFilterColumn(null);
    setFilterValue("");
    setFilterValues([]);
    setFilterSelected([]);
    setFilterShowValues([]);
    setSortType("null");
    if (selectSvgRef.current) {
      selectSvgRef.current.style.display = "none";
    }
    if (colLineRef.current) {
      colLineRef.current.style.display = "none";
    }
    if (rowLineRef.current) {
      rowLineRef.current.style.display = "none";
    }
    if (textareaRef.current) {
      textareaRef.current.style.display = "none";
    }
    if (props.source.columns) {
      setColumns(props.source.columns);
    }
    if (props.source.data) {
      setData([...props.source.data]);
    }
  }, [props.source]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // 使用 ResizeObserver 监听容器高度变化
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        containerWidth.current = entry.contentRect.width;
        containerHeight.current = entry.contentRect.height;
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (data.length == 0) {
      return;
    }
    const rowCount = data.length;
    setRowCount(rowCount);
    let _rowNoWidth = String(rowCount).length * 8;
    if (_rowNoWidth < 20) {
      _rowNoWidth = 20;
    }
    setRowNoWidth(_rowNoWidth);
    const rowHeights = new Array(rowCount).fill(26);
    setRowHeights(rowHeights);
    const columnCount = columns.length;
    const columnWidths = new Array(columnCount).fill(100);
    if (canvasRef.current) {
      const ctx: any = canvasRef.current.getContext("2d");
      ctx.font = "13px Monaco";
      let maxText = new Array(columnCount).fill("");
      for (let i = 0; i < 5 && i < data.length; i++) {
        for (let j = 0; j < columnCount; j++) {
          const val = data[i][columns[j].columnName];
          if (val && val.toString().length > maxText[j].length) {
            maxText[j] = val.toString();
          }
        }
      }
      //计算列宽
      for (let i = 0; i < maxText.length; i++) {
        const val = maxText[i];
        if (val) {
          const textWidth = ctx.measureText(val).width;
          if (textWidth > 300) {
            columnWidths[i] = 300;
            continue;
          }
          columnWidths[i] = textWidth + 10;
        }
      }
      //加粗
      ctx.font = "14px Monaco Bold";
      for (let j = 0; j < columnCount; j++) {
        const val = columns[j].columnLable;
        if (val) {
          const textWidth = ctx.measureText(val).width;
          if (textWidth > columnWidths[j]) {
            columnWidths[j] = textWidth + 20;
          }
        }
      }
    }
    setColumnWidths(columnWidths);
    //计算行高
    const rowTops = new Array(rowCount).fill(0);
    for (let i = 0; i < rowCount; i++) {
      rowTops[i] = i * 26;
    }
    setRowTops(rowTops);
    //计算列宽
    const columnLefts = new Array(columnCount).fill(0);
    let left = 0;
    for (let i = 0; i < columnCount; i++) {
      columnLefts[i] = left;
      left += columnWidths[i];
    }
    console.log("columnLefts", columnLefts);
    setColumnLefts(columnLefts);
    requestIdleCallback(() => {
      //重新计算可视范围
      setVisibleCounter(visibleCounter + 1);
      handleWheel();
    });
  }, [data, columns]);
  const [rowNoWidth, setRowNoWidth] = React.useState<number>(20);
  //行数
  const [rowCount, setRowCount] = React.useState(0);
  //行高
  const [rowHeights, setRowHeights] = React.useState<number[]>([]);
  const [rowTops, setRowTops] = React.useState<number[]>([]);
  //列宽
  const [columnWidths, setColumnWidths] = React.useState<number[]>([]);
  const [columnLefts, setColumnLefts] = React.useState<number[]>([]);
  //滚动
  const [scrollTop, setScrollTop] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [visibleCounter, setVisibleCounter] = React.useState(0);
  //可视部分
  //可视行
  const [startRowIndex, endRowIndex, rowTotalHeight] = React.useMemo(() => {
    console.log("rowHeights", rowHeights);
    console.log(rowHeights.reduce((a, b) => a + b, 0));
    const rowTotalHeight = rowHeights.reduce((a, b) => a + b, 0);
    console.log("rowTotalHeight", rowTotalHeight);
    let startRowIndex = 0;
    //查找开始的行
    for (let i = 0; i < rowCount; i++) {
      if (rowTops[i] + rowHeights[i] > scrollTop) {
        startRowIndex = i;
        break;
      }
    }
    // 查找结束的行
    let endRowIndex = startRowIndex;
    for (let i = startRowIndex; i < rowCount; i++) {
      if (i == rowCount - 1) {
        endRowIndex = i;
        break;
      }
      if (rowTops[i] > containerHeight.current + rowTops[startRowIndex]) {
        endRowIndex = i;
        if (endRowIndex + 1 < rowCount) {
          endRowIndex++;
        }
        break;
      }
    }
    console.log("可视行", startRowIndex, endRowIndex + 1, rowTotalHeight);
    //返回可视部分的行和高度
    return [startRowIndex, endRowIndex + 1, rowTotalHeight];
  }, [visibleCounter, rowCount, scrollTop, containerHeight.current]);
  //可视列
  const [startColumnIndex, endColumnIndex, colTotalWidth] =
    React.useMemo(() => {
      const colTotalWidth = columnWidths.reduce((a, b) => a + b, 0);
      let startColumnIndex = 0;
      const columnCount = columnWidths.length;
      //查找开始的列
      for (let i = 0; i < columnCount; i++) {
        if (columnLefts[i] + columnWidths[i] > scrollLeft) {
          startColumnIndex = i;
          break;
        }
      }
      let endColumnIndex = startColumnIndex;
      for (let i = startColumnIndex; i < columnCount; i++) {
        if (i == columnCount - 1) {
          endColumnIndex = i;
          break;
        }
        if (
          columnLefts[i] + columnWidths[i] >
          columnLefts[startColumnIndex] + containerWidth.current
        ) {
          endColumnIndex = i;
          if (endColumnIndex + 1 < columnCount) {
            endColumnIndex++;
          }
          break;
        }
      }
      console.log(
        "可视列",
        startColumnIndex,
        endColumnIndex + 1,
        colTotalWidth,
      );
      return [startColumnIndex, endColumnIndex + 1, colTotalWidth];
    }, [visibleCounter, scrollLeft, containerWidth.current]);
  function handleWheel() {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      setScrollLeft(containerRef.current.scrollLeft);
    }
  }
  //选择
  const [selectRange, setSelectRange] = React.useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const selectSvgRef = useRef<SVGSVGElement>(null);
  //监听选择
  useEffect(() => {
    if (selectRange) {
      //获得坐标
      const x0 = columnLefts[selectRange.x0];
      const y0 = rowTops[selectRange.y0];
      const x1 = columnLefts[selectRange.x1] + columnWidths[selectRange.x1];
      const y1 = rowTops[selectRange.y1] + rowHeights[selectRange.y1];
      console.log("selectRange", x0, y0, x1, y1);
      if (selectSvgRef.current) {
        selectSvgRef.current.style.left = x0 - 1 + "px";
        selectSvgRef.current.style.top = y0 - 1 + "px";
        selectSvgRef.current.style.width = x1 - x0 + 1 + "px";
        selectSvgRef.current.style.height = y1 - y0 + 1 + "px";
        //使用d3画出选择区域
        const selectSvg = d3.select(selectSvgRef.current);
        selectSvg.selectAll("rect").remove();
        selectSvg
          .append("rect")
          .attr("x", 1)
          .attr("y", 1)
          .attr("width", x1 - x0 - 1)
          .attr("height", y1 - y0 - 1)
          .attr("stroke", "var(--color-violet-500)")
          .attr("fill", "none")
          .attr("stroke-width", 2)
          //圆角
          .attr("rx", 2);
      }
    }
    //监听快捷键Ctrl+C
    const handleKeyDown = (event: KeyboardEvent) => {
      //复制 windows快捷键 Ctrl+C Mac快捷键 Command+C
      console.log(event.metaKey, event.key);
      if (event.metaKey && event.key === "c") {
        console.log(
          "Ctrl+C",
          selectSvgRef.current && selectSvgRef.current.style.display,
        );
        //复制
        if (
          selectSvgRef.current &&
          selectSvgRef.current.style.display === "block" &&
          selectRange
        ) {
          //复制选中的内容
          let text = "";
          for (let j = selectRange.y0; j <= selectRange.y1; j++) {
            const rowData = [];
            for (let i = selectRange.x0; i <= selectRange.x1; i++) {
              const col = columns[i];
              rowData.push(data[j][col.columnName]);
            }
            text += rowData.join("\t") + "\n";
          }
          //复制到剪切板
          navigator.clipboard.writeText(text);
        }
      }
      //粘贴 windows快捷键 Ctrl+V Mac快捷键 Command+V
      if (event.metaKey && event.key === "v") {
        console.log("Ctrl+V");
        //粘贴
        if (
          selectSvgRef.current &&
          selectSvgRef.current.style.display === "block" &&
          selectRange
        ) {
          //获取剪切板内容
          navigator.clipboard.readText().then((text) => {
            //解析剪切板内容
            const rows = text.split("\r\n");
            for (let r = 0; r < rows.length; r++) {
              const rowData = rows[r].split("\t");
              for (let c = 0; c < rowData.length; c++) {
                const i = r + selectRange.y0;
                const j = c + selectRange.x0;
                if (i >= 0 && i < data.length && j >= 0 && j < columns.length) {
                  data[i][columns[j].columnName] = rowData[c];
                }
              }
            }
            setData(data);
            //重新计算可视范围
            setVisibleCounter(visibleCounter + 1);
            handleWheel();
          });
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectRange]);
  const colLineRef = useRef<HTMLDivElement>(null);
  const rowLineRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  //排序
  const [sortType, setSortType] = React.useState<"asc" | "desc" | "null">(
    "null",
  );
  //筛选
  const [filterColumn, setFilterColumn] = React.useState<any>(null);
  const [filterValue, setFilterValue] = React.useState<string>("");
  const [filterValues, setFilterValues] = React.useState<string[]>([]);
  const [filterShowValues, setFilterShowValues] = React.useState<string[]>([]);
  const [filterValueCounts, setFilterValueCounts] = React.useState<
    Map<string, number>
  >(new Map());
  //选择项
  const [filterSelected, setFilterSelected] = React.useState<string[]>([]);
  return (
    <div
      className="flex h-full w-full flex-col text-sm"
      style={{
        height: props.height,
      }}
    >
      <div className="flex h-[26px] w-full flex-shrink-0 items-center gap-1">
        {
          //工具栏
        }
        {
          //排序
        }
        <Button
          variant={"ghost"}
          size={"sm"}
          className="h-6 w-6 p-[5px]"
          onClick={() => {
            //更具选中的第一列进行排序
            if (selectRange) {
              const column = columns[selectRange.x0];
              if (column) {
                const columnName = column.columnName;
                const columnType = column.columnTypeName;
                console.log("columnName", columnName);
                console.log("columnType", columnType);
                let _sortType: "asc" | "desc" | "null" = "null";
                if (sortType === "null") {
                  _sortType = "asc";
                } else if (sortType === "asc") {
                  _sortType = "desc";
                } else {
                  _sortType = "null";
                }
                setSortType(_sortType);
                if (_sortType === "null") {
                  //不排序
                  setData([...props.source.data]);
                } else {
                  //排序
                  const sortedData = data.sort((a, b) => {
                    const valA = a[columnName];
                    const valB = b[columnName];
                    //数字类型
                    const numberTypes = [
                      "DOUBLE",
                      "INTEGER",
                      "DECIMAL",
                      "FLOAT",
                      "NUMERIC",
                      "INT",
                      "BIGINT",
                      "SMALLINT",
                      "TINYINT",
                    ];
                    if (numberTypes.includes(columnType)) {
                      if (_sortType === "asc") {
                        return Number(valA) - Number(valB);
                      } else {
                        return Number(valB) - Number(valA);
                      }
                    } else {
                      if (_sortType === "asc") {
                        return String(valA).localeCompare(String(valB));
                      } else {
                        return String(valB).localeCompare(String(valA));
                      }
                    }
                  });
                  console.log("sortedData", sortedData); //更新数据
                  console.log("props.source.data", props.source.data); //更新数据
                  setData(sortedData);
                }
                //重新计算可视范围
                setVisibleCounter(visibleCounter + 1);
                handleWheel();
              }
            }
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {sortType === "null" && <ArrowUpDownIcon size={12} />}
                  {sortType === "asc" && <ArrowDownAZIcon size={12} />}
                  {sortType === "desc" && <ArrowUpZAIcon size={12} />}
                </div>
                {/* <ArrowDownNarrowWideIcon /> */}
              </TooltipTrigger>
              <TooltipContent>
                <p>Sort Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
        {
          //筛选
        }
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-6 w-6 p-[5px]"
              onClick={() => {
                //更具选中的第一列进行筛选
                if (selectRange) {
                  const column = columns[selectRange.x0];
                  if (column) {
                    const columnName = column.columnName;
                    const columnType = column.columnTypeName;
                    console.log("columnName", columnName);
                    //设置排序的列
                    setFilterColumn(column);
                    //设置筛选的值
                    setFilterSelected([]);
                    setFilterValue("");
                    //统计该列的所有值及其数量,并去重
                    const _values = props.source.data.map(
                      (item) => item[columnName],
                    );
                    const _valueCounts = new Map<string, number>();
                    for (const value of _values) {
                      if (_valueCounts.has(value)) {
                        _valueCounts.set(value, _valueCounts.get(value) + 1);
                      } else {
                        _valueCounts.set(value, 1);
                      }
                    }
                    const _values2 = _values.filter(
                      (item, index, self) => self.indexOf(item) === index,
                    );
                    //设置筛选的值
                    setFilterShowValues(_values2);
                    setFilterValues(_values2);
                    setFilterValueCounts(_valueCounts);
                    console.log("filterValues", _values2);
                    console.log("filterValueCounts", _valueCounts);
                  }
                }
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FunnelPlus />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter Data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex">
              <div className="flex-1">
                Filter By{" "}
                <span className="text-primary font-bold">
                  {filterColumn && filterColumn.columnLable}
                </span>
              </div>
            </div>
            <Separator />
            <div className="mt-1 space-y-1">
              <Input
                placeholder="filter"
                className="shadow-none"
                value={filterValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterValue(val);
                  //过滤
                  const _values = filterValues.filter((item) =>
                    item.includes(val),
                  );
                  setFilterShowValues(_values);
                }}
              />
            </div>
            <div className="mt-1 space-y-1 whitespace-nowrap">
              <Button
                variant={"ghost"}
                size={"sm"}
                className="h-6 p-[5px] text-sm"
                onClick={() => {
                  //选择所有
                  setFilterSelected(filterShowValues);
                }}
              >
                All{" "}
                <span className="text-muted-foreground">
                  ({filterShowValues.length})
                </span>
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                className="h-6 p-[5px] text-sm"
                onClick={() => {
                  //反选
                  const selected = filterShowValues.filter(
                    (item) => !filterSelected.includes(item),
                  );
                  setFilterSelected(selected);
                }}
              >
                Invert
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                className="h-6 p-[5px] text-sm"
                onClick={() => {
                  //选择重复项
                  const selected = filterShowValues.filter(
                    (item) => filterValueCounts.get(item) > 1,
                  );
                  setFilterSelected(selected);
                }}
              >
                Duplicate
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                className="h-6 p-[5px] text-sm"
                onClick={() => {
                  //选择唯一项
                  const selected = filterShowValues.filter(
                    (item) => filterValueCounts.get(item) === 1,
                  );
                  setFilterSelected(selected);
                }}
              >
                Unique
              </Button>
              <Button
                variant={"ghost"}
                size={"sm"}
                className="h-6 p-[5px] text-sm"
                onClick={() => {
                  //清空
                  setFilterSelected([]);
                }}
              >
                Clear
              </Button>
            </div>
            <div className="h-[300px]">
              <VirtualList
                items={filterShowValues}
                estimateHeight={26}
                renderItem={(item: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className="flex h-[26px] items-center gap-2"
                    >
                      <div className="w-[4px]"></div>
                      <Checkbox
                        className="shadow-none"
                        checked={filterSelected.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilterSelected([...filterSelected, item]);
                          } else {
                            setFilterSelected(
                              filterSelected.filter((i) => i !== item),
                            );
                          }
                        }}
                      />
                      <div className="no-wrap overflow-hidden whitespace-nowrap">
                        {item}
                      </div>
                      <div className="text-muted-foreground">
                        ({filterValueCounts.get(item)})
                      </div>
                    </div>
                  );
                }}
              ></VirtualList>
            </div>
            <div className="mt-1 flex items-center">
              <div className="flex-1"></div>
              <div>
                <Button
                  size={"sm"}
                  className="h-6 p-[5px] text-sm"
                  onClick={() => {
                    //按照选中的项进行筛选
                    if (filterSelected.length > 0) {
                      const filteredData = props.source.data.filter(
                        (item: any) =>
                          filterSelected.includes(
                            item[filterColumn.columnName],
                          ),
                      );
                      setData(filteredData);
                    }
                  }}
                >
                  确定
                </Button>
              </div>{" "}
            </div>
          </PopoverContent>
        </Popover>
        {
          //chart
        }
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-6 w-6 p-[5px]"
              onClick={() => {}}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ChartPieIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show Pie Chart</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          </PopoverTrigger>
          <PopoverContent>ada</PopoverContent>
        </Popover>
        {
          //Ai
        }
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-6 w-6 p-[5px]"
              onClick={() => {}}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SiIcon className="text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>UDB Analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          </PopoverTrigger>
          <PopoverContent>ada</PopoverContent>
        </Popover>
        <div className="flex-1"></div>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="h-6 w-6 p-[5px]"
          onClick={() => {
            //将data数据导出为csv文件
            const csvContent =
              "data:text/csv;charset=utf-8," +
              columns.map((col) => `"${col.columnLable}"`).join(",") +
              "\n" +
              data
                .map((row) =>
                  Object.values(row)
                    .map(
                      (value: any) =>
                        `"${value.toString().replace(/"/g, '""')}"`,
                    )
                    .join(","),
                )
                .join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "data.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DownloadIcon />
              </TooltipTrigger>
              <TooltipContent>
                <p>Download Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="h-6 w-6 p-[5px]"
          onClick={() => {
            //对比data数据和props.source数据,找出有变化的单元格
            const changedCells: {
              row: number;
              col: number;
              oldValue: any;
              newValue: any;
            }[] = [];
            for (let row = 0; row < data.length; row++) {
              for (let col = 0; col < columns.length; col++) {
                const columnName = columns[col].columnLable;
                if (
                  props.source[row] &&
                  props.source[row][columnName] !== data[row][columnName]
                ) {
                  changedCells.push({
                    row,
                    col,
                    oldValue: props.source[row][columnName],
                    newValue: data[row][columnName],
                  });
                }
              }
            }
            console.log("Changed cells:", changedCells);
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SaveIcon />
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
        <div className="text-muted-foreground">
          {rowCount} 行 {columns.length} 列
        </div>
      </div>
      <div
        className="flex h-[26px] w-full flex-shrink-0 items-center overflow-auto border-b-1"
        style={{
          scrollbarWidth: "none",
        }}
      >
        {
          //表头
        }
        <div
          className="relative h-full"
          style={{
            width: colTotalWidth + 100,
            left: -scrollLeft,
          }}
        >
          {columns.slice(startColumnIndex, endColumnIndex).map((col, index) => (
            <div
              key={index}
              className={cn("absolute h-full flex-1 text-center")}
              style={{
                width: columnWidths[index + startColumnIndex],
                left: columnLefts[index + startColumnIndex] + rowNoWidth,
                top: 0,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("onMouseDown", e);
                if (textareaRef.current) {
                  textareaRef.current.style.display = "none";
                }
                if (selectSvgRef.current) {
                  selectSvgRef.current.style.display = "block";
                }
                const startX = e.clientX;
                //监听是否触发了鼠标拖拽
                let isMove = false;
                const startScrollLeft = scrollLeft + 0;
                const fX: any = containerRef.current?.getBoundingClientRect().x;
                const lX = startX - fX;
                const move = (e: MouseEvent) => {
                  isMove = true;
                  console.log("move", e);
                  const x = e.clientX;
                  const y = e.clientY;
                  const dx = x - startX;
                  const tx = startScrollLeft + lX + dx;
                  const startXIndex = index + startColumnIndex;
                  //计算新的endX和endY
                  let endXIndex = index + startColumnIndex;
                  for (let i = startXIndex; i < columns.length; i++) {
                    if (columnLefts[i] + columnWidths[i] > tx) {
                      endXIndex = i;
                      break;
                    }
                  }
                  setSelectRange({
                    x0: startXIndex,
                    y0: 0,
                    x1: endXIndex,
                    y1: rowCount - 1,
                  });
                };
                const up = (e: MouseEvent) => {
                  console.log("up", e);
                  if (!isMove) {
                    //如果没有触发了鼠标拖拽,则选择当前单元格
                    setSelectRange({
                      x0: index + startColumnIndex,
                      y0: 0,
                      x1: index + startColumnIndex,
                      y1: rowCount - 1,
                    });
                  }
                  document.removeEventListener("mousemove", move);
                  document.removeEventListener("mouseup", up);
                };
                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", up);
              }}
            >
              <div className="flex h-full items-center justify-center">
                <div
                  className="h-full w-[1px] flex-shrink-0"
                  onMouseDown={(e) => {}}
                ></div>
                <div className="flex-1 overflow-hidden font-bold">
                  {col.columnLable}
                </div>
                <div
                  className="bg-background relative right-[0px] z-10 h-full w-[1px] flex-shrink-0 cursor-col-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (selectSvgRef.current) {
                      selectSvgRef.current.style.display = "none";
                    }
                    const startX = e.clientX;
                    const move = (e: MouseEvent) => {
                      const x = e.clientX;
                      if (colLineRef.current) {
                        colLineRef.current.style.display = "block";
                        colLineRef.current.style.left =
                          x -
                          startX +
                          columnLefts[index + startColumnIndex] +
                          columnWidths[index + startColumnIndex] +
                          "px";
                      }
                    };
                    const up = (e: MouseEvent) => {
                      if (colLineRef.current) {
                        colLineRef.current.style.display = "none";
                      }
                      document.removeEventListener("mousemove", move);
                      document.removeEventListener("mouseup", up);
                      const x = e.clientX;
                      const width = x - startX;
                      setColumnLefts(
                        columnLefts.map((item, i) => {
                          if (i > index + startColumnIndex) {
                            return item + width;
                          }
                          return item;
                        }),
                      );
                      setColumnWidths(
                        columnWidths.map((item, i) => {
                          if (i == index + startColumnIndex) {
                            return item + width;
                          }
                          return item;
                        }),
                      );
                      handleWheel();
                    };
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", up);
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-full flex-1 overflow-hidden">
        <div
          className="relative h-full flex-shrink-0 overflow-auto"
          style={{
            width: rowNoWidth,
            scrollbarWidth: "none",
          }}
        >
          {
            //行号
          }
          <div
            className="relative"
            style={{
              height: rowTotalHeight,
              top: -scrollTop,
            }}
          >
            {Array(endRowIndex - startRowIndex)
              .fill(0)
              .map((item, index) => (
                <div
                  key={index}
                  className={cn("absolute border-r-1 border-b-1")}
                  style={{
                    top: rowTops[index + startRowIndex],
                    left: 0,
                    width: rowNoWidth,
                    height: rowHeights[index + startRowIndex],
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    //拖拽选择多行
                    console.log("onMouseDown", e);
                    if (textareaRef.current) {
                      textareaRef.current.style.display = "none";
                    }
                    if (selectSvgRef.current) {
                      selectSvgRef.current.style.display = "block";
                    }
                    const startY = e.clientY;
                    //监听是否触发了鼠标拖拽
                    let isMove = false;
                    const startScrollTop = scrollTop + 0;
                    const fY: any =
                      containerRef.current?.getBoundingClientRect().y;
                    const lY = startY - fY;
                    const move = (e: MouseEvent) => {
                      isMove = true;
                      console.log("move", e);
                      const y = e.clientY;
                      const dy = y - startY;
                      const startYIndex = index + startRowIndex;
                      const ty = startScrollTop + lY + dy;
                      //计算新的endY
                      let endYIndex = startYIndex;
                      for (let i = startYIndex; i < rowCount; i++) {
                        if (rowTops[i] + rowHeights[i] > ty) {
                          endYIndex = i;
                          break;
                        }
                      }
                      setSelectRange({
                        x0: 0,
                        y0: startYIndex,
                        x1: columns.length - 1,
                        y1: endYIndex,
                      });
                    };
                    const up = (e: MouseEvent) => {
                      console.log("up", e);
                      if (!isMove) {
                        //如果没有触发了鼠标拖拽,则选择当前单元格
                        setSelectRange({
                          x0: 0,
                          y0: index + startRowIndex,
                          x1: columns.length - 1,
                          y1: index + startRowIndex,
                        });
                      }
                      document.removeEventListener("mousemove", move);
                      document.removeEventListener("mouseup", up);
                    };
                    document.addEventListener("mousemove", move);
                    document.addEventListener("mouseup", up);
                  }}
                >
                  <div className="flex h-full flex-col">
                    <div className="h-[1px] w-full"></div>
                    <div className="flex flex-1 items-center justify-end pr-1">
                      {index + startRowIndex}
                    </div>
                    <div
                      className="bg-background relative bottom-[-1px] z-10 h-[1px] w-full cursor-row-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (selectSvgRef.current) {
                          selectSvgRef.current.style.display = "none";
                        }
                        const startY = e.clientY;
                        const move = (e: MouseEvent) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const y = e.clientY;
                          if (rowLineRef.current) {
                            rowLineRef.current.style.display = "block";
                            rowLineRef.current.style.top =
                              y -
                              startY +
                              rowTops[index + startRowIndex] +
                              rowHeights[index + startRowIndex] +
                              "px";
                          }
                        };
                        const up = (e: MouseEvent) => {
                          if (rowLineRef.current) {
                            rowLineRef.current.style.display = "none";
                          }
                          document.removeEventListener("mousemove", move);
                          document.removeEventListener("mouseup", up);
                          const y = e.clientY;
                          const height = y - startY;
                          setRowTops(
                            rowTops.map((item, i) => {
                              if (i > index + startRowIndex) {
                                return item + height;
                              }
                              return item;
                            }),
                          );
                          setRowHeights(
                            rowHeights.map((item, i) => {
                              if (i == index + startRowIndex) {
                                return item + height;
                              }
                              return item;
                            }),
                          );
                          handleWheel();
                        };
                        document.addEventListener("mousemove", move);
                        document.addEventListener("mouseup", up);
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div
          className="relative h-full flex-1 overflow-auto"
          ref={containerRef}
          style={{
            scrollbarWidth: "none",
          }}
          onWheel={handleWheel}
        >
          <div
            className="relative z-20"
            style={{
              height: rowTotalHeight / 2,
              width: colTotalWidth + 100,
            }}
          >
            {
              //数据
            }
            {data.slice(startRowIndex, endRowIndex).map((row, rowIndex) => (
              <>
                {columns
                  .slice(startColumnIndex, endColumnIndex)
                  .map((col, columnIndex) => (
                    <div
                      key={columnIndex}
                      className={cn("absolute")}
                      style={{
                        top: rowTops[rowIndex + startRowIndex],
                        left: columnLefts[columnIndex + startColumnIndex],
                        width: columnWidths[columnIndex + startColumnIndex],
                        height: rowHeights[rowIndex + startRowIndex],
                      }}
                      onDoubleClick={(e) => {
                        if (selectSvgRef.current) {
                          selectSvgRef.current.style.display = "none";
                          setSelectRange({
                            x0: columnIndex + startColumnIndex,
                            y0: rowIndex + startRowIndex,
                            x1: columnIndex + startColumnIndex,
                            y1: rowIndex + startRowIndex,
                          });
                        }
                        if (textareaRef.current) {
                          textareaRef.current.value = row[col.columnName];
                          textareaRef.current.style.display = "block";
                          textareaRef.current.focus();
                          textareaRef.current.style.top =
                            rowTops[rowIndex + startRowIndex] + "px";
                          textareaRef.current.style.left =
                            columnLefts[columnIndex + startColumnIndex] + "px";
                          textareaRef.current.style.height =
                            rowHeights[rowIndex + startRowIndex] + "px";
                          textareaRef.current.style.width =
                            columnWidths[columnIndex + startColumnIndex] + "px";
                          //修改后
                          textareaRef.current.onchange = () => {
                            const val = textareaRef.current?.value;
                            data[rowIndex][col.columnName] = val;
                            setData(data);
                            //重新计算可视范围
                            setVisibleCounter(visibleCounter + 1);
                            // handleWheel();
                          };
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log("onMouseDown", e);
                        if (textareaRef.current) {
                          textareaRef.current.style.display = "none";
                        }
                        if (selectSvgRef.current) {
                          selectSvgRef.current.style.display = "block";
                        }
                        //拖拽选择多个单元格
                        const startX = e.clientX;
                        const startY = e.clientY;
                        //监听是否触发了鼠标拖拽
                        let isMove = false;
                        const startScrollLeft = scrollLeft + 0;
                        const fX: any =
                          containerRef.current?.getBoundingClientRect().x;
                        const lX = startX - fX;
                        const startScrollTop = scrollTop + 0;
                        const fY: any =
                          containerRef.current?.getBoundingClientRect().y;
                        const lY = startY - fY;
                        const move = (e: MouseEvent) => {
                          isMove = true;
                          console.log("move", e);
                          const x = e.clientX;
                          const y = e.clientY;
                          const dx = x - startX;
                          const dy = y - startY;
                          const tx = startScrollLeft + lX + dx;
                          const startXIndex = columnIndex + startColumnIndex;
                          //计算新的endX和endY
                          let endXIndex = columnIndex + startColumnIndex;
                          for (let i = startXIndex; i < columns.length; i++) {
                            if (columnLefts[i] + columnWidths[i] > tx) {
                              endXIndex = i;
                              break;
                            }
                          }
                          const startYIndex = rowIndex + startRowIndex;
                          const ty = startScrollTop + lY + dy;
                          //计算新的endY
                          let endYIndex = startYIndex;
                          for (let i = startYIndex; i < rowCount; i++) {
                            if (rowTops[i] + rowHeights[i] > ty) {
                              endYIndex = i;
                              break;
                            }
                          }
                          setSelectRange({
                            x0: startXIndex,
                            y0: startYIndex,
                            x1: endXIndex,
                            y1: endYIndex,
                          });
                        };
                        const up = (e: MouseEvent) => {
                          console.log("up", e);
                          if (!isMove) {
                            //如果没有触发了鼠标拖拽,则选择当前单元格
                            setSelectRange({
                              x0: columnIndex + startColumnIndex,
                              y0: rowIndex + startRowIndex,
                              x1: columnIndex + startColumnIndex,
                              y1: rowIndex + startRowIndex,
                            });
                          }
                          document.removeEventListener("mousemove", move);
                          document.removeEventListener("mouseup", up);
                        };
                        document.addEventListener("mousemove", move);
                        document.addEventListener("mouseup", up);
                      }}
                    >
                      <div className="flex h-full items-center justify-center overflow-hidden">
                        {row[col.columnName]}
                      </div>
                    </div>
                  ))}
              </>
            ))}
            <div
              ref={colLineRef}
              className="border-primary absolute top-0 bottom-0 hidden w-[1px] border-r-[1px] border-dashed"
            ></div>
            <div
              ref={rowLineRef}
              className="border-primary absolute right-0 left-0 hidden h-[1px] border-b-[1px] border-dashed"
            ></div>
            <textarea
              ref={textareaRef}
              className="bg-card absolute top-0 left-0 hidden resize-none"
            ></textarea>
          </div>
          <div
            className="relative z-10"
            style={{
              top: -rowTotalHeight / 2,
              height: rowTotalHeight / 2,
              width: colTotalWidth + 100,
            }}
          >
            {
              //数据 边框
            }
            {data.slice(startRowIndex, endRowIndex).map((row, rowIndex) => (
              <>
                {columns
                  .slice(startColumnIndex, endColumnIndex)
                  .map((col, columnIndex) => (
                    <div
                      key={columnIndex}
                      className={cn("absolute border-r-1 border-b-1")}
                      style={{
                        top: rowTops[rowIndex + startRowIndex],
                        left: columnLefts[columnIndex + startColumnIndex],
                        width: columnWidths[columnIndex + startColumnIndex],
                        height: rowHeights[rowIndex + startRowIndex],
                      }}
                    ></div>
                  ))}
              </>
            ))}
            {
              //数据 选择
            }
            <svg
              ref={selectSvgRef}
              className="bg-primary/10 absolute z-0 hidden size-0"
            ></svg>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}
