import React, { useEffect } from "react";
import TitleBar from "./title-bar";
import StatusBar from "./status-bar";
import ActiveBar from "./active-bar";
import { View } from "./view";
import { Dialogs } from "./dialog";
import { Explorer } from "./explorer";
import { AssistantPanel } from "./assistant";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizablePanelHandle,
} from "@/components/resizable-panel";
import { useLayoutStore } from "@/store/layout-store";
/**
 * tet the workbench layout
 * @returns
 */
export default function Workbench() {
  const {
    leftPanelSize,
    setLeftPanelSize,
    rightPanelSize,
    setRightPanelSize,
    leftVisible,
    setLeftVisible,
    rightVisible,
    setRightVisible,
  } = useLayoutStore();
  useEffect(() => {
    //监听窗口大小变化
    const onResize = () => {
      const width = window.innerWidth;
      console.log("width", width);
      if (width < 1000) {
        setLeftPanelSize(0);
        setRightPanelSize(0);
      } else {
        setLeftPanelSize(20);
        setRightPanelSize(20);
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);
  const [leftWidth, setLeftWidth] = React.useState(200);
  const [rightWidth, setRightWidth] = React.useState(300);
  return (
    <div className="flex h-screen w-screen flex-col">
      <TitleBar />
      <div className="flex flex-1">
        <ActiveBar />
        <ResizablePanelGroup className="flex-1">
          {
            //left
          }
          <ResizablePanel width={leftVisible ? leftWidth : 0}>
            <div className="bg-card absolute top-0 right-[0px] bottom-0 left-[0px] overflow-hidden rounded-lg p-2">
              <Explorer />
            </div>
          </ResizablePanel>
          {
            //haddle
          }
          {leftVisible && (
            <ResizablePanelHandle
              onMove={(x, y) => {
                if (!leftVisible) {
                  return;
                }
                const width = leftWidth + x;
                if (width < 200) {
                  setLeftVisible(false);
                } else if (width > 600) {
                  setLeftWidth(600);
                } else {
                  setLeftWidth(width);
                }
              }}
            />
          )}

          <ResizablePanel>
            <div className="bg-card absolute top-0 right-[0px] bottom-0 left-[0px] overflow-hidden rounded-lg p-2">
              <View />
            </div>
          </ResizablePanel>

          {rightVisible && (
            <>
              <ResizablePanelHandle
                onMove={(x, y) => {
                  if (!rightVisible) {
                    return;
                  }
                  const width = rightWidth - x;
                  if (width < 300) {
                    setRightVisible(false);
                  } else if (width > 600) {
                    setRightWidth(600);
                  } else {
                    setRightWidth(width);
                  }
                }}
              />
            </>
          )}
          <ResizablePanel width={rightVisible ? rightWidth : 0}>
            <div className="bg-card absolute top-0 right-[5px] bottom-0 left-[0px] overflow-hidden rounded-lg">
              <AssistantPanel />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <StatusBar />
      <Dialogs />
    </div>
  );
}
