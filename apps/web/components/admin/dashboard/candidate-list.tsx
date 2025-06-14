"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { FileIcon as FileUser, FileX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MoreOptions } from "@/components/admin/dashboard/more-options"
import { timeAgo } from "@/components/time-ago"

export function CandidateList({ all_candidates }: { all_candidates: any }) {
  console.log(all_candidates)
  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="col-span-3">Candidate</div>
        <div className="col-span-3">Job Title</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Applied</div>
        <div className="col-span-1">Resume</div>
        <div className="col-span-1">Action</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {all_candidates
          ?.sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
          .slice(0, 6)
          .map((candidate) => (
            <CandidateRow
              key={candidate.id}
              name={candidate.userApplicant.name}
              email={candidate.userApplicant.email}
              position={candidate.job.title}
              status={candidate.status}
              date={timeAgo(new Date(candidate.applicationDate))}
              resumePath={candidate.resumePath}
            />
        ))}
      </div>
    </div>
  )
}

interface CandidateRowProps {
  name: string
  email: string
  position: string
  status: string
  date: string
  resumePath?: string | null
}

function CandidateRow({ name, email, position, status, date, resumePath }: CandidateRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const hasResume = Boolean(resumePath)
  const resumeUrl = 'http://localhost:3000/'+resumePath

  // Determine badge color based on candidate status
  const getStatusBadge = () => {
    switch (status) {
      case "New":
        return (
          <Badge variant="none" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
            {status}
          </Badge>
        )
      case "Screening":
        return (
          <Badge variant="none" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {status}
          </Badge>
        )
      case "Interview":
        return (
          <Badge variant="none" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
            {status}
          </Badge>
        )
      case "Assessment":
        return (
          <Badge variant="none" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            {status}
          </Badge>
        )
      case "Offer":
        return (
          <Badge variant="none" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            {status}
          </Badge>
        )
      default:
        return (
          <Badge variant="none" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="grid grid-cols-12 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="col-span-3 flex items-center">
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</div>
        </div>
      </div>
      <div className="col-span-3 flex items-center text-slate-600 dark:text-slate-300 truncate">{position}</div>
      <div className="col-span-2 flex items-center">{getStatusBadge()}</div>
      <div className="col-span-2 flex items-center text-slate-500 dark:text-slate-400">{date}</div>
      <div className="col-span-1 flex items-center justify-center">
        {hasResume ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <FileUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw]">
              <DialogHeader>
                <DialogTitle>Resume Preview - {name}</DialogTitle>
                <DialogDescription>Preview of {name}&apos;s resume document</DialogDescription>
              </DialogHeader>
              <div className="flex-1 h-min-[600px] w-full">
                <iframe
                  src={resumeUrl}
                  className="w-full h-auto border border-slate-200 dark:border-slate-700 rounded-md"
                  title={`${name}'s Resume`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" asChild>
                  <a href={resumeUrl} download target="_blank" rel="noopener noreferrer">
                    Download Resume
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-not-allowed opacity-50"
            disabled
            title="No resume uploaded"
          >
            <FileX className="h-4 w-4 text-slate-400" />
          </Button>
        )}
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreOptions />
        </Button>
      </div>
    </div>
  )
}
