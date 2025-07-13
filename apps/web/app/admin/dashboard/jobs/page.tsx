"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  FileText,
  FileSpreadsheet,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  generateJobsPDFReport,
  generateJobsExcelReport,
} from "@/components/admin/dashboard/jobs-report-generator"
import { timeAgo } from "@/components/utils/timeAgo"

// Lazy load heavy components with proper loading states
const JobAnalytics = dynamic(
  () => import("@/components/admin/job-analytics").then(mod => ({ default: mod.JobAnalytics })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full min-w-0">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  }
)

const JobDetailDialog = dynamic(
  () => import("@/components/admin/job-detail").then(mod => mod.JobDetailDialog),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    ),
  }
)

const CreateJob = dynamic(
  () => import("@/components/create-job").then(mod => mod.CreateJob),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    ),
  }
)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface AnalyticsData {
  departmentStats: any[]
  employmentStats: any[]
}

interface Job {
  id: string
  title: string
  department: string
  location: string
  postedAt: string
  applications?: any[]
}

interface JobsResponse {
  jobs: {
    data: Job[]
    total: number
    page: number
    limit: number
    totalPages: number
    departmentStats?: any[]
    employmentStats?: any[]
  }
  materials: { data: any[] }
  all_tests: any[]
}

interface JobFormValues {
  title: string
  department: string
  location: string
  description: string
  requirements: string[]
  benefits: string[]
  salaryRange: string
  employmentType: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [dialogOpenDetail, setDialogOpenDetail] = useState(false)
  const [dialogOpenNew, setDialogOpenNew] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    departmentStats: [],
    employmentStats: [],
  })
  const [allTests, setAllTests] = useState([])
  const [allMaterials, setAllMaterials] = useState([])
  const [token, setToken] = useState("")
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Memoize token getter to prevent unnecessary re-renders
  const getToken = useCallback(() => {
    const stored = localStorage.getItem("token")
    if (!stored) {
      alert("No token found. Please login.")
      window.location.href = "/"
    }
    return stored
  }, [])

  const fetchJobs = useCallback(async (page = 1, limit = 10) => {
    const storedToken = getToken()
    if (!storedToken) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        alert("Token invalid atau expired. Silakan login ulang.")
        window.location.href = "/"
        return
      }

      const data: JobsResponse = await response.json()
      const { jobs, materials, all_tests } = data

      setJobs(jobs.data)
      setPagination({
        page: jobs.page,
        limit: jobs.limit,
        total: jobs.total,
        totalPages: jobs.totalPages,
      })
      setAnalyticsData({
        departmentStats: jobs.departmentStats || [],
        employmentStats: jobs.employmentStats || [],
      })
      setAllMaterials(materials.data)
      setAllTests(all_tests)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    const storedToken = getToken()
    if (storedToken) {
      setToken(storedToken)
      fetchJobs()
    }
  }, [fetchJobs, getToken])

  // Delay analytics loading to improve initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnalytics(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchJobs(newPage, pagination.limit)
    }
  }, [fetchJobs, pagination.limit, pagination.totalPages])

  const handleExport = useCallback(async (type: "pdf" | "excel") => {
    try {
      setExportLoading(true)
      if (type === "pdf") {
        await new Promise((res) => setTimeout(res, 1000))
        await generateJobsPDFReport(jobs, analyticsData)
      } else {
        await generateJobsExcelReport(jobs, analyticsData)
      }
    } catch (error) {
      console.error(`Error generating ${type.toUpperCase()} report:`, error)
      alert(`Failed to generate ${type.toUpperCase()} report`)
    } finally {
      setExportLoading(false)
    }
  }, [jobs, analyticsData])

  const handleSave = useCallback(async (values: JobFormValues) => {
    if (!selectedJob) return
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-job/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update job")
      }

      fetchJobs(pagination.page, pagination.limit)
      setDialogOpenDetail(false)
    } catch (error) {
      console.error("Error updating job:", error)
    }
  }, [selectedJob, token, fetchJobs, pagination.page, pagination.limit])

  // Memoize pagination component to prevent unnecessary re-renders
  const paginationComponent = useMemo(() => {
    if (pagination.totalPages <= 1) return null
    
    const pagesToShow = Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
      let page = i + 1
      if (pagination.totalPages > 5 && pagination.page > 3) {
        page = pagination.page - 2 + i
        if (pagination.page >= pagination.totalPages - 2) page = pagination.totalPages - 4 + i
      }
      return page
    })

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            onClick={() => handlePageChange(pagination.page - 1)} 
            disabled={pagination.page === 1}
            variant="outline"
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {pagesToShow.map((num) => (
            <Button
              key={num}
              size="sm"
              onClick={() => handlePageChange(num)}
              variant={pagination.page === num ? "default" : "outline"}
              className={`h-8 w-8 p-0 ${
                pagination.page === num 
                  ? "bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-600 dark:text-white dark:hover:bg-cyan-700" 
                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {num}
            </Button>
          ))}
          <Button
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }, [pagination, handlePageChange])

  // Memoize job list to prevent unnecessary re-renders
  const jobList = useMemo(() => {
    return jobs.map((job) => (
      <div
        key={job.id}
        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">{job.title}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {job.department} • {job.location}
            </div>
          </div>
          <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
            {job.applications?.length ?? 0} applicants
          </Badge>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Posted {timeAgo(new Date(job.postedAt))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            onClick={() => {
              setSelectedJob(job)
              setDialogOpenDetail(true)
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    ))
  }, [jobs])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Jobs</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and view all job postings ({pagination.total} total)</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleExport("pdf")} 
            disabled={exportLoading || !jobs.length} 
            variant="outline"
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Export PDF
          </Button>
          <Button 
            onClick={() => handleExport("excel")} 
            disabled={exportLoading || !jobs.length} 
            variant="outline"
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Export Excel
          </Button>
          <Button 
            className="bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-600 dark:text-white dark:hover:bg-cyan-700" 
            onClick={() => setDialogOpenNew(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Job
          </Button>
        </div>
      </div>

      {/* Conditionally render analytics with lazy loading */}
      {showAnalytics && <JobAnalytics analyticsData={analyticsData} />}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <span className="ml-2 text-slate-500">Loading jobs...</span>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Listings</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-200 dark:divide-slate-700">
              {jobs.length ? (
                jobList
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <p className="mb-4">No jobs available</p>
                  <Button 
                    onClick={() => setDialogOpenNew(true)}
                    className="bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-600 dark:text-white dark:hover:bg-cyan-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          {paginationComponent}
        </>
      )}

      {dialogOpenNew && (
        <CreateJob open={dialogOpenNew} onOpenChange={setDialogOpenNew} token={token} />
      )}

      {dialogOpenDetail && selectedJob && (
        <JobDetailDialog
          open={dialogOpenDetail}
          setOpen={setDialogOpenDetail}
          job={selectedJob}
          tests={allTests}
          materials={allMaterials}
          token={token}
          onSave={handleSave}
        />
      )}
    </div>
  )
}