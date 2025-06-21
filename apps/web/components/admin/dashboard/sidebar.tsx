"use client"

import type React from "react"
import Link from "next/link"
import { Briefcase, Calendar, Command, MessageSquare, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusItem } from "@/components/admin/dashboard/status-item"

interface DashboardSidebarProps {
  currentPage: string
}

interface NavItemData {
  icon: React.ElementType
  label: string
  href: string
  key: string
}

const navigationItems: NavItemData[] = [
  { icon: Command, label: "Dashboard", href: "/admin/dashboard", key: "dashboard" },
  { icon: Users, label: "Candidates", href: "/admin/dashboard/candidates", key: "candidates" },
  { icon: Briefcase, label: "Jobs", href: "/admin/dashboard/jobs", key: "jobs" },
  { icon: Calendar, label: "Interviews", href: "/admin/dashboard/interviews", key: "interviews" },
  { icon: Users, label: "Users", href: "/admin/dashboard/users", key: "users" },
  { icon: MessageSquare, label: "Messages", href: "/admin/dashboard/messages", key: "messages" },
  { icon: Settings, label: "Settings", href: "/admin/dashboard/settings", key: "settings" },
]

export function DashboardSidebar({ currentPage }: DashboardSidebarProps) {
  return (
    <div className="col-span-12 md:col-span-3 lg:col-span-2">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-full">
        <CardContent className="p-4">
          {/* Main Navigation Menu */}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={currentPage === item.key}
              />
            ))}
          </nav>

          {/* Recruitment Statistics Section */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 mb-2 font-medium">RECRUITMENT STATS</div>
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

interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

function NavItem({ icon: Icon, label, href, active = false }: NavItemProps) {
  return (
    <Link href={href} className="block">
      <Button
        variant="ghost"
        className={`w-full justify-start transition-colors ${
          active
            ? "bg-cyan-50 text-cyan-700 dark:bg-slate-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-slate-600"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
        }`}
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  )
}
