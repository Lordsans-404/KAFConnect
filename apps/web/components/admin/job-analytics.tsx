"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { useState, useEffect } from "react"

interface DepartmentStat {
  department: string
  jobs: string
  applications: string
}

interface EmploymentStat {
  type: string
  jobs: string
  applications: string
}

interface AnalyticsData {
  departmentStats: DepartmentStat[]
  employmentStats: EmploymentStat[]
}

interface JobAnalyticsProps {
  analyticsData: AnalyticsData
}

export function JobAnalytics({ analyticsData }: JobAnalyticsProps) {
  const [screenSize, setScreenSize] = useState({ width: 1024, height: 768 })

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Set initial size
    updateScreenSize()

    // Add event listener
    window.addEventListener('resize', updateScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  // Convert string values to numbers for charts
  const departmentChartData = analyticsData.departmentStats.map((item) => ({
    ...item,
    applications: Number.parseInt(item.applications),
    jobs: Number.parseInt(item.jobs),
  }))

  const employmentChartData = analyticsData.employmentStats.map((item) => ({
    ...item,
    applications: Number.parseInt(item.applications),
    jobs: Number.parseInt(item.jobs),
  }))

  const pieColors = ["#0891b2", "#06b6d4", "#67e8f9", "#a7f3d0", "#fde68a", "#fed7aa", "#fca5a5", "#c4b5fd"]

  const totalApplications = analyticsData.departmentStats.reduce(
    (sum, item) => sum + Number.parseInt(item.applications),
    0,
  )
  const totalJobs = analyticsData.departmentStats.reduce((sum, item) => sum + Number.parseInt(item.jobs), 0)

  // Responsive breakpoints
  const isMobile = screenSize.width < 640
  const isTablet = screenSize.width >= 640 && screenSize.width < 1024
  const isDesktop = screenSize.width >= 1024

  // Truncate long department names for better mobile display
  const truncateName = (name: string, maxLength: number = 12) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  // Responsive chart data with truncated names for smaller screens
  const responsiveDepartmentData = departmentChartData.map(item => ({
    ...item,
    displayName: isMobile ? truncateName(item.department, 8) : 
                 isTablet ? truncateName(item.department, 12) : 
                 item.department,
    fullName: item.department
  }))

  // Responsive chart configurations
  const barChartConfig = {
    margin: { 
      top: 10, 
      right: isMobile ? 5 : 10, 
      left: isMobile ? 0 : 5, 
      bottom: isMobile ? 80 : isTablet ? 70 : 60
    },
    xAxisHeight: isMobile ? 80 : isTablet ? 70 : 60,
    fontSize: isMobile ? 10 : 12,
    angle: isMobile ? -90 : -45,
    yAxisWidth: isMobile ? 25 : 40,
    maxBarSize: isMobile ? 25 : isTablet ? 35 : 50
  }

  const pieChartConfig = {
    outerRadius: isMobile ? 50 : isTablet ? 65 : 80,
    innerRadius: isMobile ? 15 : 0,
    fontSize: isMobile ? 9 : 11,
    showLegend: !isMobile,
    labelFormat: (type: string, applications: number, percent: number) => {
      if (isMobile) {
        return `${(percent * 100).toFixed(0)}%`
      }
      if (isTablet && type.length > 10) {
        return `${type.substring(0, 8)}...: ${(percent * 100).toFixed(0)}%`
      }
      return `${type}: ${applications} (${(percent * 100).toFixed(0)}%)`
    }
  }

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Department Applications Chart */}
        <Card className="w-full min-w-0 overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg truncate">
              Applications by Department
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-2">
              Total applications per department ({totalApplications.toLocaleString()} total)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6">
            <ChartContainer
              config={{
                applications: {
                  label: "Applications",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="min-h-[320px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={responsiveDepartmentData}
                  margin={barChartConfig.margin}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="displayName"
                    angle={barChartConfig.angle}
                    textAnchor="end"
                    height={barChartConfig.xAxisHeight}
                    fontSize={barChartConfig.fontSize}
                    interval={0}
                    tick={{ fontSize: barChartConfig.fontSize }}
                  />
                  <YAxis
                    fontSize={barChartConfig.fontSize}
                    width={barChartConfig.yAxisWidth}
                    tickFormatter={(value) =>
                      isMobile && value > 999 ? `${(value / 1000).toFixed(1)}k` : value
                    }
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name, props) => [
                      `${Number(value).toLocaleString()} applications`,
                      props?.payload?.fullName || "Applications",
                    ]}
                  />
                  <Bar
                    dataKey="applications"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={barChartConfig.maxBarSize}
                  >
                    {responsiveDepartmentData.map((_, index) => {
                      const hue = Math.floor(Math.random() * 360);
                      const pastel = `hsl(${hue}, 70%, 80%)`;
                      return <Cell key={`cell-${index}`} fill={pastel} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Employment Type Applications Chart */}
        <Card className="w-full min-w-0 overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg truncate">
              Applications by Employment Type
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-2">
              Distribution across employment types ({totalJobs.toLocaleString()} total jobs)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6">
            <ChartContainer
              config={{
                applications: {
                  label: "Applications",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px] sm:h-[280px] lg:h-[320px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie
                    data={employmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, applications, percent }) => 
                      pieChartConfig.labelFormat(type, applications, percent)
                    }
                    outerRadius={pieChartConfig.outerRadius}
                    innerRadius={pieChartConfig.innerRadius}
                    fill="#8884d8"
                    dataKey="applications"
                    fontSize={pieChartConfig.fontSize}
                  >
                    {employmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-2 sm:p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-xs sm:text-sm max-w-[200px]">
                            <p className="font-medium capitalize truncate">{data.type}</p>
                            <p className="text-slate-600 dark:text-slate-400">
                              {Number(data.applications).toLocaleString()} applications
                            </p>
                            <p className="text-slate-600 dark:text-slave-400">
                              {Number(data.jobs).toLocaleString()} jobs
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  {pieChartConfig.showLegend && (
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: isTablet ? '11px' : '12px',
                        paddingTop: '10px'
                      }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="w-full">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">Quick Stats</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Overview of job posting performance</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-cyan-600 dark:text-cyan-400 truncate">
                {totalJobs.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {isMobile ? "Jobs" : "Total Jobs"}
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
                {totalApplications.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {isMobile ? "Applications" : "Total Applications"}
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                {totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {isMobile ? "Avg/Job" : "Avg Apps/Job"}
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-0">
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analyticsData.departmentStats.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {isMobile ? "Depts" : "Active Depts"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}