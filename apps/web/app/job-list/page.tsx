"use client"

import { useState, useMemo, useEffect } from "react"
import { Briefcase, Calendar, ChevronDown, Filter, MapPin, Moon, Sun, Users, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {ApplicationDialog} from "@/components/applicant-form"

const JOBS_PER_PAGE = 5
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function JobListings() {
  const [theme, setTheme] = useState<"dark" | "light">("light")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [jobs, setJobs] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState("")
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("token")
      setToken(token)
      if (!token) {
        alert("Silakan login dulu")
        window.location.href = "/"
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/dashboard`, {
          headers: { Authorization: "Bearer " + token },
        })

        if (!res.ok) {
          alert("Token invalid atau expired. Silakan login ulang.")
          window.location.href = "/"
          return
        }
        try {
          const data = await res.json()
          setData(data)
          setUser(data.profile.user || null)
          setJobs(data?.jobs)
          setIsLoading(false)
        } catch (err) {
          alert("Sorry we couldn't find your data")
          window.location.href = "/profile"
          return
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
        setMessage(err.message)
        alert("Your token is invalid!")
        window.location.href = "/"
      }
    }

    loadDashboard()
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  
  // Pagination logic
  const totalPages = Math.ceil(jobs?.length / JOBS_PER_PAGE)
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE
    const endIndex = startIndex + JOBS_PER_PAGE
    return jobs?.slice(startIndex, endIndex)
  }, [currentPage, jobs])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" }) // Scroll to top on page change
  }

  return (
    <div
      className={`${theme} min-h-screen bg-gradient-to-br ${
        theme === "dark" ? "from-slate-950 to-slate-800" : "from-slate-50 to-white"
      } text-slate-800 dark:text-slate-100 transition-colors duration-300`}
    >
      <div className="container mx-auto p-4">
        {/* Header */}
        <header className="flex items-center justify-between py-6 border-b border-slate-200/70 dark:border-slate-700/70 mb-8">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                KAF <span className="text-cyan-600 dark:text-cyan-400">Connect</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Join our team and help us build the future</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-600 dark:text-slate-400">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Page title */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight">
            Explore Our Open Positions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Discover exciting career opportunities at KAF. We're looking for talented individuals to join our innovative
            team and make an impact.
          </p>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Showing <span className="font-semibold text-slate-800 dark:text-white">{paginatedJobs?.length}</span> of{" "}{jobs?.length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Updated {new Date().toLocaleDateString()}</div>
        </div>

        {/* Job listings */}
        <div className="space-y-6">
          {paginatedJobs?.length > 0 ? (
            paginatedJobs?.map((job) => <JobCard key={job.id} job={job} token={token} />)
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="text-slate-400 dark:text-slate-500 mb-3">
                <Briefcase className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">No jobs found</h3>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) handlePageChange(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(i + 1)
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) handlePageChange(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}

// Job card component
function JobCard({ job, token }: { job: any; token: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="group bg-white dark:bg-slate-800 border-slate-200/70 dark:border-slate-700/70 overflow-hidden shadow-md hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {job.title}
              </h3>
              <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {job.jobType}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                {job.department}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                Posted {timeAgo(new Date(job.postedAt))}
              </div>
            </div>

            <div className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{job.description}</div>
          </div>

          <div className="flex flex-col gap-2 min-w-[120px] md:ml-6">
            <ApplicationDialog
              job={{
                id: job.id,
                title: job.title,
                department: job.department,
                location: job.location,
                salaryRange: job.salaryRange,
              }}
              token={token}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count > 0) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
  }
  return "Just now"
}