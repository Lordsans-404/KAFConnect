"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchCandidates = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      const storedToken = localStorage.getItem("token")

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

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCandidates(newPage, pagination.limit)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Candidates</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage and view all candidate applications ({pagination.total} total)
        </p>
      </div>

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
                <div className="grid grid-cols-5 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div>Candidate</div>
                  <div>Job Title</div>
                  <div>Status</div>
                  <div>Applied</div>
                  <div>Actions</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="grid grid-cols-5 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                        <Badge variant="secondary">{candidate.status}</Badge>
                      </div>
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        {new Date(candidate.applicationDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
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
