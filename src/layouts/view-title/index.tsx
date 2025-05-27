import React from "react";  
import { ViewTabs } from "./view-tabs";
import { ViewBreadcrumb } from "./view-breadcrumb";
export function ViewTitle() {
  return <div className="w-full box-border">
    <ViewTabs/>
    <ViewBreadcrumb/>
  </div>
}