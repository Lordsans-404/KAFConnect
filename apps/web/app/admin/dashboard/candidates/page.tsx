"use client"

import { useState, useEffect, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileIcon as FileUser,
  FileX,
  ChevronDown,
  Check,
  Filter,
  X,
  FileText,
  FileSpreadsheet,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { jwtDecode } from "jwt-decode"
import { DashboardSidebar } from "@/components/admin/dashboard/sidebar"
import { generatePDFReport, generateExcelReport } from "@/components/admin/dashboard/candidates-report-generator"

interface Candidate {
  id: number
  userApplicant: {
    name: string
    email: string
  }
  job: {
    title: string
  }
  status: ApplicationStatus
  applicationDate: string
  resumePath?: string | null
}

interface CandidatesResponse {
  data: Candidate[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export enum ApplicationStatus {
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  WRITTEN_TEST = "written_test",
  INTERVIEW = "interview",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

interface Filters {
  status: ApplicationStatus[]
  dateRange: "all" | "today" | "week" | "month" | "3months"
}

interface DepartmentStat {
  department: string
  jobs: string
  applications: string
}

interface EmploymentStat {
  type: string
  jobs: string
  applications: string
}

interface AnalyticsData {
  departmentStats: DepartmentStat[]
  employmentStats: EmploymentStat[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    departmentStats: [],
    employmentStats: [],
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [user, setUser] = useState<any>({})
  const [token, setToken] = useState<string>("")
  const [filters, setFilters] = useState<Filters>({
    status: [],
    dateRange: "all",
  })

  const fetchCandidates = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      const storedToken = localStorage.getItem("token")
      if (!storedToken) {
        alert("No token found. Please login.")
        window.location.href = "/"
        return
      }
      setUser(jwtDecode(storedToken))
      setToken(storedToken)
      const response = await fetch(`${API_BASE_URL}/admin/candidates`, {
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

      const data: CandidatesResponse = await response.json()
      setAllCandidates(data.data)
      setCandidates(data.data)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      })
    } catch (error) {
      console.error("Error fetching candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const storedToken = localStorage.getItem("token")
      if (!storedToken) return

      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...allCandidates]

    if (filters.status.length > 0) {
      filtered = filtered.filter((candidate) => filters.status.includes(candidate.status))
    }

    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "3months":
          filterDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter((candidate) => {
        const candidateDate = new Date(candidate.applicationDate)
        return candidateDate >= filterDate
      })
    }

    setCandidates(filtered)
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
      page: 1,
    }))
  }

  const handleExportPDF = async () => {
    try {
      setExportLoading(true)
      await generatePDFReport(candidates, analyticsData, filters)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF report")
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setExportLoading(true)
      await generateExcelReport(candidates, analyticsData, filters)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Failed to generate Excel report")
    } finally {
      setExportLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allCandidates])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleStatusUpdated = (candidateId: number, newStatus: ApplicationStatus) => {
    setCandidates((prev) =>
      prev.map((candidate) => (candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate)),
    )
    setAllCandidates((prev) =>
      prev.map((candidate) => (candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate)),
    )
  }

  const handleStatusFilter = (status: ApplicationStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) ? prev.status.filter((s) => s !== status) : [...prev.status, status],
    }))
  }

  const handleDateFilter = (dateRange: Filters["dateRange"]) => {
    setFilters((prev) => ({ ...prev, dateRange }))
  }

  const clearFilters = () => {
    setFilters({ status: [], dateRange: "all" })
  }

  const getStatusDisplayName = (status: ApplicationStatus): string => {
    const displayNames = {
      [ApplicationStatus.SUBMITTED]: "Submitted",
      [ApplicationStatus.UNDER_REVIEW]: "Under Review",
      [ApplicationStatus.WRITTEN_TEST]: "Written Test",
      [ApplicationStatus.INTERVIEW]: "Interview",
      [ApplicationStatus.ACCEPTED]: "Accepted",
      [ApplicationStatus.REJECTED]: "Rejected",
    }
    return displayNames[status]
  }

  const getDateRangeDisplayName = (range: Filters["dateRange"]): string => {
    const displayNames = {
      all: "All Time",
      today: "Today",
      week: "Last Week",
      month: "Last Month",
      "3months": "Last 3 Months",
    }
    return displayNames[range]
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

  const paginatedCandidates = candidates.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  const hasActiveFilters = filters.status.length > 0 || filters.dateRange !== "all"

  const currentPage = "candidates"
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          <DashboardSidebar currentPage={currentPage} user={user} />
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Candidates</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Manage and view all candidate applications ({candidates.length} of {allCandidates.length} total)
                  </p>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportExcel}
                    disabled={exportLoading || candidates.length === 0}
                    className="flex items-center gap-2 bg-transparent"
                    variant="outline"
                  >
                    {exportLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    Export Excel
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active filters:</span>

                  {filters.status.map((status) => (
                    <Badge
                      key={status}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      Status: {getStatusDisplayName(status)}
                      <button
                        onClick={() => handleStatusFilter(status)}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  {filters.dateRange !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      Date: {getDateRangeDisplayName(filters.dateRange)}
                      <button
                        onClick={() => handleDateFilter("all")}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                  <span className="ml-2 text-slate-500">Loading candidates...</span>
                </div>
              ) : (
                <>
                  <Card className="border-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Candidate Applications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Table Header with Filters */}
                        <div className="grid grid-cols-12 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <div className="col-span-3">Candidate</div>
                          <div className="col-span-3">Job Title</div>
                          <div className="col-span-2 flex items-center gap-2">
                            Status
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  <Filter
                                    className={`h-3 w-3 ${filters.status.length > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                  Filter by Status:
                                </div>
                                <DropdownMenuSeparator />
                                {Object.values(ApplicationStatus).map((status) => (
                                  <DropdownMenuCheckboxItem
                                    key={status}
                                    checked={filters.status.includes(status)}
                                    onCheckedChange={() => handleStatusFilter(status)}
                                  >
                                    {getStatusDisplayName(status)}
                                  </DropdownMenuCheckboxItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            Applied
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  <Filter
                                    className={`h-3 w-3 ${filters.dateRange !== "all" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-40">
                                <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                  Filter by Date:
                                </div>
                                <DropdownMenuSeparator />
                                {(["all", "today", "week", "month", "3months"] as const).map((range) => (
                                  <DropdownMenuItem
                                    key={range}
                                    onClick={() => handleDateFilter(range)}
                                    className={filters.dateRange === range ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                                  >
                                    <div className="flex items-center gap-2">
                                      {filters.dateRange === range && <Check className="h-3 w-3 text-blue-600" />}
                                      <span>{getDateRangeDisplayName(range)}</span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="col-span-1">Score</div>
                          <div className="col-span-1">Resume</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {paginatedCandidates.map((candidate) => (
                            <CandidateRow
                              key={candidate.id}
                              id={candidate.id}
                              name={candidate.userApplicant.name}
                              email={candidate.userApplicant.email}
                              position={candidate.job.title}
                              status={candidate.status}
                              date={timeAgo(new Date(candidate.applicationDate))}
                              resumePath={candidate.resumePath}
                              onStatusUpdated={handleStatusUpdated}
                              totalQuestions={candidate.job.testId?.questions}
                              score={candidate.submission?.totalScore}
                            />
                          ))}
                          {paginatedCandidates.length === 0 && (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                              <p>
                                {hasActiveFilters ? "No candidates match the current filters" : "No candidates found"}
                              </p>
                              {hasActiveFilters && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={clearFilters}
                                  className="mt-2 bg-transparent"
                                >
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, candidates.length)} of {candidates.length} results
                        {hasActiveFilters && ` (filtered from ${allCandidates.length} total)`}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CandidateRowProps {
  id: number
  name: string
  email: string
  position: string
  status: ApplicationStatus
  date: string
  resumePath?: string | null
  onStatusUpdated?: (candidateId: number, newStatus: ApplicationStatus) => void
  score: any
  totalQuestions: any
}

function CandidateRow({
  id,
  name,
  email,
  position,
  status,
  date,
  resumePath,
  onStatusUpdated,
  totalQuestions,
  score,
}: CandidateRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(status)
  const scorePercentage =
    !isNaN(score) && !isNaN(totalQuestions.length) && totalQuestions.length > 0
      ? `${Math.round((score / totalQuestions.length) * 100)}`
      : "-"
  const hasResume = Boolean(resumePath)
  const resumeUrl = `${API_BASE_URL}/` + resumePath

  const getNextStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
    const statusFlow = {
      [ApplicationStatus.SUBMITTED]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED],
      [ApplicationStatus.UNDER_REVIEW]: [
        ApplicationStatus.WRITTEN_TEST,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.WRITTEN_TEST]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
      [ApplicationStatus.INTERVIEW]: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
      [ApplicationStatus.ACCEPTED]: [],
      [ApplicationStatus.REJECTED]: [],
    }

    return statusFlow[currentStatus] || []
  }

  const getStatusDisplayName = (status: ApplicationStatus): string => {
    const displayNames = {
      [ApplicationStatus.SUBMITTED]: "Submitted",
      [ApplicationStatus.UNDER_REVIEW]: "Under Review",
      [ApplicationStatus.WRITTEN_TEST]: "Written Test",
      [ApplicationStatus.INTERVIEW]: "Interview",
      [ApplicationStatus.ACCEPTED]: "Accepted",
      [ApplicationStatus.REJECTED]: "Rejected",
    }
    return displayNames[status]
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    startTransition(async () => {
      try {
        const result = await updateCandidateStatus(id, newStatus)

        if (result.success) {
          setCurrentStatus(newStatus)
          onStatusUpdated?.(id, newStatus)
          alert(`✅ ${result.message}`)
        } else {
          alert(`❌ Error: ${result.message}`)
        }
      } catch (error) {
        alert("❌ Failed to update candidate status")
      }
    })
  }

  const getStatusBadge = () => {
    const statusElement = (
      <div className="flex items-center gap-1">
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        <span>{getStatusDisplayName(currentStatus)}</span>
      </div>
    )

    switch (currentStatus) {
      case ApplicationStatus.SUBMITTED:
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.UNDER_REVIEW:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.WRITTEN_TEST:
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.INTERVIEW:
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.ACCEPTED:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.REJECTED:
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            {statusElement}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {statusElement}
          </Badge>
        )
    }
  }

  const nextStatuses = getNextStatuses(currentStatus)
  const canChangeStatus = nextStatuses.length > 0 && !isPending

  return (
    <div className="grid grid-cols-12 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="col-span-3 flex items-center">
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</div>
        </div>
      </div>
      <div className="col-span-3 flex items-center text-slate-600 dark:text-slate-300 truncate">{position}</div>
      <div className="col-span-2 flex items-center">
        {canChangeStatus ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent" disabled={isPending}>
                <div className="flex items-center gap-1">
                  {getStatusBadge()}
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Move to:</div>
              {nextStatuses.map((nextStatus) => (
                <DropdownMenuItem
                  key={nextStatus}
                  onClick={() => handleStatusChange(nextStatus)}
                  className="flex items-center gap-2"
                  disabled={isPending}
                >
                  <div className="flex items-center gap-2">
                    {nextStatus === ApplicationStatus.ACCEPTED && <Check className="h-3 w-3 text-green-600" />}
                    {nextStatus === ApplicationStatus.REJECTED && <div className="h-3 w-3 rounded-full bg-red-500" />}
                    <span>{getStatusDisplayName(nextStatus)}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          getStatusBadge()
        )}
      </div>
      <div className="col-span-2 flex items-center text-slate-500 dark:text-slate-400">{date}</div>
      <div className="col-span-1 flex items-center text-right text-slate-500 dark:text-slate-400">
        {scorePercentage !== null ? `${scorePercentage}` : "-"}
      </div>
      <div className="col-span-1 flex items-center justify-center">
        {hasResume ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <FileUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw]">
              <DialogHeader>
                <DialogTitle>Resume Preview - {name}</DialogTitle>
                <DialogDescription>Preview of {name}&apos;s resume document</DialogDescription>
              </DialogHeader>
              <div className="flex-1 h-min-[600px] w-full">
                <iframe
                  src={resumeUrl}
                  className="w-full h-auto border border-slate-200 dark:border-slate-700 rounded-md"
                  title={`${name}'s Resume`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" asChild>
                  <a href={resumeUrl} download target="_blank" rel="noopener noreferrer">
                    Download Resume
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-not-allowed opacity-50"
            disabled
            title="No resume uploaded"
          >
            <FileX className="h-4 w-4 text-slate-400" />
          </Button>
        )}
      </div>
    </div>
  )
}

export interface UpdateStatusResult {
  success: boolean
  message: string
  candidateId?: number
  newStatus?: ApplicationStatus
}

export async function updateCandidateStatus(
  candidateId: number,
  newStatus: ApplicationStatus,
): Promise<UpdateStatusResult> {
  try {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_BASE_URL}/admin/update-applicant/${candidateId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update status: ${response.statusText}`)
    }

    return {
      success: true,
      message: `Candidate status updated to ${newStatus}`,
      candidateId,
      newStatus,
    }
  } catch (error) {
    console.error("Error updating candidate status:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
