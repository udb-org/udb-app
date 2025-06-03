import React from "react";
import * as monaco from 'monaco-editor';
import { useTabStore } from "@/store/tab-store";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
export default function ViewData(
    props: {
        viewKey: string;
    }
) {
    const { views,setView } = useTabStore();
    const view=views[props.viewKey];
    return <div className="w-full h-full " >
    </div>
}