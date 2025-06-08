"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, X, Send, Paperclip } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ApplicationFormData {
  jobId: string
  coverLetter: string
}

interface JobDetails {
  id: string
  title: string
  department: string
  location: string
  salaryRange: string
}

interface ApplicationDialogProps {
  job: JobDetails
  token: string | null
  onSubmit?: (data: ApplicationFormData) => void
  trigger?: React.ReactNode
}

export function ApplicationDialog({ job, token, onSubmit, trigger }: ApplicationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ApplicationFormData>({
    jobId: job.id,
    coverLetter: "Saya tertarik dengan posisi ini...",
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Validate file upload
  const handleFileUpload = (file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setUploadedFile(file)
    } else {
      alert("Please upload a PDF file only.")
    }
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null)
    setFormData((prev) => ({
      ...prev,
      resumePath: "",
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const form = new FormData() //Form data ini merupakan class bawaan browser
      form.append("jobId", String(formData.jobId))
      form.append("coverLetter", formData.coverLetter)
      form.append("file", uploadedFile)

      // Call the API to submit application
      const response = await fetch("http://localhost:3000/users/apply-job", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      if (!response.ok) {
        if (response.status === 409) {
          alert("Anda sudah melamar pekerjaan ini sebelumnya")
          throw new Error("Anda sudah melamar pekerjaan ini sebelumnya")
        }
        const errorData = await response.json()
        throw new Error(errorData.message || "Gagal mengirim lamaran")
      }

      // Success
      alert("Application submitted successfully!")
      setOpen(false)

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(formData)
      }
      setUploadedFile(null)
      // Refresh the page to show updated applications
      window.location.reload()
    } catch (error) {
      console.error("Error submitting application:", error)
      alert(error.message || "Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-cyan-500 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:border-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/30"
          >
            Apply Now
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-md">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={job.department} className="rounded-md" />
              <AvatarFallback className="rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {job.department.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{job.title}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{job.department}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Submit your application for this position. Make sure to include a compelling cover letter and your latest
            resume.{job.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Location:</span>
                <span className="ml-2 text-slate-800 dark:text-slate-200">{job.location}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Salary:</span>
                <span className="ml-2 text-slate-800 dark:text-slate-200">${job.salaryRange}</span>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-sm font-medium">
              Cover Letter <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              value={formData.coverLetter}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverLetter: e.target.value }))}
              className="min-h-[120px] resize-none"
              required
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Minimum 50 characters</span>
              <span>{formData.coverLetter.length} characters</span>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Resume/CV <span className="text-red-500">*</span>
            </Label>

            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                    : "border-slate-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PDF files only (Max 10MB)</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="resume-upload"
                />
                <Label
                  htmlFor="resume-upload"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 cursor-pointer transition-colors"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Choose File
                </Label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-md">
                    <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{uploadedFile.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Application Tips</div>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
                  <li>• Customize your cover letter for this specific position</li>
                  <li>• Ensure your resume is up-to-date and relevant</li>
                  <li>• Highlight skills that match the job requirements</li>
                  <li>• Keep your cover letter concise but compelling</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formData.coverLetter.trim().length < 30}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
