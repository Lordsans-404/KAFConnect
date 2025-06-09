"use client";

import { useEffect, useState } from "react";
import { Briefcase, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function AdminNavbar() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

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
          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-slate-600 dark:text-slate-400"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                  {mounted ? (
                    theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )
                  ) : (
                    <div className="h-5 w-5" /> // placeholder to prevent layout shift
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Avatar Dropdown */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt="User"
                />
                <AvatarFallback className="bg-cyan-100 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400">
                  JD
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 mt-2 p-2 rounded-lg shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col space-y-2">
                <a
                  href="/dashboard"
                  className="text-sm text-slate-700 dark:text-slate-200 hover:underline"
                >
                  Dashboard
                </a>
                <a
                  href="/settings"
                  className="text-sm text-slate-700 dark:text-slate-200 hover:underline"
                >
                  Settings
                </a>
                <a
                  onClick={logout}
                  className="text-sm text-red-500 hover:underline cursor-pointer"
                >
                  Logout
                </a>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </header>
  );
}
