"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/todos": "Todos",
  "/attendance": "Attendance",
  "/notes": "Notes",
  "/goals": "Goals",
  "/streaks": "Streaks",
  "/recycle-bin": "Recycle Bin",
}

export function DashboardHeader() {
  const pathname = usePathname() || "/"
  
  // Find matching label or format from pathname
  const currentPageTitle = React.useMemo(() => {
    if (ROUTE_LABELS[pathname]) {
      return ROUTE_LABELS[pathname]
    }
    const cleanSegment = pathname.replace(/^\//, "").split("/")[0]
    if (!cleanSegment) return "Dashboard"
    return cleanSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }, [pathname])

  const isHome = pathname === "/"

  return (
    <header className="flex h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6 mx-2" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink render={<Link href="/" />}>
              UniCore
            </BreadcrumbLink>
          </BreadcrumbItem>
          {!isHome && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {isHome && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
