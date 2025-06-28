"use client"

import type { ReactNode } from "react"
import { AdminNavbar } from "@/components/admin/admin-nav"
import { DashboardSidebar } from "@/components/admin/dashboard/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  user:any
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="container mx-auto p-4 relative z-10">
        <AdminNavbar />

        <div className="grid grid-cols-12 gap-6">
          <DashboardSidebar currentPage="dashboard" user={user} />
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
