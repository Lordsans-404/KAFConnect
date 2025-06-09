"use client"

import type React from "react"

import { Briefcase, Calendar, Command, MessageSquare, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusItem } from "@/components/admin/dashboard/status-item"

export function DashboardSidebar() {
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
  active?: boolean
}

function NavItem({ icon: Icon, label, active = false }: NavItemProps) {
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
