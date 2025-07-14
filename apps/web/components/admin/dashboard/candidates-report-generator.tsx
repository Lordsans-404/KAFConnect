import * as XLSX from "xlsx"

interface Candidate {
  id: number
  userApplicant: { name: string; email: string }
  job: { title: string }
  status: string
  applicationDate: string
  resumePath?: string | null
}

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

interface Filters {
  status: string[]
  dateRange: string
}

export async function generateExcelReport(
  candidates: Candidate[],
  analyticsData: AnalyticsData,
  filters?: Filters,
) {
  const workbook = XLSX.utils.book_new()

  const totalJobs = analyticsData.departmentStats.reduce((sum, item) => sum + parseInt(item.jobs), 0)
  const totalApps = analyticsData.departmentStats.reduce((sum, item) => sum + parseInt(item.applications), 0)

  // Summary Sheet
  const summaryData = [
    ["Candidates Report Summary"],
    ["Generated on:", new Date().toLocaleDateString()],
    [""],
    ["Applied Filters:"],
    ["Status Filter:", filters?.status?.length ? filters.status.join(", ") : "None"],
    ["Date Range:", filters?.dateRange && filters.dateRange !== "all" ? filters.dateRange : "All Time"],
    [""],
    ["Summary Statistics:"],
    ["Total Candidates", candidates.length],
    ["Total Jobs Posted", totalJobs],
    ["Total Applications", totalApps],
    ["Active Departments", analyticsData.departmentStats.length],
  ]
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), "Summary")

  // Candidates Sheet
  const candidatesData = [
    ["Name", "Email", "Position", "Status", "Application Date", "Has Resume"],
    ...candidates.map((c) => [
      c.userApplicant.name,
      c.userApplicant.email,
      c.job.title,
      c.status.replace("_", " ").toUpperCase(),
      new Date(c.applicationDate).toLocaleDateString(),
      c.resumePath ? "Yes" : "No",
    ]),
  ]
  const candidateSheet = XLSX.utils.aoa_to_sheet(candidatesData)
  const range = XLSX.utils.decode_range(candidateSheet["!ref"] || "A1")
  candidateSheet["!cols"] = Array.from({ length: range.e.c + 1 }).map((_, i) => {
    const maxWidth = Math.max(
      ...candidatesData.map((row) => (row[i] ? row[i].toString().length : 10)),
      10,
    )
    return { width: Math.min(maxWidth + 2, 50) }
  })
  XLSX.utils.book_append_sheet(workbook, candidateSheet, "Candidates")

  // Department Analytics
  const departmentData = [
    ["Department", "Jobs", "Applications", "Applications per Job"],
    ...analyticsData.departmentStats.map((d) => [
      d.department,
      parseInt(d.jobs),
      parseInt(d.applications),
      d.jobs !== "0" ? +(parseInt(d.applications) / parseInt(d.jobs)).toFixed(2) : 0,
    ]),
  ]
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(departmentData), "Department Analytics")

  // Employment Analytics
  const employmentData = [
    ["Employment Type", "Jobs", "Applications", "Percentage of Total"],
    ...analyticsData.employmentStats.map((e) => [
      e.type,
      parseInt(e.jobs),
      parseInt(e.applications),
      `${Math.round((parseInt(e.applications) / totalApps) * 100)}%`,
    ]),
  ]
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(employmentData), "Employment Analytics")

  // Status Distribution
  const statusCounts = candidates.reduce((acc, c) => {
    const status = c.status.replace("_", " ").toUpperCase()
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = [
    ["Status", "Count", "Percentage"],
    ...Object.entries(statusCounts).map(([status, count]) => [
      status,
      count,
      `${Math.round((count / candidates.length) * 100)}%`,
    ]),
  ]
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(statusData), "Status Distribution")

  // Save file
  const fileName = `candidates-report-${new Date().toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
