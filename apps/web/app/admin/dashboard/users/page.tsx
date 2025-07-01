"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useState, useEffect, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  UserCheck,
  UserX,
  ChevronDown,
  Check,
  Filter,
  X,
  Eye,
  Shield,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
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

export enum UserLevel {
  BASIC = "basic",
  ADMIN = "admin",
  STAFF = "staff",
  SUPER_ADMIN = "super_admin",
}

interface UserProfile {
  profile_id: number
  phoneNumber: string
  idCardNumber: string
  address: string
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  bio?: string | null
}

interface UserProfileData {
  profile_id: number
  phoneNumber: string
  idCardNumber: string
  address: string
  city?: string | null
  stateProvince?: string | null
  postalCode?: string | null
  bio?: string | null
  user: {
    id: number
    name: string
    email: string
    level: UserLevel
    isVerified: boolean
    createdAt: string
  }
}

interface UsersResponse {
  data: any[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface UserProfilesResponse {
  data: UserProfileData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface Filters {
  level: UserLevel[]
  verified: "all" | "verified" | "unverified"
  dateRange: "all" | "today" | "week" | "month" | "3months"
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
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
    level: [],
    verified: "all",
    dateRange: "all",
  })

  const fetchUsers = async (page = 1, limit = 10) => {
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

      const response = await fetch(`${API_BASE_URL}/admin/users-profile`, {
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

      const data: UserProfilesResponse = await response.json()
      setAllUsers(data.data)
      setUsers(data.data)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      })
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allUsers]

    // Filter by level
    if (filters.level.length > 0) {
      filtered = filtered.filter((profile) => filters.level.includes(profile.user.level))
    }

    // Filter by verification status
    if (filters.verified !== "all") {
      filtered = filtered.filter((profile) =>
        filters.verified === "verified" ? profile.user.isVerified : !profile.user.isVerified,
      )
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

      filtered = filtered.filter((profile) => {
        const userDate = new Date(profile.user.createdAt)
        return userDate >= filterDate
      })
    }

    setUsers(filtered)
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
      page: 1,
    }))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allUsers])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, pagination.limit)
    }
  }

  const handleUserUpdated = (userId: number, updates: any) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)))
    setAllUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)))
  }

  const handleLevelFilter = (level: UserLevel) => {
    setFilters((prev) => ({
      ...prev,
      level: prev.level.includes(level) ? prev.level.filter((l) => l !== level) : [...prev.level, level],
    }))
  }

  const handleVerifiedFilter = (verified: Filters["verified"]) => {
    setFilters((prev) => ({ ...prev, verified }))
  }

  const handleDateFilter = (dateRange: Filters["dateRange"]) => {
    setFilters((prev) => ({ ...prev, dateRange }))
  }

  const clearFilters = () => {
    setFilters({ level: [], verified: "all", dateRange: "all" })
  }

  const getLevelDisplayName = (level: UserLevel): string => {
    const displayNames = {
      [UserLevel.BASIC]: "Basic",
      [UserLevel.ADMIN]: "Admin",
      [UserLevel.STAFF]: "Staff",
      [UserLevel.SUPER_ADMIN]: "Super Admin",
    }
    return displayNames[level]
  }

  const getVerifiedDisplayName = (verified: Filters["verified"]): string => {
    const displayNames = {
      all: "All Users",
      verified: "Verified Only",
      unverified: "Unverified Only",
    }
    return displayNames[verified]
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

  const displayedUsers = users // Use users directly instead of paginatedUsers

  const hasActiveFilters = filters.level.length > 0 || filters.verified !== "all" || filters.dateRange !== "all"
  const currentPage = "users"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          <DashboardSidebar currentPage={currentPage} user={user} />

          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage and view all registered users ({users.length} of {allUsers.length} total)
                </p>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active filters:</span>

                  {filters.level.map((level) => (
                    <Badge
                      key={level}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      Level: {getLevelDisplayName(level)}
                      <button
                        onClick={() => handleLevelFilter(level)}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  {filters.verified !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      Status: {getVerifiedDisplayName(filters.verified)}
                      <button
                        onClick={() => handleVerifiedFilter("all")}
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
                  <span className="ml-2 text-slate-500">Loading users...</span>
                </div>
              ) : (
                <>
                  <Card className="border-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Registered Users</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Table Header with Filters */}
                        <div className="grid grid-cols-12 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <div className="col-span-5">User</div>
                          <div className="col-span-2 flex items-center gap-2">
                            Level
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  <Filter
                                    className={`h-3 w-3 ${filters.level.length > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                  Filter by Level:
                                </div>
                                <DropdownMenuSeparator />
                                {Object.values(UserLevel).map((level) => (
                                  <DropdownMenuCheckboxItem
                                    key={level}
                                    checked={filters.level.includes(level)}
                                    onCheckedChange={() => handleLevelFilter(level)}
                                  >
                                    {getLevelDisplayName(level)}
                                  </DropdownMenuCheckboxItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                                    className={`h-3 w-3 ${filters.verified !== "all" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-40">
                                <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                  Filter by Status:
                                </div>
                                <DropdownMenuSeparator />
                                {(["all", "verified", "unverified"] as const).map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleVerifiedFilter(status)}
                                    className={filters.verified === status ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                                  >
                                    <div className="flex items-center gap-2">
                                      {filters.verified === status && <Check className="h-3 w-3 text-blue-600" />}
                                      <span>{getVerifiedDisplayName(status)}</span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="col-span-2">Profile</div>
                          <div className="col-span-1">Actions</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {displayedUsers.map((profile) => (
                            <UserRow
                              key={profile.profile_id}
                              userProfile={profile}
                              onUserUpdated={handleUserUpdated}
                              registeredDate={timeAgo(new Date(profile.user.createdAt))}
                            />
                          ))}
                          {displayedUsers.length === 0 && (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                              <p>{hasActiveFilters ? "No users match the current filters" : "No users found"}</p>
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
                        {Math.min(pagination.page * pagination.limit, users.length)} of {users.length} results
                        {hasActiveFilters && ` (filtered from ${allUsers.length} total)`}
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

interface UserRowProps {
  userProfile: UserProfileData
  registeredDate: string
  onUserUpdated?: (userId: number, updates: any) => void
}

function UserRow({ userProfile, registeredDate, onUserUpdated }: UserRowProps) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentProfile, setCurrentProfile] = useState(userProfile)

  const getLevelBadge = () => {
    const levelElement = (
      <div className="flex items-center gap-1">
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        <span>{getLevelDisplayName(currentProfile.user.level)}</span>
      </div>
    )

    switch (currentProfile.user.level) {
      case "basic":
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {levelElement}
          </Badge>
        )
      case "staff":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {levelElement}
          </Badge>
        )
      case "admin":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
            {levelElement}
          </Badge>
        )
      case "super_admin":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            {levelElement}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {levelElement}
          </Badge>
        )
    }
  }

  const getVerificationBadge = () => {
    if (currentProfile.user.isVerified) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <UserCheck className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
          <UserX className="h-3 w-3 mr-1" />
          Unverified
        </Badge>
      )
    }
  }

  const getLevelDisplayName = (level: UserLevel): string => {
    const displayNames = {
      basic: "Basic",
      admin: "Admin",
      staff: "Staff",
      super_admin: "Super Admin",
    }
    return displayNames[level]
  }

  const handleLevelChange = async (newLevel: UserLevel) => {
    startTransition(async () => {
      try {
        const result = await updateUserLevel(currentProfile.user.id, newLevel)
        if (result.success) {
          const updatedProfile = {
            ...currentProfile,
            user: { ...currentProfile.user, level: newLevel },
          }
          setCurrentProfile(updatedProfile)
          onUserUpdated?.(currentProfile.user.id, { level: newLevel })
          alert(`✅ ${result.message}`)
        } else {
          alert(`❌ Error: ${result.message}`)
        }
      } catch (error) {
        alert("❌ Failed to update user level")
      }
    })
  }

  const handleVerificationToggle = async () => {
    startTransition(async () => {
      try {
        const result = await toggleUserVerification(currentProfile.user.id, !currentProfile.user.isVerified)
        if (result.success) {
          const updatedProfile = {
            ...currentProfile,
            user: { ...currentProfile.user, isVerified: !currentProfile.user.isVerified },
          }
          setCurrentProfile(updatedProfile)
          onUserUpdated?.(currentProfile.user.id, { isVerified: !currentProfile.user.isVerified })
          alert(`✅ ${result.message}`)
        } else {
          alert(`❌ Error: ${result.message}`)
        }
      } catch (error) {
        alert("❌ Failed to update verification status")
      }
    })
  }

  const getAvailableLevels = (): UserLevel[] => {
    return Object.values(UserLevel).filter((level) => level !== currentProfile.user.level)
  }

  const availableLevels = getAvailableLevels()
  const canChangeLevel = availableLevels.length > 0 && !isPending

  return (
    <div className="grid grid-cols-12 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="col-span-5 flex items-center">
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{currentProfile.user.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentProfile.user.email}</div>
        </div>
      </div>

      <div className="col-span-2 flex items-center">
        {canChangeLevel ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent" disabled={isPending}>
                <div className="flex items-center gap-1">
                  {getLevelBadge()}
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Change to:</div>
              {availableLevels.map((level) => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className="flex items-center gap-2"
                  disabled={isPending}
                >
                  <Shield className="h-3 w-3" />
                  <span>{getLevelDisplayName(level)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          getLevelBadge()
        )}
      </div>

      <div className="col-span-2 flex items-center">
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent"
          onClick={handleVerificationToggle}
          disabled={isPending}
        >
          {getVerificationBadge()}
        </Button>
      </div>

      <div className="col-span-2 flex items-center">
        <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
          <User className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      </div>

      <div className="col-span-1 flex items-center justify-center">
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details - {currentProfile.user.name}</DialogTitle>
              <DialogDescription>Complete user information and profile details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{currentProfile.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{currentProfile.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Level</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {getLevelDisplayName(currentProfile.user.level)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Verification Status</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentProfile.user.isVerified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Profile Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{currentProfile.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID Card Number</label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{currentProfile.idCardNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{currentProfile.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentProfile.city || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">State/Province</label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentProfile.stateProvince || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Postal Code</label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentProfile.postalCode || "Not provided"}
                    </p>
                  </div>
                  {currentProfile.bio && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{currentProfile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export interface UpdateUserResult {
  success: boolean
  message: string
  userId?: number
}

export async function updateUserLevel(userId: number, newLevel: UserLevel): Promise<UpdateUserResult> {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/level`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ level: newLevel }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update user level: ${response.statusText}`)
    }

    return {
      success: true,
      message: `User level updated to ${newLevel}`,
      userId,
    }
  } catch (error) {
    console.error("Error updating user level:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function toggleUserVerification(userId: number, isVerified: boolean): Promise<UpdateUserResult> {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/verify`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isVerified }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update verification status: ${response.statusText}`)
    }

    return {
      success: true,
      message: `User ${isVerified ? "verified" : "unverified"} successfully`,
      userId,
    }
  } catch (error) {
    console.error("Error updating verification status:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
