"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { FileIcon as FileUser, FileX, ChevronDown, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto w-full">
        <div className="min-w-[700px]">
        {/* Table Header*/}
        <div className="grid grid-cols-12 text-xs text-slate-500 dark:text-slate-400 p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="col-span-3">Candidate</div>
          <div className="col-span-3">Job Title</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2">Applied</div>
          <div className="col-span-1">Resume</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {all_candidates
            ?.sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
            .slice(0, 6)
            .map((candidate) => (
              <CandidateRow
                key={candidate.id}
                id={candidate.id}
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

export enum ApplicationStatus {
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  WRITTEN_TEST = "written_test",
  INTERVIEW = "interview",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
function CandidateRow({ id, name, email, position, status, date, resumePath, onStatusUpdated }: CandidateRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(status)

  const hasResume = Boolean(resumePath)
  const resumeUrl = `${API_BASE_URL}/` + resumePath

  // Define the status progression flow
  const getNextStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
    const statusFlow = {
      [ApplicationStatus.SUBMITTED]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED],
      [ApplicationStatus.UNDER_REVIEW]: [
        ApplicationStatus.WRITTEN_TEST,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.WRITTEN_TEST]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
      [ApplicationStatus.INTERVIEW]: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
      [ApplicationStatus.ACCEPTED]: [], // Final status
      [ApplicationStatus.REJECTED]: [], // Final status
    }

    return statusFlow[currentStatus] || []
  }

  // Get display name for status
  const getStatusDisplayName = (status: ApplicationStatus): string => {
    const displayNames = {
      [ApplicationStatus.SUBMITTED]: "Submitted",
      [ApplicationStatus.UNDER_REVIEW]: "Under Review",
      [ApplicationStatus.WRITTEN_TEST]: "Written Test",
      [ApplicationStatus.INTERVIEW]: "Interview",
      [ApplicationStatus.ACCEPTED]: "Accepted",
      [ApplicationStatus.REJECTED]: "Rejected",
    }
    return displayNames[status]
  }

  // Handle status change with Server Action
  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    startTransition(async () => {
      try {
        console.log(id)
        const result = await updateCandidateStatus(id, newStatus)

        if (result.success) {
          setCurrentStatus(newStatus)
          onStatusUpdated?.(id, newStatus)
          alert(`✅ ${result.message}`)
        } else {
          alert(`❌ Error: ${result.message}`)
        }
      } catch (error) {
        alert("❌ Failed to update candidate status")
      }
    })
  }

  // Determine badge color based on candidate status
  const getStatusBadge = () => {
    const statusElement = (
      <div className="flex items-center gap-1">
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        <span>{getStatusDisplayName(currentStatus)}</span>
      </div>
    )

    switch (currentStatus) {
      case ApplicationStatus.SUBMITTED:
        return (
          <Badge variant="none" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.UNDER_REVIEW:
        return (
          <Badge variant="none" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.WRITTEN_TEST:
        return (
          <Badge variant="none" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.INTERVIEW:
        return (
          <Badge variant="none" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.ACCEPTED:
        return (
          <Badge variant="none" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            {statusElement}
          </Badge>
        )
      case ApplicationStatus.REJECTED:
        return (
          <Badge variant="none" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            {statusElement}
          </Badge>
        )
      default:
        return (
          <Badge variant="none" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {statusElement}
          </Badge>
        )
    }
  }

  const nextStatuses = getNextStatuses(currentStatus)
  const canChangeStatus = nextStatuses.length > 0 && !isPending

  return (
    <div className="grid grid-cols-12 py-3 px-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
      <div className="col-span-3 flex items-center">
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</div>
        </div>
      </div>
      <div className="col-span-3 flex items-center text-slate-600 dark:text-slate-300 truncate">{position}</div>
      <div className="col-span-3 flex items-center">
        {canChangeStatus ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent" disabled={isPending}>
                <div className="flex items-center gap-1">
                  {getStatusBadge()}
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Move to:</div>
              {nextStatuses.map((nextStatus) => (
                <DropdownMenuItem
                  key={nextStatus}
                  onClick={() => handleStatusChange(nextStatus)}
                  className="flex items-center gap-2"
                  disabled={isPending}
                >
                  <div className="flex items-center gap-2">
                    {nextStatus === ApplicationStatus.ACCEPTED && <Check className="h-3 w-3 text-green-600" />}
                    {nextStatus === ApplicationStatus.REJECTED && <div className="h-3 w-3 rounded-full bg-red-500" />}
                    <span>{getStatusDisplayName(nextStatus)}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          getStatusBadge()
        )}
      </div>
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
    </div>
  )
}


export interface UpdateStatusResult {
  success: boolean
  message: string
  candidateId?: number
  newStatus?: ApplicationStatus
}

export async function updateCandidateStatus(
  candidateId: number,
  newStatus: ApplicationStatus,
): Promise<UpdateStatusResult> {
  try {
    // Simulate API delay
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    const token = localStorage.getItem("token")

    // Here you would make your actual API call
    const response = await fetch(`${API_BASE_URL}/admin/update-applicant/${candidateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update status: ${response.statusText}`)
    }

    // For demo purposes, simulate success/failure
    const shouldFail = Math.random() < 0.1 // 10% chance of failure for demo

    if (shouldFail) {
      throw new Error("Failed to update candidate status")
    }

    return {
      success: true,
      message: `Candidate status updated to ${newStatus}`,
      candidateId,
      newStatus,
    }
  } catch (error) {
    console.error("Error updating candidate status:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
