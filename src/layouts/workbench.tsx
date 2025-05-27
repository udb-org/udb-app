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
 * The workbench layout
 * 
 */
export default function Workbench() {
  //Global states
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
    //Listen to window size changes
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
  /**
   * Handle left panel resize
   * 
   * if left panel is not visible, do nothing
   * if left panel width is less than 200, hide left panel
   * if left panel width is greater than 600, set left panel width to 600
   * otherwise, set left panel width to the given width
   * 
   * @param x 
   * @param y 
   * @returns 
   */
  function handleLeftResize(x: number, y: number) {
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
  }
  /**
   * Handle right panel resize
   * if right panel is not visible, do nothing
   * if right panel width is less than 300, hide right panel
   * if right panel width is greater than 600, set right panel width to 600
   * otherwise, set right panel width to the given width
   *
   * @param x 
   * @param y 
   * @returns 
   */
  function handleRightResize(x: number, y: number) {
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
  }
  return (
    <div className="flex h-screen w-screen flex-col">
      <TitleBar />
      <div className="flex flex-1">
        <ActiveBar />
        <ResizablePanelGroup className="flex-1">
          {
            //left panel,Database、File Explorer、Git、Search
          }
          <ResizablePanel width={leftVisible ? leftWidth : 0}>
            <div className="bg-card absolute top-0 right-[0px] bottom-0 left-[0px] overflow-hidden rounded-lg p-2">
              <Explorer />
            </div>
          </ResizablePanel>
          {
            //left panel handle
          }
          {leftVisible && (
            <ResizablePanelHandle
              onMove={handleLeftResize}
            />
          )}
          {
            //center panel,View,Editor
          }
          <ResizablePanel>
            <div className="bg-card absolute top-0 right-[0px] bottom-0 left-[0px] overflow-hidden rounded-lg p-2">
              <View />
            </div>
          </ResizablePanel>
          {
            //right panel handle
          }
          {rightVisible && (
            <>
              <ResizablePanelHandle
                onMove={handleRightResize}
              />
            </>
          )}
          {
            //right panel,Assistant
          }
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
