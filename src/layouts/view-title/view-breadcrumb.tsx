import React from "react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTabStore } from "@/store/tab-store";

export function ViewBreadcrumb() {
  const tab = useTabStore((state: any) => state.tab);
  return <div className="w-full h-[32px] flex items-center whitespace-nowrap overflow-hidden">
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap text-sm gap-0">
      <BreadcrumbItem className="sm:gap-0">
              <BreadcrumbLink>UDB</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
        {
          tab&&tab.path.map((item, index) => <>
            <BreadcrumbItem className="gap-0">
              <BreadcrumbLink href="/">{item}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
          )
        }
      </BreadcrumbList>
    </Breadcrumb>
  </div>
}
