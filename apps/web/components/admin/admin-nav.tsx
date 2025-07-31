"use client"
import { useCallback, memo, useEffect, useState } from "react"
import { Briefcase, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export const AdminNavbar = memo(function AdminNavbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }, [])

  return (
    <header className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700 mb-6">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-2">
        <Briefcase className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        <span className="text-xl font-bold text-slate-800 dark:text-white">
          KAF <span className="text-cyan-600 dark:text-cyan-400">Connect</span>
        </span>
      </div>

      {/* Search and User Actions */}
      <div className="flex items-center space-x-6">
        {/* Icons and Profile */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-slate-600 dark:text-slate-400"
                >
                  {!mounted ? (
                    <div className="h-5 w-5" />
                  ) : theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-cyan-500 hover:ring-offset-2 dark:hover:ring-orange-400 dark:hover:ring-offset-slate-800 transition-all">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback className="bg-cyan-100 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400">
                  A
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="w-full cursor-pointer">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard/jobs" className="w-full cursor-pointer">
                  All Jobs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
})
