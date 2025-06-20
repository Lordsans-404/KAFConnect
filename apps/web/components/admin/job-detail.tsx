"use client"

import { useState } from "react"
import ReactSelect from 'react-select'

import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { useForm, Controller } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandList,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command"
import { Switch } from "@/components/ui/switch"


// custom-react-select-styles.ts
const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "hsl(var(--input))",
    borderColor: state.isFocused
      ? "hsl(var(--ring))"
      : "hsl(var(--border))",
    boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring))" : "none",
    "&:hover": {
      borderColor: "hsl(var(--ring))",
    },
    color: "hsl(var(--foreground))",
    minHeight: "2.5rem",
    borderRadius: "0.5rem",
    padding: "0 0.25rem",
    fontSize: "0.875rem",
  }),
  menu: base => ({
    ...base,
    backgroundColor: "oklch(27.9% .041 260.031)",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
      ? "hsl(var(--accent))"
      : "transparent",
    color: state.isSelected
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--foreground))",
    cursor: "pointer",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
  }),
  singleValue: base => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  placeholder: base => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
  dropdownIndicator: base => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    '&:hover': {
      color: "hsl(var(--foreground))",
    },
  }),
  clearIndicator: base => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    '&:hover': {
      color: "hsl(var(--foreground))",
    },
  }),
  input: base => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
}


enum EmploymentType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
}

interface JobFormValues {
  title: string
  description: string
  requirements: string
  department?: string
  position?: string
  employmentType: EmploymentType
  location: string
  salaryRange?: string
  postedBy?: number
  closingDate?: Date
  isActive: boolean
  testId?: number
}

interface TestOption {
  id: number
  title: string
}

interface JobDetailDialogProps {
  job?: {
    id: number
    title: string
    description: string
    requirements: string
    department?: string
    position?: string
    employmentType: EmploymentType
    location: string
    salaryRange?: string
    postedBy?: number
    postedAt: Date
    closingDate?: Date
    isActive: boolean
    testId?: number
  }
  onSave: (values: JobFormValues) => Promise<void>
  tests: TestOption[]
  trigger?: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
}

export function JobDetailDialog({
  job,
  tests,
  token,
  onSave,
  trigger,
  open,
  setOpen,
}: JobDetailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const testOptions = tests.map(test => ({
    value: test.id,
    label: test.title,
  }))

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    shouldUnregister: false,
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      requirements: job?.requirements || "",
      department: job?.department || "",
      position: job?.position || "",
      employmentType: job?.employmentType || EmploymentType.FULL_TIME,
      location: job?.location || "",
      salaryRange: job?.salaryRange || "",
      postedBy: job?.postedBy,
      closingDate: job?.closingDate ? new Date(job.closingDate) : undefined,
      isActive: job?.isActive ?? true,
      testId: job?.testId,
    },
  })

  async function onSubmit(values: JobFormValues) {
    try {
      setIsSubmitting(true)
      await onSave(values)
      setOpen(false)
    } catch (error) {
      console.error("Failed to save job:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job Details" : "Create New Job"}</DialogTitle>
          <DialogDescription>
            {job
              ? "Update the job details below. Click save when you're done."
              : "Fill in the job details below to create a new job posting."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Job Title" id="title" {...register("title", { required: "Title is required" })} />
          <Textarea
            id="description"
            placeholder="Enter job description"
            {...register("description", { required: "Description is required" })}
          />
          <Textarea
            id="requirements"
            placeholder="Enter job requirements"
            {...register("requirements", { required: "Requirements are required" })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="department" placeholder="Department" {...register("department")} />
            <Input id="position" placeholder="Position" {...register("position")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="employmentType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EmploymentType).map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Input
              id="location"
              placeholder="Location"
              {...register("location", { required: "Location is required" })}
            />
          </div>

          <Input id="salaryRange" placeholder="Salary Range" {...register("salaryRange")} />

          <Controller
            control={control}
            name="closingDate"
            render={({ field }) => (
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full text-left", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />

          <Controller
            control={control}
            name="testId"
            render={({ field }) => (
              <div>
                <p>Active Test : {field.value}</p>
                <ReactSelect
                  styles={customStyles} 
                  value={testOptions.find(option => option.value === field.value) || null}
                  onChange={option => field.onChange(option?.value)}
                  options={testOptions}
                  isClearable
                  placeholder="Select a test..."
                  className="bg-dark"
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex justify-between items-center border p-4 rounded-md">
                <div>
                  <label htmlFor="isActive" className="text-base font-medium">Active Status</label>
                  <p className="text-sm text-muted-foreground">
                    Set whether this job posting is active and visible to applicants.
                  </p>
                </div>
                <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
