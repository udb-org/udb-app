import { cn } from "@/utils/tailwind";
import React from "react";
export function ResizablePanelGroup(
    props: {
        direction?: "horizontal" | "vertical",
        className?: string,
        children: React.ReactNode
    }
) {
    return <div className={
        cn("w-full h-full flex", props.direction == "vertical" ? "flex-col" : "flex-row", props.className)
    }>
        {props.children}
    </div>
}
export function ResizablePanel(
    props: {
        children: React.ReactNode,
        width?: number | undefined,
        height?: number | undefined,
        direction?: "horizontal" | "vertical",
    }
) {
    return <div className={
        cn("relative rounded-xl overflow-hidden",
            (props.height != undefined || props.width != undefined) ? `flex-shrink-0` : "flex-1"
        )
    }
        style={{
            height: props.height,
            width: props.width
        }}
    >
        {props.children}
    </div>
}
export function ResizablePanelHandle(
    props: {
        onMove?: (x: number, y: number) => void,
        direction?: "horizontal" | "vertical",
        className?: string,
    }
) {
    return <div className={
        cn("group", props.className, props.direction === "vertical" ? "w-full h-[9px]" : "h-full w-[9px]")
    }>
        <div className={
            cn("group-hover:bg-primary rounded-full ", props.direction === "vertical" ? "w-full h-[1px] cursor-row-resize mt-[4px]" : "h-full w-[1px] ml-[4px] cursor-col-resize")
        }
            onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const move = (e: MouseEvent) => {
                    if (props.onMove) {
                        props.onMove(e.clientX - startX, e.clientY - startY);
                    }
                };
                const up = (e: MouseEvent) => {
                    document.removeEventListener("mousemove", move);
                    document.removeEventListener("mouseup", up);
                };
                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", up);
            }}
        ></div>
    </div>
}