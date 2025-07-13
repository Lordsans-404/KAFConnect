"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { DashboardSidebar } from "@/components/admin/dashboard/sidebar"
import { AdminNavbar } from "@/components/admin/admin-nav"
import type { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Please login first")
      router.push("/")
      return
    }

    try {
      const decoded = jwtDecode(token)
      setUser(decoded)
    } catch (err) {
      console.error("Invalid token:", err)
      localStorage.removeItem("token")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    )
  }

  // Extract current page from URL path, e.g. "/admin/dashboard/jobs" → "jobs"
  const currentPage = pathname?.split("/").pop() ?? "dashboard"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6">
        <AdminNavbar />
        <div className="grid grid-cols-12 gap-6">
          <DashboardSidebar currentPage={currentPage} user={user} />
          <div className="col-span-12 md:col-span-9 lg:col-span-10">{children}</div>
        </div>
      </div>
    </div>
  )
}
