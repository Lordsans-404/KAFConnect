"use client"

import { Activity, Calendar, CheckCircle, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { MetricCard } from "@/components/admin/dashboard/metric-card"
import { CandidateList } from "@/components/admin/dashboard/candidate-list"
import { JobList } from "@/components/admin/dashboard/job-list"
import { RightSidebar } from "@/components/admin/dashboard/right-sidebar"

interface MainContentProps {
  data: any
  currentTime: Date
  formatDate: (date: Date) => string
  token:any
  user:any
}

export function MainContent({ data, currentTime, formatDate, token, user }: MainContentProps) {
  const {all_candidates} = data || {}
  const aWeekAgo = new Date();
  aWeekAgo.setDate(aWeekAgo.getDate() - 7);

  const newCandidates = all_candidates?.filter(candidate => {
    const applicationDate = new Date(candidate.applicationDate);
    return applicationDate >= aWeekAgo;
  });
  return (
    <>
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
                    variant="none"
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
                  value={newCandidates?.length}
                  icon={FileText}
                  trend="up"
                  color="cyan"
                />
                <MetricCard
                  title="Interviews"
                  value={1}
                  icon={Calendar}
                  trend="stable"
                  color="green"
                  detail="8 scheduled today"
                />
                <MetricCard title="Hires" value={0} icon={CheckCircle} trend="up" color="blue" detail="3 this week" />
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
                    <CandidateList all_candidates={data?.all_candidates} />
                  </TabsContent>

                  {/* Jobs Tab Content */}
                  <TabsContent value="jobs" className="mt-0">
                    <JobList all_jobs={data?.all_jobs || []} all_tests={data?.all_tests || []} />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Right Sidebar - Summary and Quick Actions */}
      <RightSidebar data={data} currentTime={currentTime} formatDate={formatDate} token={token} user={user} />
    </>
  )
}
