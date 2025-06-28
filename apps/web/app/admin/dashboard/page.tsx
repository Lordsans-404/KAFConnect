"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"

import { DashboardLayout } from "@/components/admin/dashboard/layout"
import { DashboardContent } from "@/components/admin/dashboard/dashboard-content"
import { LoadingOverlay } from "@/components/admin/dashboard/loading-overlay"
import {jwtDecode} from "jwt-decode"

export default function Dashboard() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>({})
  const [user, setUser] = useState<any>({})
  const [token, setToken] = useState<string | null>(null)

  // Authentication and Data Fetch
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setUser(jwtDecode(storedToken))
    setToken(storedToken)
    if (!storedToken) {
      alert("Please login first")
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: { Authorization: "Bearer " + storedToken },
        })

        const json = await res.json()
        // console.log("Fetched Data:", json)

        if (res.ok) {
          setData(json)
          setIsLoading(false)
        } else {
          alert("Token invalid atau expired. Silakan login ulang.")
          router.push("/")
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])
  // Real-time Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100 relative">
        {isLoading && <LoadingOverlay />}

        <DashboardLayout user={user} >
          <DashboardContent data={data} currentTime={currentTime} formatDate={formatDate} token={token} user={user} />
        </DashboardLayout>
      </div>
    </ThemeProvider>
  )
}
