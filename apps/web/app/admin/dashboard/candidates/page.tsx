"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Loader2, BarChart3, FileSpreadsheet } from "lucide-react"
import { generateExcelReport } from "@/components/admin/dashboard/candidates-report-generator"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface AnalyticsData {
  departmentStats: DepartmentStat[]
  employmentStats: EmploymentStat[]
}


export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [allCandidates, setAllCandidates] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  // Dynamic import states
  const [ChartComponent, setChartComponent] = useState(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState(null)
  const [showChart, setShowChart] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    departmentStats: [],
    employmentStats: [],
  })
  const storedToken = localStorage.getItem("token")

  const fetchAnalytics = async () => {
    try {
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

  const fetchCandidates = async (page = 1, limit = 10) => {
    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/admin/candidates?page=${page}&limit=${limit}`, {
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

      const data = await response.json()
      setCandidates(data.data)
      setAllCandidates(data.allData)
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

  const loadChartComponent = async () => {
    if (ChartComponent) {
      setShowChart(true)
      return // Already loaded
    }

    setChartLoading(true)
    setChartError(null)
    
    try {
      // Dynamic import with error handling
      const moduleImport = await import('@/components/admin/candidate-analytic')
      const Component = moduleImport.default
      
      setChartComponent(() => Component)
      setShowChart(true)
    } catch (error) {
      console.error('Failed to load chart component:', error)
      setChartError('Failed to load analytics. Please try again.')
    } finally {
      setChartLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCandidates(newPage, pagination.limit)
    }
  }

  const handleToggleChart = () => {
    if (showChart) {
      setShowChart(false)
    } else {
      loadChartComponent()
    }
  }

  const handleExportExcel = async () => {
    try {
      setExportLoading(true)
      await generateExcelReport(candidates, analyticsData)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Failed to generate Excel report")
    } finally {
      setExportLoading(false)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'written_test':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text- slate-900 dark:text-slate-100">All Candidates</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage and view all candidate applications ({pagination.total} total)
        </p>
      </div>
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
      {/* Analytics Section */}
      <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Analytics Dashboard
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View detailed insights about candidate applications
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleToggleChart}
              disabled={chartLoading}
              variant={showChart ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              {chartLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : showChart ? (
                "Hide Analytics"
              ) : (
                "Load Analytics"
              )}
            </Button>
          </div>

          {/* Error State */}
          {chartError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{chartError}</p>
              <Button
                onClick={loadChartComponent}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Chart Component */}
          {showChart && ChartComponent && (
            <div className="mt-6">
              <ChartComponent candidates={allCandidates} />
            </div>
          )}
        </CardContent>
      </Card>

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
                {/* Table Header */}
                <div className="grid grid-cols-4 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div>Candidate</div>
                  <div>Job Title</div>
                  <div>Status</div>
                  <div>Applied</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="grid grid-cols-4 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {candidate.userApplicant.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {candidate.userApplicant.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-300 truncate">
                        {candidate.job.title}
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(candidate.status)}`}>
                          {candidate.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        {new Date(candidate.applicationDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
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
                    const pageNumber = i + 1
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
  )
}
