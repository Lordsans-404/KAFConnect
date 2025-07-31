"use client"

import React from "react"

import type { ReactElement } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Briefcase,
  Command,
  Users,
  FileText,
  Shield,
  CheckCircle,
  UserCheck,
  Crown,
  Mail,
  Calendar,
  Hash,
  Clock,
  User,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardSidebarProps {
  currentPage: string
  user: any
}

interface NavItemData {
  icon: ReactElement
  label: string
  href: string
  key: string
}

// Move static data outside component to prevent recreation
const NAVIGATION_ITEMS: NavItemData[] = [
  { icon: Command, label: "Dashboard", href: "/admin/dashboard", key: "dashboard" },
  { icon: Users, label: "Candidates", href: "/admin/dashboard/candidates", key: "candidates" },
  { icon: Briefcase, label: "Jobs", href: "/admin/dashboard/jobs", key: "jobs" },
  { icon: Users, label: "Users", href: "/admin/dashboard/users", key: "users" },
  { icon: FileText, label: "Materials", href: "/admin/dashboard/materials", key: "materials" },
]

// Static user level configurations
const USER_LEVEL_CONFIG = {
  super_admin: {
    label: "Super Admin",
    color: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
    icon: Crown,
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-600 dark:text-red-400",
  },
  admin: {
    label: "Admin",
    color: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
    icon: Shield,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  staff: {
    label: "Staff",
    color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    icon: UserCheck,
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
  },
} as const

// Utility functions moved outside component
const capitalizeFirstLetter = (text: string | null | undefined): string => {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getSessionTimeRemaining = (exp: number): string => {
  const now = Math.floor(Date.now() / 1000)
  const remaining = exp - now

  if (remaining <= 0) return "Expired"

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

// Memoized NavItem component
const NavItem = React.memo<NavItemProps>(({ icon: Icon, label, href, active = false }) => {
  const buttonClassName = useMemo(
    () =>
      `w-full justify-start transition-all duration-200 ${
        active
          ? "bg-cyan-50 text-cyan-700 dark:bg-slate-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-slate-600 shadow-sm"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
      }`,
    [active],
  )

  return (
    <Link href={href} className="block">
      <Button variant="ghost" className={buttonClassName}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  )
})

NavItem.displayName = "NavItem"


// Simplified UserInfoItem component without icons
const UserInfoItem = React.memo<UserInfoItemProps>(({ label, value, bgColor, textColor }) => {
  return ( 
    <div className={`p-3 rounded-lg ${bgColor} transition-colors`}>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</div>
      <div className={`text-sm font-semibold ${textColor} truncate`} title={value}>
        {value}
      </div>
    </div>
  )
})

UserInfoItem.displayName = "UserInfoItem"

// Memoized SessionInfo component
const SessionInfo = React.memo<{ user: any }>(({ user }) => {
  const loginTime = useMemo(() => formatTimestamp(user.iat), [user.iat])
  const sessionRemaining = useMemo(() => getSessionTimeRemaining(user.exp), [user.exp])

  if (!user?.exp || !user?.iat) return null

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
      <div className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Session Info</div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Login</span>
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{loginTime}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-slate-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Expires</span>
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{sessionRemaining}</span>
        </div>
      </div>
    </div>
  )
})


// Main component with optimizations
export const DashboardSidebar = React.memo<DashboardSidebarProps>(({ currentPage, user }) => {
  // Memoize expensive calculations
  const userName = useMemo(() => capitalizeFirstLetter(user?.name?.split(" ")[0]), [user?.name])
  
  // Sidebar Toggler
  const [navOpen, setNavOpen] = useState(true)
  const [infoOpen, setInfoOpen] = useState(true)

  const hasAdminAccess = useMemo(() => ["super_admin", "admin"].includes(user?.level), [user?.level])

  const userLevelConfig = useMemo(
    () => USER_LEVEL_CONFIG[user?.level as keyof typeof USER_LEVEL_CONFIG] || USER_LEVEL_CONFIG.staff,
    [user?.level],
  )

  const visibleNavItems = useMemo(
    () => NAVIGATION_ITEMS.filter((item) => item.key !== "users" || hasAdminAccess),
    [hasAdminAccess],
  )

  // Memoize user info items to prevent recreation
  const userInfoItems = useMemo(
    () => [
      {
        label: "Email Address",
        value: user?.email || "Not provided",
        icon: Mail,
        color: "bg-gradient-to-r from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
      },
      {
        label: "User ID",
        value: `#${user?.sub || "N/A"}`,
        icon: Hash,
        color: "bg-gradient-to-r from-gray-500 to-slate-500",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        textColor: "text-gray-600 dark:text-gray-400",
      },
      {
        label: "Account Status",
        value: user?.isVerified ? "Verified" : "Unverified",
        icon: CheckCircle,
        color: user?.isVerified
          ? "bg-gradient-to-r from-green-500 to-emerald-500"
          : "bg-gradient-to-r from-orange-500 to-red-500",
        bgColor: user?.isVerified ? "bg-green-50 dark:bg-green-900/20" : "bg-orange-50 dark:bg-orange-900/20",
        textColor: user?.isVerified ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400",
      },
    ],
    [user?.email, user?.sub, user?.isVerified, userLevelConfig],
  )

  return (
    <div className="col-span-12 md:col-span-3 lg:col-span-2 md:sticky md:top-4 h-fit">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardContent className="p-4">
          {userName && (
            <div className="mb-2 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Halo, {userName}!</h2>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">Selamat datang kembali di dashboard.</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge
                  className={`${userLevelConfig.color} text-xs font-medium px-3 py-1 shadow-sm flex items-center gap-1`}
                >
                  <userLevelConfig.icon className="h-3 w-3" />
                  {userLevelConfig.label}
                </Badge>
              </div>
            </div>
          )}
          <div className="mt-4">
            <div className="flex justify-between flex-row mb-2">
              <p className={`w-full text-left transition-all duration-300 ease-in-out ${navOpen ? 'text-xs' : 'text-l'} md:text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300 align-middle`}>Page Navigation</p>
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="md:hidden"
              >
                {navOpen ? <ChevronRight/> : <ChevronDown />} 
              </button>
            </div>
              <nav className={`space-y-3 transition-all duration-300 ease-in-out ${navOpen ? 'block' : 'hidden'} md:block`}>
                {visibleNavItems.map((item) => (
                  <NavItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={currentPage === item.key}
                  />
                ))}
              </nav>
          </div>

          <div className="mt-4 pt-6 border-t border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-between flex-row mb-2">
              <p className={`w-full text-left transition-all duration-300 ease-in-out ${infoOpen ? 'text-xs' : 'text-l'} md:text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300 align-middle`}>User Information</p>
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                className="md:hidden"
              >
                {infoOpen ? <ChevronRight className="text-sm" /> : <ChevronDown />} 
              </button>
            </div>
            
            {/* Gunakan kelas Tailwind untuk toggle visibility */}
            <div className={`space-y-3 mb-4 transition-all duration-300 ease-in-out ${infoOpen ? 'block' : 'hidden'} md:block`}>
              {userInfoItems.map((item, index) => (
                <UserInfoItem key={index} {...item} />
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
})

DashboardSidebar.displayName = "DashboardSidebar"

// Type definitions
interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

interface UserInfoItemProps {
  label: string
  value: string
  icon: React.ElementType
  color: string
  textColor: string
  bgColor: string
}
