"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Command,
  FileText,
  LineChart,
  Mail,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { AdminNavbar } from "@/components/admin-nav"
import { useTheme, ThemeProvider } from "next-themes"
import { useRouter } from 'next/navigation'

/**
 * Main Dashboard Component
 * 
 * This is the primary dashboard for admin/staff users in a recruitment management system.
 * It includes:
 * - Authentication check
 * - Real-time clock
 * - Recruitment metrics and analytics
 * - Candidate/job management interfaces
 * - Responsive layout with sidebar and main content areas
 */
export default function Dashboard() {
  const router = useRouter()
  const { theme } = useTheme()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>({})

  // Authentication and Data Fetch
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Please login first")
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/admin/dashboard", {
          headers: { Authorization: "Bearer " + token },
        })

        const json = await res.json()
        console.log("Fetched Data:", json)

        if (res.ok) {
          setData(json) // ✅ Stores the object properly
        } else {
          alert("Token invalid atau expired. Silakan login ulang.")
          router.push('/')
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])


  // Real-time Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  const { all_users, profile, users_by_profile } = data;
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        theme === "dark" 
          ? "from-slate-900 to-slate-800" 
          : "from-slate-100 to-white"
      } text-slate-800 dark:text-slate-100 relative`}
    >
      {/* Loading Overlay - Shows while checking authentication */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-600 dark:text-cyan-400 font-medium">
              Loading Dashboard
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="container mx-auto p-4 relative z-10">
        {/* Header with Admin Navigation */}
        <AdminNavbar />
        
        {/* Grid Layout for Dashboard Sections */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation and Stats */}
          <Sidebar currentTime={currentTime} formatDate={formatDate} />
          
          {/* Main Content Area - Recruitment Overview */}
          <MainDashboardContent currentTime={currentTime} formatDate={formatDate} />
          
          {/* Right Sidebar - Summary and Quick Actions */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {/* Today's Summary Card */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                        TODAY'S SUMMARY
                      </div>
                      <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                        {formatDate(currentTime)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        8 tasks pending
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <StatBox label="New Applications" value={4} />
                      <StatBox label="Interviews" value={1} />
                      <StatBox label="Verified Users" value={users_by_profile?.length} />
                      <StatBox label="Users Count" value={all_users?.length} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-800 dark:text-slate-100 text-base">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton icon={User} label="Add Candidate" />
                    <ActionButton icon={Briefcase} label="Post Job" />
                    <ActionButton icon={Calendar} label="Schedule" />
                    <ActionButton icon={FileText} label="Reports" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================================
// Component Definitions
// ==============================================

/**
 * Sidebar Component
 * 
 * Contains navigation menu and recruitment statistics.
 */
function Sidebar({ currentTime, formatDate }: { currentTime: Date; formatDate: (date: Date) => string }) {
  return (
    <div className="col-span-12 md:col-span-3 lg:col-span-2">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-full">
        <CardContent className="p-4">
          {/* Main Navigation Menu */}
          <nav className="space-y-2">
            <NavItem icon={Command} label="Dashboard" active />
            <NavItem icon={Users} label="Candidates" />
            <NavItem icon={Briefcase} label="Jobs" />
            <NavItem icon={Calendar} label="Interviews" />
            <NavItem icon={Users} label="Users" />
            <NavItem icon={MessageSquare} label="Messages" />
            <NavItem icon={Settings} label="Settings" />
          </nav>

          {/* Recruitment Statistics Section */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 mb-2 font-medium">
              RECRUITMENT STATS
            </div>
            <div className="space-y-3">
              <StatusItem label="Open Positions" value={75} color="cyan" />
              <StatusItem label="Interviews" value={42} color="green" />
              <StatusItem label="Offers Sent" value={28} color="blue" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Main Dashboard Content Component
 * 
 * Contains the primary dashboard content including:
 * - Recruitment overview metrics
 * - Candidate/job/pipeline tabs
 */
function MainDashboardContent({ currentTime, formatDate }: { currentTime: Date; formatDate: (date: Date) => string }) {
  return (
    <div className="col-span-12 md:col-span-9 lg:col-span-7">
      <div className="grid gap-6">
        {/* Recruitment Overview Card */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Recruitment Overview
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="bg-cyan-50 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 text-xs"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1"></div>
                  Today: {formatDate(currentTime)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Applications"
                value={4}
                icon={FileText}
                trend="up"
                color="cyan"
                detail="+12% from last week"
              />
              <MetricCard
                title="Interviews"
                value={1}
                icon={Calendar}
                trend="stable"
                color="green"
                detail="8 scheduled today"
              />
              <MetricCard
                title="Hires"
                value={0}
                icon={CheckCircle}
                trend="up"
                color="blue"
                detail="3 this week"
              />
            </div>

            {/* Candidates/Jobs/Pipeline Tabs */}
            <div className="mt-8">
              <Tabs defaultValue="candidates" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="bg-slate-100 dark:bg-slate-700 p-1">
                    <TabsTrigger
                      value="candidates"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400"
                    >
                      Candidates
                    </TabsTrigger>
                    <TabsTrigger
                      value="jobs"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400"
                    >
                      Jobs
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Candidates Tab Content */}
                <TabsContent value="candidates" className="mt-0">
                  <CandidateList />
                </TabsContent>

                {/* Jobs Tab Content */}
                <TabsContent value="jobs" className="mt-0">
                  <JobList />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// ==============================================
// Sub-Components
// ==============================================

/**
 * Navigation Item Component
 * 
 * Represents a single item in the sidebar navigation.
 */
function NavItem({ 
  icon: Icon, 
  label, 
  active = false 
}: { 
  icon: React.ElementType; 
  label: string; 
  active?: boolean 
}) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start ${
        active
          ? "bg-cyan-50 text-cyan-700 dark:bg-slate-700 dark:text-cyan-400"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      }`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

