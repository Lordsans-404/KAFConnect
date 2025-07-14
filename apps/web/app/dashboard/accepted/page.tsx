"use client"

import type { User } from "@/types/user"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Calendar,
  Users,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Trophy,
  Heart,
  Moon,
  Sun,
} from "lucide-react"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function JobAcceptancePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [acceptedApplication, setApplication] = useState<User | null>(null)
  const [message, setMessage] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        setApplication(data.acceptedApplication)
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

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      {/* Celebration Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-300" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-200 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">Congratulations! 🎉</h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">Welcome to the team, {user?.name}!</p>
          <Badge className="bg-yellow-400 text-yellow-900 text-lg px-4 py-2 hover:bg-yellow-300">
            <CheckCircle className="h-5 w-5 mr-2" />
            Application Accepted
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Message */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl md:text-3xl text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              Welcome to KAFConnect!
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We're thrilled to have you join our amazing team as a {acceptedApplication?.job?.title}. Your journey with us starts now,
              and we can't wait to see the incredible things you'll accomplish!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Job Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Users className="h-5 w-5" />
                Your Role Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Position</h3>
                <p className="text-slate-600 dark:text-slate-400">{acceptedApplication?.job?.position}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Department</h3>
                <p className="text-slate-600 dark:text-slate-400">{acceptedApplication?.job?.department}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Location</h3>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {acceptedApplication?.job?.location}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <BookOpen className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Complete Onboarding</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Fill out your employment forms and documentation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Meet Your Team</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Schedule introductory calls with your colleagues
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Setup Workspace</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get your equipment and access credentials
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Orientation Program</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Attend your first-week orientation sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Motivational Quote */}
        <Card className="mt-12 border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white border-slate-200 dark:border-slate-700">
          <CardContent className="text-center py-8">
            <Sparkles className="h-8 w-8 mx-auto mb-4 text-yellow-300" />
            <blockquote className="text-xl md:text-2xl font-medium mb-4">
              "Every great journey begins with a single step. Welcome to yours!"
            </blockquote>
            <p className="text-emerald-100">KAFConnect</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
