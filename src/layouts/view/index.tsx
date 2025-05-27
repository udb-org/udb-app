import React, { useEffect } from "react";
import { ViewTitle } from "../view-title";
import { ViewContainer } from "../view-container";
import { ConnectionConfig } from "@/types/db";
export function View() {
  return <div className="h-full w-full box-border flex flex-col">
    <ViewTitle />
    <ViewContainer />
  </div>
}