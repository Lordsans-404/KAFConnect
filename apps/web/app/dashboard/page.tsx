"use client"
import type { User } from "@/types/user"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Mail,
  MapPin,
  Moon,
  MoreHorizontal,
  Sun,
  Upload,
  Phone,
  Warehouse,
  ChevronLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ApplicationDialog } from "@/components/applicant-form"
import { timeAgo } from "@/components/utils/timeAgo"

// get API url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface PaginationData {
  data: any[]
  total: number
  page: number
  totalPages: number
}


function getTimeRemaining(expiredAt: string | Date): {
  timeLeft: string
  isExpired: boolean
  isUrgent: boolean
} {
  const now = new Date().getTime()
  const expiry = new Date(expiredAt).getTime()
  const difference = expiry - now

  if (difference <= 0) {
    return { timeLeft: "Expired", isExpired: true, isUrgent: false }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  let timeLeft = ""
  let isUrgent = false

  if (days > 0) {
    timeLeft = `${days}d ${hours}h left`
  } else if (hours > 0) {
    timeLeft = `${hours}h ${minutes}m left`
    isUrgent = hours < 24 // Less than 24 hours is urgent
  } else {
    timeLeft = `${minutes}m left`
    isUrgent = true // Less than 1 hour is urgent
  }

  return { timeLeft, isExpired: false, isUrgent }
}
export default function UserDashboard() {
  const { theme, setTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Pagination states
  const [applicationsData, setApplicationsData] = useState<PaginationData>({
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })
  const [jobsData, setJobsData] = useState<PaginationData>({
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token")
      setToken(token)
      if (!token) {
        alert("Silakan login dulu")
        window.location.href = "/"
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: "Bearer " + token },
        })

        if (!res.ok) {
          alert("Token invalid atau expired. Silakan login ulang.")
          window.location.href = "/"
          return
        }

        const data = await res.json()
        setProfileData(data.profile)
        setUser(data.user || null)
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to fetch profile", err)
        setMessage(err.message)
        alert("Your token is invalid!")
        window.location.href = "/"
      }
    }

    loadProfile()
  }, [])

  // Load applications with pagination
  const loadApplications = async (page = 1) => {
    if (!token) return

    setApplicationsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/users/applied-jobs?page=${page}`, {
        headers: { Authorization: "Bearer " + token },
      })

      if (res.ok) {
        const data = await res.json()
        setApplicationsData(data)
        if(data.acceptedApplication.length>0){
          alert("Congrats You Have Been Accepted!")
          window.location.href = "/dashboard/accepted"
          return
        }
      }
    } catch (err) {
      console.error("Failed to fetch applications", err)
    } finally {
      setApplicationsLoading(false)
    }
  }

  // Load jobs with pagination
  const loadJobs = async (page = 1) => {
    if (!token) return

    setJobsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/users/jobs?page=${page}`, {
        headers: { Authorization: "Bearer " + token },
      })

      if (res.ok) {
        const data = await res.json()
        setJobsData(data)
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err)
    } finally {
      setJobsLoading(false)
    }
  }

  // Load initial data when token is available
  useEffect(() => {
    if (token) {
      loadApplications(1)
      loadJobs(1)
    }
  }, [token])

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const userData = {
    name: user?.name || "Guest",
    email: user?.email || "not provided",
    location: profileData?.address || "not provided",
    phone: profileData?.phoneNumber || "not provided",
    isVerified: user?.isVerified,
  }
  // Pagination handlers
  const handleApplicationsPageChange = (page: number) => {
    loadApplications(page)
  }

  const handleJobsPageChange = (page: number) => {
    loadJobs(page)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-600 dark:text-cyan-400 font-medium">Loading Dashboard</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              KAF <span className="text-cyan-600 dark:text-cyan-400">Connect</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="text-slate-700 dark:text-slate-300"
                    >
                      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback className="bg-cyan-100 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400">
                  U
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - User Profile */}
          <div className="col-span-12 md:col-span-4 lg:col-span-4 md:sticky md:top-4 h-fit">
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2 text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" alt={userData.name} />
                      <AvatarFallback className="text-2xl bg-cyan-100 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-slate-900 dark:text-slate-100 text-xl">{userData.name}</CardTitle>
                  <div className="flex items-center justify-center mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {userData.location}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Profile Completion</div>
                        <div className="text-sm text-cyan-600 dark:text-cyan-400">
                          {userData.isVerified ? "Completed" : "Unverified"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Contact Info</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-slate-700 dark:text-slate-300 min-w-0">
                          <Mail className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{userData.email}</span>
                        </div>
                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                          <Phone className="h-4 w-4 mr-2 text-slate-400" />
                          {userData.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Link href="/profile" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Main content area */}
          <div className="col-span-12 md:col-span-8 lg:col-span-8">
            <div className="space-y-6">
              {/* Welcome Banner */}
              <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-none">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Welcome back, {userData.name}!</h2>
                      <p className="text-cyan-100 mb-4">Your dashboard is ready for you.</p>
                      <div className="flex items-center text-sm text-cyan-100">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(currentTime)}
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-2xl font-bold">{applicationsData.total || 0}</div>
                      <div className="text-xs">Active Applications</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications & Jobs Tabs */}
              <Tabs defaultValue="applications" className="w-full">
                <TabsList className="w-full bg-slate-100 dark:bg-slate-700 p-1 mb-4 flex justify-start">
                  <TabsTrigger
                    value="applications"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400"
                  >
                    My Applications
                  </TabsTrigger>
                  <TabsTrigger
                    value="recommended"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400"
                  >
                    Recommended Jobs
                  </TabsTrigger>
                </TabsList>

                {/* My Applications Tab */}
                <TabsContent value="applications" className="mt-0">
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900 dark:text-slate-100 text-base">
                          Your Job Applications
                        </CardTitle>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {applicationsData.total} total applications
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {applicationsLoading ? (
                        <div className="p-8 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                          <div className="mt-2 text-slate-500 dark:text-slate-400">Loading applications...</div>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {applicationsData.data.length > 0 ? (
                            applicationsData.data.map((appJob, index) => (
                              <ApplicationItem key={index} appliedJob={appJob} />
                            ))
                          ) : (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                              No applications yet
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    {applicationsData.totalPages > 1 && (
                      <CardFooter className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplicationsPageChange(applicationsData.page - 1)}
                            disabled={applicationsData.page <= 1 || applicationsLoading}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplicationsPageChange(applicationsData.page + 1)}
                            disabled={applicationsData.page >= applicationsData.totalPages || applicationsLoading}
                            className="border-slate-200 dark:border-slate-700"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Page {applicationsData.page} of {applicationsData.totalPages}
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>

                {/* Recommended Jobs Tab */}
                <TabsContent value="recommended" className="mt-0">
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900 dark:text-slate-100 text-base">
                          Jobs Recommended For You
                        </CardTitle>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {jobsData.data.length} available jobs
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {jobsLoading ? (
                        <div className="p-8 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                          <div className="mt-2 text-slate-500 dark:text-slate-400">Loading jobs...</div>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {jobsData.data.length > 0 ? (
                            jobsData.data.map((job, index) => (
                              <JobItem key={index} token={token} job={job} match={95} />
                            ))
                          ) : (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                              No recommended jobs available
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Application item component
function ApplicationItem({ appliedJob }: { appliedJob: any }) {
  const [timeRemaining, setTimeRemaining] = useState<{
    timeLeft: string
    isExpired: boolean
    isUrgent: boolean
  } | null>(null)

  const logo = "/placeholder.svg?height=40&width=40"
  const posted = timeAgo(new Date(appliedJob.applicationDate))
  const test = appliedJob.job.testId?.id

  // Update countdown every minute for written_test status
  useEffect(() => {
    if (appliedJob.status === "written_test" && appliedJob.testExpiredAt) {
      const updateTimer = () => {
        setTimeRemaining(getTimeRemaining(appliedJob.testExpiredAt))
      }

      updateTimer() // Initial update
      const interval = setInterval(updateTimer, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [appliedJob.status, appliedJob.testExpiredAt])

  const getStatusColor = () => {
    switch (appliedJob.status) {
      case "submitted":
        return "bg-cyan-100 hover:bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
      case "written_test":
        return "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "under_review":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "interview":
        return "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "accepted":
        return "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
    }
  }

  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage src={logo || "/placeholder.svg"} alt={appliedJob.job.title} className="rounded-md" />
          <AvatarFallback className="rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
            {appliedJob.job.title.charAt(0) || "X"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-slate-900 dark:text-slate-200 truncate">{appliedJob.job.title}</div>
            <Badge className={getStatusColor()}>{appliedJob.status.replace("_", " ")}</Badge>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-semibold">
            <div className="flex items-center">
              <Warehouse className="h-4 w-4 mr-1" />
              {appliedJob.job.department}
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {appliedJob.job.location}
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <div></div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {posted}
              </div>
            </div>
          </div>

          {/* Show test countdown for written_test status */}
          {appliedJob.status === "written_test" && timeRemaining && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">Test Deadline:</div>
                <div
                  className={`text-xs font-medium ${
                    timeRemaining.isExpired
                      ? "text-red-600 dark:text-red-400"
                      : timeRemaining.isUrgent
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {timeRemaining.timeLeft}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Only show Start Test button when status is written_test and have a test*/}
      {appliedJob.status === "written_test" && test && (
        <div className="flex justify-end mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          {appliedJob.submission ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            >
              <a href={`dashboard/test/${test}?jobApplication=${appliedJob.id}`}>
                See Results
                <ChevronRight className="h-3 w-3 ml-1" />
              </a>
            </Button>
          ) : (
            <Button
              asChild={!appliedJob.isTestExpired}
              variant="outline"
              size="sm"
              disabled={appliedJob.isTestExpired}
              className={
                appliedJob.isTestExpired
                  ? "opacity-50 cursor-not-allowed bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              }
            >
              {appliedJob.isTestExpired ? (
                <span>Test Expired</span>
              ) : (
                <a href={`dashboard/test/${test}?jobApplication=${appliedJob.id}`}>
                  Start Test
                  <ChevronRight className="h-3 w-3 ml-1" />
                </a>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Job item component
function JobItem({ token, job, match }: { token: string | null; job: any; match: number }) {
  const logo = "/placeholder.svg?height=40&width=40"
  const posted = timeAgo(new Date(job.postedAt))

  const handleApplicationSuccess = (data: any) => {
    console.log("Application submitted successfully:", data)
  }

  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage src={logo || "/placeholder.svg"} alt={job.department} className="rounded-md" />
          <AvatarFallback className="rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
            {job.department.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-slate-900 dark:text-slate-200 truncate">{job.title}</div>
            <Badge className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100">
              {match}% Match
            </Badge>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{job.department}</div>
          <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />${job.salaryRange}
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {posted}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed truncate">{job.description}</div>
        <ApplicationDialog
          job={{
            id: job.id,
            title: job.title,
            department: job.department,
            location: job.location,
            salaryRange: job.salaryRange,
          }}
          token={token}
          onSubmit={handleApplicationSuccess}
        />
      </div>
    </div>
  )
}
