"use client"
import type { User } from "@/types/user" // Declare the User variable

import { useEffect, useState } from "react"
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Mail,
  MapPin,
  Moon,
  MoreHorizontal,
  Search,
  Sun,
  Upload,
  Phone,
  Warehouse,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ApplicationDialog } from "@/components/applicant-form"

export default function UserDashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("light")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)
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
        const res = await fetch("http://localhost:3000/users/dashboard", {
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
          console.log(data)
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

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"))
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
    location: data?.profile.address || "not provided",
    phone: data?.profile.phoneNumber || "not provided",
    isVerified: user?.isVerified,
  }

  return (
    <div
      className={`${theme} min-h-screen bg-gradient-to-br ${
        theme === "dark" ? "from-slate-900 to-slate-800" : "from-slate-100 to-white"
      } text-slate-800 dark:text-slate-100 relative`}
    >
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
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              KAF <span className="text-cyan-600 dark:text-cyan-400">Connect</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-1 bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="text-slate-600 dark:text-slate-400"
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
                  AJ
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - User Profile */}
          <div className="col-span-12 md:col-span-4 lg:col-span-4">
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2 text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" alt={userData.name} />
                      <AvatarFallback className="text-2xl bg-cyan-100 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400">
                        AJ
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-slate-800 dark:text-slate-100 text-xl">{userData.name}</CardTitle>
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
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Contact Info</div>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-cyan-600 dark:text-cyan-400">
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 min-w-0">
                          <Mail className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{userData.email}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
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
                      className="w-full border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Documents */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-800 dark:text-slate-100 text-base">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-md border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            Resume_AJ_2023.pdf
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Uploaded 2 months ago</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-md border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            Cover_Letter_Template.docx
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Uploaded 3 months ago</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Document
                    </Button>
                  </div>
                </CardContent>
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
                      <p className="text-cyan-100 mb-4">Your job search dashboard is ready for you.</p>
                      <div className="flex items-center text-sm text-cyan-100">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(currentTime)}
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-2xl font-bold">{data?.appliedJobs.length}</div>
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
                      <CardTitle className="text-slate-800 dark:text-slate-100 text-base">
                        Your Job Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {data?.appliedJobs.map((appJob, index) => (
                          <ApplicationItem key={index} appliedJob={appJob} />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center p-4">
                      <Button
                        variant="outline"
                        className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      >
                        View All Applications
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Recommended Jobs Tab */}
                <TabsContent value="recommended" className="mt-0">
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-slate-800 dark:text-slate-100 text-base">
                        Jobs Recommended For You
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {data?.jobs.slice(0, 3).map((job, index) => (
                          <JobItem key={index} token={token} job={job} match={95} />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center p-4">
                      <Button
                        variant="outline"
                        className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      >
                        View More Jobs
                      </Button>
                    </CardFooter>
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
function ApplicationItem({
  appliedJob,
}: {
  appliedJob: any
}) {
  const logo = "/placeholder.svg?height=40&width=40"
  const posted = timeAgo(new Date(appliedJob.applicationDate))
  const getStatusColor = () => {
    switch (appliedJob.status) {
      case "submitted":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
      case "blue":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "purple":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "amber":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
      case "green":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "red":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
    }
  }

  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage src={logo || "/placeholder.svg"} alt={appliedJob.job.title} className="rounded-md" />
          <AvatarFallback className="rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
            {appliedJob.job.title.charAt(0) || "X"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{appliedJob.job.title}</div>
            <Badge className={getStatusColor()}>{appliedJob.status}</Badge>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-semibold">
            <div className="flex items-center">
              <Warehouse className="h-4 w-4 mr-1" />
              {appliedJob.job.department}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {appliedJob.job.location}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <div></div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {posted}
              </div>
            </div>
          </div>
          {appliedJob.updates && (
            <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-md text-xs text-slate-600 dark:text-slate-300 border-l-2 border-cyan-500">
              {appliedJob.updates}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
        >
          View Details
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}

// Job item component
function JobItem({
  token,
  job,
  match,
}: {
  token: string
  job: any
  match: number
}) {
  const logo = "/placeholder.svg?height=40&width=40"
  const posted = timeAgo(new Date(job.postedAt))

  // Handle successful application submission
  const handleApplicationSuccess = (data: any) => {
    console.log("Application submitted successfully:", data)
    // You can add additional logic here if needed
  }

  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage src={logo || "/placeholder.svg"} alt={job.department} className="rounded-md" />
          <AvatarFallback className="rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
            {job.department.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{job.title}</div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">{match}% Match</Badge>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{job.department}</div>
          <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
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
      <div className="flex justify-end mt-3">
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

// Helper to format time ago
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
