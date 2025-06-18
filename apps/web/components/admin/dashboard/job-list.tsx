"use client"

import type React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { JobDetailDialog } from "@/components/admin/job-detail"

interface JobListProps {
  all_jobs: any[]
  all_tests: any[]
  token: any
}

export function JobList({ all_jobs = [],all_tests=[], token }: JobListProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {all_jobs.slice(0, 4).map((job) => (
          <JobRow
            key={job.id}
            job={job}
            tests= {all_tests}
          />
        ))}
        {all_jobs.length === 0 && (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">No jobs available</div>
        )}

      </div>
      {all_jobs.length > 4 &&(<Link href="#">See All Jobs</Link>)}
    </div>
  )
}

interface JobRowProps {
  title: string
  department: string
  location: string
  applicants: number
  posted: string
}function JobRow({ job,tests,token }: JobRowProps) {
  const [opendDialogJob, setOpendDialogJob] = useState(false);
  // Di tempat kamu memanggil <JobDetailDialog />
  const handleSave = async (values: JobFormValues) => {
    const token = localStorage.getItem("token") // atau ambil dari state/context
    console.log(values)
    const response = await fetch(`http://localhost:3000/admin/update-job/${job.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update job")
    }
  }
  
  return (
    <>
      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">{job.title}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {job.department} • {job.location}
            </div>
          </div>
          <Badge variant="none" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
            {job.applications?.length ?? 0} applicants
          </Badge>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">Posted {timeAgo(new Date(job.postedAt))}</div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            onClick={() => setOpendDialogJob(true)}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Conditionally render the JobDetailDialog */}
      <JobDetailDialog open={opendDialogJob} setOpen={setOpendDialogJob} job={job} tests={tests} token={token} onSave={handleSave}>
        {/* Content for the JobDetailDialog goes here */}
        <div>
          <h2>{job.title}</h2>
          {/* Add more job details as needed */}
        </div>
      </JobDetailDialog>
    </>
  );
}



// Helper to format time ago
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count > 0) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
  }
  return "Just now"
}
