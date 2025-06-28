"use client"

import { MainContent } from "@/components/admin/dashboard/main-content"

interface DashboardContentProps {
  data: any
  currentTime: Date
  formatDate: (date: Date) => string
  token: string | null
  user:any
}

export function DashboardContent({ data, currentTime, formatDate, token, user }: DashboardContentProps) {
  return (
    <>
      {/* Main Content Area - Recruitment Overview */}
      <MainContent data={data} currentTime={currentTime} formatDate={formatDate} token={token} user={user} />

    </>
  )
}
