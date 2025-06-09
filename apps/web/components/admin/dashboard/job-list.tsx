import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface JobListProps {
  all_jobs: any[]
}

export function JobList({ all_jobs = [] }: JobListProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {all_jobs.slice(0, 4).map((job) => (
          <JobRow
            key={job.id}
            title={job.title}
            department={job.department}
            location={job.location}
            applicants={job.applications?.length ?? 0}
            posted={timeAgo(new Date(job.postedAt))}
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
}

function JobRow({ title, department, location, applicants, posted }: JobRowProps) {
  return (
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{title}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {department} • {location}
          </div>
        </div>
        <Badge variant="none" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">{applicants} applicants</Badge>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">Posted {posted}</div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          View Details
        </Button>
      </div>
    </div>
  )
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
