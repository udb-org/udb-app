import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useTabStore } from "@/store/tab-store";
import React from "react";
export function ViewBreadcrumb() {
  const tab = useTabStore((state: any) => state.tab);
  return <div className="w-full h-[32px] flex items-center whitespace-nowrap overflow-hidden">
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap text-sm gap-0">
     
        {
          tab && tab.path.map((item:any, index:number) =>
            <BreadcrumbItem className="gap-0" key={index}>
              <BreadcrumbLink href="/">{item}</BreadcrumbLink><BreadcrumbSeparator />
            </BreadcrumbItem>
          )
        }

      </BreadcrumbList>
    </Breadcrumb>
  </div>
}
