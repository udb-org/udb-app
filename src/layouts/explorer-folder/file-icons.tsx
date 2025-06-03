import { CodeIcon, CodeXml, CodeXmlIcon, FileIcon } from "lucide-react";
import React from "react";
/**
 * 根据文件名获取文件图标
 * 
 * @param name 
 */
export function getFileIcon(name: string) {
    if (name.endsWith(".sql")) {
        return <CodeIcon size={14} className="flex-shrink-0" />;
    }
    if (name.endsWith(".js")) {
        return <CodeIcon size={14} className="flex-shrink-0" />;
    }
    if (name.endsWith(".ts")) {
        return <CodeIcon size={14} className="flex-shrink-0" />;
    }   
    if (name.endsWith(".json")) {
        return <CodeIcon size={14} className="flex-shrink-0" />;
    }
    if (name.endsWith(".css")) {
        return <CodeIcon size={14} className="flex-shrink-0" />;
    }
    if (name.endsWith(".xml")) {
        return <CodeXmlIcon size={14} className="flex-shrink-0" />;
    }
    return <FileIcon size={14} className="flex-shrink-0" />;
}