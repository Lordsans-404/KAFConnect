"use client"

import { useState, useEffect, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  ExternalLink,
  Eye,
  Trash2,
  Plus,
  Download,
  Calendar,
  Briefcase,
  Filter,
  X,
  Check,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { jwtDecode } from "jwt-decode"
import { MaterialDialog } from "@/components/admin/material-form"

interface Material {
  id: number
  title: string
  description: string
  materialPath?: string | null
  materialUrl?: string | null
  postedAt: string
  jobs: Job[]
}

interface Job {
  id: number
  title: string
}

interface MaterialsResponse {
  data: Material[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface Filters {
  hasFile: "all" | "with_file" | "with_url" | "no_file"
  dateRange: "all" | "today" | "week" | "month" | "3months"
  hasJobs: "all" | "with_jobs" | "no_jobs"
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [allMaterials, setAllMaterials] = useState<Material[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>({})
  const [token, setToken] = useState<string>("")
  const [filters, setFilters] = useState<Filters>({
    hasFile: "all",
    dateRange: "all",
    hasJobs: "all",
  })

  const fetchMaterials = async (page = 1, limit = 10) => {
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

      const response = await fetch(`${API_BASE_URL}/admin/materials?page=${page}&limit=${limit}`, {
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

      const data: MaterialsResponse = await response.json()
      setAllMaterials(data.data)
      setMaterials(data.data)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      })
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allMaterials]

    // Filter by file type
    if (filters.hasFile !== "all") {
      filtered = filtered.filter((material) => {
        switch (filters.hasFile) {
          case "with_file":
            return material.materialPath
          case "with_url":
            return material.materialUrl
          case "no_file":
            return !material.materialPath && !material.materialUrl
          default:
            return true
        }
      })
    }

    // Filter by jobs
    if (filters.hasJobs !== "all") {
      filtered = filtered.filter((material) => {
        switch (filters.hasJobs) {
          case "with_jobs":
            return material.jobs && material.jobs.length > 0
          case "no_jobs":
            return !material.jobs || material.jobs.length === 0
          default:
            return true
        }
      })
    }

    // Filter by date range
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

      filtered = filtered.filter((material) => {
        const materialDate = new Date(material.postedAt)
        return materialDate >= filterDate
      })
    }

    setMaterials(filtered)
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
      page: 1,
    }))
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allMaterials])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMaterials(newPage, pagination.limit)
    }
  }

  const handleMaterialUpdated = () => {
    fetchMaterials(pagination.page, pagination.limit)
  }

  const handleFileFilter = (fileType: Filters["hasFile"]) => {
    setFilters((prev) => ({ ...prev, hasFile: fileType }))
  }

  const handleJobsFilter = (jobsType: Filters["hasJobs"]) => {
    setFilters((prev) => ({ ...prev, hasJobs: jobsType }))
  }

  const handleDateFilter = (dateRange: Filters["dateRange"]) => {
    setFilters((prev) => ({ ...prev, dateRange }))
  }

  const clearFilters = () => {
    setFilters({ hasFile: "all", dateRange: "all", hasJobs: "all" })
  }

  const getFileTypeDisplayName = (fileType: Filters["hasFile"]): string => {
    const displayNames = {
      all: "All Materials",
      with_file: "With File",
      with_url: "With URL",
      no_file: "No File/URL",
    }
    return displayNames[fileType]
  }

  const getJobsDisplayName = (jobsType: Filters["hasJobs"]): string => {
    const displayNames = {
      all: "All Materials",
      with_jobs: "With Jobs",
      no_jobs: "No Jobs",
    }
    return displayNames[jobsType]
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

  const displayedMaterials = materials

  const hasActiveFilters = filters.hasFile !== "all" || filters.dateRange !== "all" || filters.hasJobs !== "all"
  const currentPage = "materials"

  return (

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Materials Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage learning materials and resources ({materials.length} of {allMaterials.length} total)
          </p>
        </div>
        <MaterialDialog token={token}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </MaterialDialog>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active filters:</span>

          {filters.hasFile !== "all" && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
            >
              File: {getFileTypeDisplayName(filters.hasFile)}
              <button
                onClick={() => handleFileFilter("all")}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.hasJobs !== "all" && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
            >
              Jobs: {getJobsDisplayName(filters.hasJobs)}
              <button
                onClick={() => handleJobsFilter("all")}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

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
          <span className="ml-2 text-slate-500">Loading materials...</span>
        </div>
      ) : (
        <>
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="text-lg">Learning Materials</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Table Header with Filters */}
                <div className="grid grid-cols-12 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="col-span-3">Material</div>
                  <div className="col-span-2 flex items-center gap-2">
                    File/URL
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Filter
                            className={`h-3 w-3 ${filters.hasFile !== "all" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          Filter by File:
                        </div>
                        <DropdownMenuSeparator />
                        {(["all", "with_file", "with_url", "no_file"] as const).map((fileType) => (
                          <DropdownMenuItem
                            key={fileType}
                            onClick={() => handleFileFilter(fileType)}
                            className={filters.hasFile === fileType ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                          >
                            <div className="flex items-center gap-2">
                              {filters.hasFile === fileType && <Check className="h-3 w-3 text-blue-600" />}
                              <span>{getFileTypeDisplayName(fileType)}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    Posted
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
                  <div className="col-span-4">Description</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {displayedMaterials.map((material) => (
                    <MaterialRow
                      key={material.id}
                      material={material}
                      onMaterialUpdated={handleMaterialUpdated}
                      postedDate={timeAgo(new Date(material.postedAt))}
                    />
                  ))}
                  {displayedMaterials.length === 0 && (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <p>
                        {hasActiveFilters ? "No materials match the current filters" : "No materials found"}
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
                {Math.min(pagination.page * pagination.limit, materials.length)} of {materials.length} results
                {hasActiveFilters && ` (filtered from ${allMaterials.length} total)`}
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
  )
}

interface MaterialRowProps {
  material: Material
  postedDate: string
  onMaterialUpdated?: () => void
}

function MaterialRow({ material, postedDate, onMaterialUpdated }: MaterialRowProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const getFileTypeBadge = () => {
    if (material.materialPath) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <FileText className="h-3 w-3 mr-1" />
          File
        </Badge>
      )
    } else if (material.materialUrl) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          <ExternalLink className="h-3 w-3 mr-1" />
          URL
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
          No File
        </Badge>
      )
    }
  }

  const handleDeleteWithConfirm = async () => {
    if (
      confirm(
        `Are you sure you want to delete "${material.title}"? This action cannot be undone and will remove it from all associated jobs.`,
      )
    ) {
      startTransition(async () => {
        try {
          const result = await deleteMaterial(material.id)
          if (result.success) {
            onMaterialUpdated?.()
            alert(`✅ ${result.message}`)
          } else {
            alert(`❌ Error: ${result.message}`)
          }
        } catch (error) {
          alert("❌ Failed to delete material")
        }
      })
    }
  }

  const materialFileUrl = material.materialPath ? `${API_BASE_URL}/${material.materialPath}` : null

  return (
    <div className="grid grid-cols-12 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="col-span-3 flex items-center">
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{material.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">ID: {material.id}</div>
        </div>
      </div>

      <div className="col-span-2 flex items-center">{getFileTypeBadge()}</div>


      <div className="col-span-2 flex items-center text-slate-500 dark:text-slate-400">
        <Calendar className="h-3 w-3 mr-1" />
        {postedDate}
      </div>

      <div className="col-span-4 flex items-center">
        <p className="text-xs text-slate-600 dark:text-slate-400 truncate" title={material.description}>
          {material.description.length > 50 ? `${material.description.substring(0, 50)}...` : material.description}
        </p>
      </div>

      <div className="col-span-1 flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <div className="flex flex-col gap-0.5">
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {materialFileUrl && (
              <DropdownMenuItem asChild>
                <a href={materialFileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </a>
              </DropdownMenuItem>
            )}
            {material.materialUrl && (
              <DropdownMenuItem asChild>
                <a href={material.materialUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open URL
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteWithConfirm}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Material
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* View Material Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{material.title}</DialogTitle>
            <DialogDescription>Material details and information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{material.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Posted Date</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(material.postedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Material ID</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{material.id}</p>
              </div>
            </div>
            {material.materialPath && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">File Path</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{material.materialPath}</p>
              </div>
            )}
            {material.materialUrl && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">External URL</label>
                <a
                  href={material.materialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {material.materialUrl}
                </a>
              </div>
            )}
            {material.jobs && material.jobs.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Associated Jobs</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {material.jobs.map((job) => (
                    <Badge key={job.id} variant="outline">
                      {job.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// API Functions
export interface MaterialResult {
  success: boolean
  message: string
  materialId?: number
}

export async function deleteMaterial(materialId: number): Promise<MaterialResult> {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/admin/materials/${materialId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete material: ${response.statusText}`)
    }

    return {
      success: true,
      message: "Material deleted successfully",
      materialId,
    }
  } catch (error) {
    console.error("Error deleting material:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