/**
 * Status Item Component
 * 
 * Displays a progress bar with label and value for recruitment stats.
 */
function StatusItem({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: string 
}) {
  // Determine color gradient based on prop
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500"
      case "green":
        return "from-green-500 to-emerald-500"
      case "blue":
        return "from-blue-500 to-indigo-500"
      default:
        return "from-cyan-500 to-blue-500"
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{value}</div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  )
}

/**
 * Metric Card Component
 * 
 * Displays a key metric with icon, value, and trend indicator.
 */
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  detail,
}: {
  title: string
  value: number
  icon: React.ElementType
  trend: "up" | "down" | "stable"
  color: string
  detail: string
}) {
  // Determine border color based on metric type
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-100 dark:border-cyan-900/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-100 dark:border-green-900/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-100 dark:border-blue-900/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-100 dark:border-cyan-900/30"
    }
  }

  // Determine trend icon based on metric direction
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <BarChart3 className="h-4 w-4 text-green-500" />
      case "down":
        return <BarChart3 className="h-4 w-4 rotate-180 text-red-500" />
      case "stable":
        return <LineChart className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className={`bg-white dark:bg-slate-700 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-600 dark:text-slate-300">{title}</div>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </div>
      <div className="absolute bottom-2 right-2 flex items-center">
        {getTrendIcon()}
      </div>
    </div>
  )
}

/**
 * Candidate List Component
 * 
 * Displays a table of candidates with their status and details.
 */
function CandidateList() {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="col-span-4">Candidate</div>
        <div className="col-span-3">Position</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Applied</div>
        <div className="col-span-1">Action</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        <CandidateRow
          name="Sarah Johnson"
          email="sarah.j@example.com"
          position="Senior UX Designer"
          status="Interview"
          date="2 days ago"
          avatar="/placeholder.svg?height=40&width=40"
        />
        <CandidateRow
          name="Michael Chen"
          email="m.chen@example.com"
          position="Full Stack Developer"
          status="Screening"
          date="Today"
          avatar="/placeholder.svg?height=40&width=40"
        />
        <CandidateRow
          name="Emily Rodriguez"
          email="e.rod@example.com"
          position="Product Manager"
          status="Offer"
          date="1 week ago"
          avatar="/placeholder.svg?height=40&width=40"
        />
        <CandidateRow
          name="David Kim"
          email="d.kim@example.com"
          position="Marketing Specialist"
          status="New"
          date="Just now"
          avatar="/placeholder.svg?height=40&width=40"
        />
        <CandidateRow
          name="Lisa Patel"
          email="l.patel@example.com"
          position="Data Analyst"
          status="Assessment"
          date="3 days ago"
          avatar="/placeholder.svg?height=40&width=40"
        />
      </div>
    </div>
  )
}

/**
 * Candidate Row Component
 * 
 * Represents a single row in the candidates table.
 */
function CandidateRow({
  name,
  email,
  position,
  status,
  date,
  avatar,
}: {
  name: string
  email: string
  position: string
  status: string
  date: string
  avatar: string
}) {
  // Determine badge color based on candidate status
  const getStatusBadge = () => {
    switch (status) {
      case "New":
        return <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">{status}</Badge>
      case "Screening":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">{status}</Badge>
      case "Interview":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">{status}</Badge>
      case "Assessment":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">{status}</Badge>
      case "Offer":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">{status}</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">{status}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-12 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="col-span-4 flex items-center">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-cyan-100 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{email}</div>
        </div>
      </div>
      <div className="col-span-3 flex items-center text-slate-600 dark:text-slate-300">
        {position}
      </div>
      <div className="col-span-2 flex items-center">
        {getStatusBadge()}
      </div>
      <div className="col-span-2 flex items-center text-slate-500 dark:text-slate-400">
        {date}
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreOptions />
        </Button>
      </div>
    </div>
  )
}

/**
 * Job List Component
 * 
 * Displays a list of open positions with applicant counts.
 */
function JobList() {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        <JobRow
          title="Senior UX Designer"
          department="Design"
          location="San Francisco, CA"
          applicants={48}
          posted="2 weeks ago"
        />
        <JobRow
          title="Full Stack Developer"
          department="Engineering"
          location="Remote"
          applicants={72}
          posted="3 days ago"
        />
        <JobRow
          title="Product Manager"
          department="Product"
          location="New York, NY"
          applicants={36}
          posted="1 month ago"
        />
        <JobRow
          title="Marketing Specialist"
          department="Marketing"
          location="Chicago, IL"
          applicants={24}
          posted="5 days ago"
        />
        <JobRow
          title="Data Analyst"
          department="Analytics"
          location="Remote"
          applicants={52}
          posted="1 week ago"
        />
      </div>
    </div>
  )
}

/**
 * Job Row Component
 * 
 * Represents a single job listing in the jobs list.
 */
function JobRow({
  title,
  department,
  location,
  applicants,
  posted,
}: {
  title: string
  department: string
  location: string
  applicants: number
  posted: string
}) {
  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{title}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {department} • {location}
          </div>
        </div>
        <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
          {applicants} applicants
        </Badge>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Posted {posted}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          View Details
        </Button>
      </div>
    </div>
  )
}

/**
 * Interview Item Component
 * 
 * Displays details for an upcoming interview.
 */
function InterviewItem({
  candidate,
  position,
  time,
  duration,
  type,
  avatar,
}: {
  candidate: string
  position: string
  time: string
  duration: string
  type: string
  avatar: string
}) {
  return (
    <div className="flex space-x-3 p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatar || "/placeholder.svg"} alt={candidate} />
        <AvatarFallback className="bg-cyan-100 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400">
          {candidate.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {candidate}
          </div>
          <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
            {type}
          </Badge>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {position}
        </div>
        <div className="flex items-center mt-1 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3 w-3 mr-1" />
          {time} • {duration}
        </div>
      </div>
    </div>
  )
}

/**
 * Stat Box Component
 * 
 * Displays a statistic with label in a small box.
 */
function StatBox({ 
  label, 
  value 
}: { 
  label: string; 
  value: number 
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700 rounded-md p-3 border border-slate-200 dark:border-slate-600">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
        {value}
      </div>
    </div>
  )
}

/**
 * Action Button Component
 * 
 * A button with icon and label for quick actions.
 */
function ActionButton({ 
  icon: Icon, 
  label 
}: { 
  icon: React.ElementType; 
  label: string 
}) {
  return (
    <Button
      variant="outline"
      className="h-auto py-3 px-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col items-center justify-center space-y-1 w-full"
    >
      <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}

/**
 * More Options Icon
 * 
 * A three-dot menu icon for actions.
 */
function MoreOptions() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}