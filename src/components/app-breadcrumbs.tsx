"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import React from "react";

export function AppBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname?.split("/").filter(Boolean) || [];

  const breadcrumbItems = segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    return (
      <React.Fragment key={href}>
        <BreadcrumbItem>
          {!isLast ? (
            <BreadcrumbLink href={href} className="capitalize">
              {decodeURIComponent(segment)}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="capitalize">
              {decodeURIComponent(segment)}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  );
}
