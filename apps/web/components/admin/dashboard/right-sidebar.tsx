import React, { useState } from 'react';
import { Calendar, FileText, FilePlus2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { StatBox } from "@/components/admin/dashboard/stat-box"
import { ActionButton } from "@/components/admin/dashboard/action-button"
import { CreateJob } from "@/components/create-job"
import { CreateStaff } from "@/components/create-staff"
import { TestCreatorForm } from "@/components/admin/test-form"
import { Button } from "@/components/ui/button"
import { MaterialDialog } from "@/components/admin/material-form"
import { generateJobsExcelReport } from "@/components/admin/dashboard/jobs-report-generator"

interface RightSidebarProps {
  data: any
  user: any
  currentTime: Date
  formatDate: (date: Date) => string
  token: string | null
}

export function RightSidebar({ data, currentTime, formatDate, token, user }: RightSidebarProps) {
  const { all_users, users_by_profile, profile, all_candidates, all_jobs, stats } = data || {}
  const [exportLoading, setExportLoading] = useState(false)
  const [openDialogTest, setOpenDialogTest] = useState(false)
  const [openDialogNewJob, setOpenDialogNewJob] = useState(false)
  // console.log(profile?.user.id)

  const handleExportExcel = async () => {
    try {
      setExportLoading(true)
      await generateJobsExcelReport(all_jobs, stats)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Failed to generate Excel report")
    } finally {
      setExportLoading(false)
    }
  }

  const aWeekAgo = new Date();
  aWeekAgo.setDate(aWeekAgo.getDate() - 7);
  console.log(user.level)
  const newCandidates = all_candidates?.filter(candidate => {
    const applicationDate = new Date(candidate.applicationDate);
    return applicationDate >= aWeekAgo;
  });
  return (
    <>
      <div className="col-span-0 md:col-span-3 lg:hidden md:sticky md:top-4 h-fit"></div>
      <div className="col-span-12 md:col-span-9 lg:col-span-3">
        <div className="grid gap-6">
          {/* Today's Summary Card */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">TODAY'S SUMMARY</div>
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                    {formatDate(currentTime)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">8 tasks pending</div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="New Candidates" value={newCandidates?.length || 0} />
                  <StatBox label="All Candidates" value={all_candidates?.length || 0} />
                  <StatBox label="Verified Users" value={users_by_profile?.length || 0} />
                  <StatBox label="Jobs Count" value={all_jobs?.length || 0} />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Quick Actions Card */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 dark:text-slate-100 text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {user?.level === "admin" || user?.level === "super_admin" ?
                (<CreateStaff />):
                (

                  <MaterialDialog token={token}>
                    <ActionButton 
                      icon={FilePlus2} 
                      label="New Material" 
                    />
                  </MaterialDialog> 
                )
                }
                
                <ActionButton icon={FileText} label="New Job" onClick={() => setOpenDialogNewJob(true)} />
                <ActionButton icon={FileText} label="New Test" onClick={() => setOpenDialogTest(true)} />
                <ActionButton icon={FileText} label="Reports" onClick={handleExportExcel} />
              </div>
            </CardContent>
          </Card>
          <TestCreatorForm userId={profile?.user.id} token={token} open={openDialogTest} onOpenChange={setOpenDialogTest} />
          <CreateJob token={token} open={openDialogNewJob} onOpenChange={setOpenDialogNewJob} />

        </div>
      </div>
    </>
  )
}
