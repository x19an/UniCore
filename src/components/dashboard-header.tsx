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
      <div className="hidden md:block">
        <SidebarTrigger className="-ml-1" />
      </div>
      <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />
      
      {/* Mobile Title Centered */}
      <div className="md:hidden flex items-center justify-center w-full absolute left-0 right-0 pointer-events-none">
        <span className="font-bold text-lg tracking-tight">UniCore</span>
      </div>

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>
              UniCore
            </BreadcrumbLink>
          </BreadcrumbItem>
          {!isHome && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {isHome && (
            <>
              <BreadcrumbSeparator />
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
