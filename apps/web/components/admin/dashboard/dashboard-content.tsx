"use client"

import { MainContent } from "@/components/admin/dashboard/main-content"
import { RightSidebar } from "@/components/admin/dashboard/right-sidebar"

interface DashboardContentProps {
  data: any
  currentTime: Date
  formatDate: (date: Date) => string
  token: string | null
}

export function DashboardContent({ data, currentTime, formatDate, token }: DashboardContentProps) {
  return (
    <>
      {/* Main Content Area - Recruitment Overview */}
      <MainContent data={data} currentTime={currentTime} formatDate={formatDate} token={token} />

      {/* Right Sidebar - Summary and Quick Actions */}
      <RightSidebar data={data} currentTime={currentTime} formatDate={formatDate} token={token} />
    </>
  )
}
