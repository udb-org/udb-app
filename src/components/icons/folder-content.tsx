import { cn } from "@/utils/tailwind";
import React from "react";
export default function FolderContent(props: {
    className?: string;
    size?: number;
}){ 

    return     <svg width={props.size} height={props.size}  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#00bcd4" d="m13.844 7.536-1.288-1.072A2 2 0 0 0 11.276 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H15.124a2 2 0 0 1-1.28-.464"/><path fill="#b2ebf2" d="M22 18h6v2h-6zm0 4h6v2h-6z"/><path fill="#b2ebf2" d="M10 15v12a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V15a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1m20 11H20V16h10Z"/></svg>
}