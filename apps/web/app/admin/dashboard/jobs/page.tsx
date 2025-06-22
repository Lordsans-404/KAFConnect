"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Loader2, PlusCircle } from "lucide-react"
import { JobDetailDialog } from "@/components/admin/job-detail"
import { CreateJob } from "@/components/create-job"
import { DashboardSidebar } from "@/components/admin/dashboard/sidebar"
import { JobAnalytics } from "@/components/admin/job-analytics"


interface Job {
  id: string
  title: string
  department: string
  location: string
  postedAt: string
  applications?: any[]
}

interface JobsResponse {
  data: Job[]
  total: number
  page: number
  limit: number
  totalPages: number
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
  const currentPage = "jobs"
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [dialogOpenDetail, setDialogOpenDetail] = useState(false)
  const [dialogOpenNew, setDialogOpenNew] = useState(false)
  const [allTests, setAllTests] = useState([])
  const [token, setToken] = useState<string>("")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    departmentStats: [],
    employmentStats: [],
  })

  const fetchJobs = async (page = 1, limit = 5) => {
    try {
      setLoading(true)
      const storedToken = localStorage.getItem("token")
      if (!storedToken) {
        alert("No token found. Please login.")
        window.location.href = "/"
        return
      }

      setToken(storedToken)
      const response = await fetch(`http://localhost:3000/admin/jobs?page=${page}&limit=${limit}`, {
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
      setJobs(data.data)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      })
      setAnalyticsData({
        departmentStats: data.departmentStats || [],
        employmentStats: data.employmentStats || [],
      })

    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTests = async () => {
    try {
      const storedToken = localStorage.getItem("token")
      if (!storedToken) return

      const response = await fetch("http://localhost:3000/admin/tests", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const tests = await response.json()
        setAllTests(tests)
      }
    } catch (error) {
      console.error("Error fetching tests:", error)
    }
  }

  useEffect(() => {
    fetchJobs()
    fetchTests()
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchJobs(newPage, pagination.limit)
    }
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setDialogOpenDetail(true)
  }

  const handleSave = async (values: JobFormValues) => {
    if (!selectedJob) return

    try {
      const storedToken = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3000/admin/update-job/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update job")
      }

      // Refresh the jobs list after successful update
      fetchJobs(pagination.page, pagination.limit)
      setDialogOpenDetail(false)
    } catch (error) {
      console.error("Error updating job:", error)
      throw error
    }
  }

  const timeAgo = (date: Date): string => {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          <DashboardSidebar currentPage={currentPage} />
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Jobs</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Manage and view all job postings ({pagination.total} total)
                  </p>
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => setDialogOpenNew(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Job
                </Button>
              </div>
              <JobAnalytics analyticsData={analyticsData}/>
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
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {jobs.map((job) => (
                          <div
                            key={job.id}
                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">{job.title}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {job.department} • {job.location}
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
                              >
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
                                className="h-8 text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                onClick={() => handleJobClick(job)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                        {jobs.length === 0 && (
                          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <p className="mb-4">No jobs available</p>
                            <Button onClick={() => setDialogOpenNew(true)}>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Create Your First Job
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="h-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNumber
                            if (pagination.totalPages <= 5) {
                              pageNumber = i + 1
                            } else if (pagination.page <= 3) {
                              pageNumber = i + 1
                            } else if (pagination.page >= pagination.totalPages - 2) {
                              pageNumber = pagination.totalPages - 4 + i
                            } else {
                              pageNumber = pagination.page - 2 + i
                            }

                            return (
                              <Button
                                key={pageNumber}
                                variant={pagination.page === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNumber)}
                                className="h-8 w-8 p-0"
                              >
                                {pageNumber}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="h-8"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Create Job Dialog */}
              <CreateJob open={dialogOpenNew} onOpenChange={setDialogOpenNew} token={token} />

              {/* Job Detail Dialog */}
              {selectedJob && (
                <JobDetailDialog
                  open={dialogOpenDetail}
                  setOpen={setDialogOpenDetail}
                  job={selectedJob}
                  tests={allTests}
                  token={token}
                  onSave={handleSave}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
