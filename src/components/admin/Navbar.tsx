"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Route mapping untuk breadcrumb
const routeNames: Record<string, string> = {
  "/admin": "Admin",
  "/admin/dashboard": "Dashboard",
  "/admin/event": "Event",
  "/admin/upload": "Unggah Foto",
  "/admin/gallery": "Gallery Foto",
  "/admin/profile": "Profile Admin",
};

export function Navbar() {
  const pathname = usePathname();

  // Generate breadcrumb items dari pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path);
    const breadcrumbs = [];

    // Always add home/admin as first item
    breadcrumbs.push({
      href: "/admin/dashboard",
      label: "Soraroid",
      isHome: true,
    });

    // Build cumulative path and create breadcrumb items
    let currentPath = "";
    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      
      // Skip if it's just "/admin" and we have more paths
      if (currentPath === "/admin" && paths.length > 1) {
        continue;
      }

      // Skip if this path is the same as home (prevent duplicate)
      if (currentPath === "/admin/dashboard") {
        continue;
      }

      const label = routeNames[currentPath] || paths[i];
      const isLast = i === paths.length - 1;

      breadcrumbs.push({
        href: currentPath,
        label: label,
        isLast: isLast,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.href}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
              
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {crumb.isHome && <Home className="h-4 w-4" />}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} className="flex items-center gap-1">
                      {crumb.isHome && <Home className="h-4 w-4" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
