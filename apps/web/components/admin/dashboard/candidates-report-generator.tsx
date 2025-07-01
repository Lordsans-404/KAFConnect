import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

interface Candidate {
  id: number
  userApplicant: {
    name: string
    email: string
  }
  job: {
    title: string
  }
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

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export async function generatePDFReport(candidates: Candidate[], analyticsData: AnalyticsData, filters: Filters) {
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Header
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("Candidates Report", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 10

  // Date and filters info
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  const reportDate = new Date().toLocaleDateString()
  pdf.text(`Generated on: ${reportDate}`, 20, yPosition)
  yPosition += 5

  if (filters.status.length > 0 || filters.dateRange !== "all") {
    pdf.text("Applied Filters:", 20, yPosition)
    yPosition += 4
    if (filters.status.length > 0) {
      pdf.text(`• Status: ${filters.status.join(", ")}`, 25, yPosition)
      yPosition += 4
    }
    if (filters.dateRange !== "all") {
      pdf.text(`• Date Range: ${filters.dateRange}`, 25, yPosition)
      yPosition += 4
    }
  }
  yPosition += 5

  // Summary Statistics
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Summary Statistics", 20, yPosition)
  yPosition += 8

  const totalApplications = analyticsData.departmentStats.reduce(
    (sum, item) => sum + Number.parseInt(item.applications),
    0,
  )
  const totalJobs = analyticsData.departmentStats.reduce((sum, item) => sum + Number.parseInt(item.jobs), 0)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")

  const summaryData = [
    ["Total Candidates", candidates.length.toString()],
    ["Total Jobs Posted", totalJobs.toString()],
    ["Total Applications", totalApplications.toString()],
    ["Average Applications per Job", totalJobs > 0 ? Math.round(totalApplications / totalJobs).toString() : "0"],
    ["Active Departments", analyticsData.departmentStats.length.toString()],
  ]

  autoTable(pdf,{
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: "center" },
    },
  })

  yPosition = (pdf as any).lastAutoTable.finalY + 15

  // Analytics Charts Section
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 20
  }

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Department Analytics", 20, yPosition)
  yPosition += 10

  // Department Statistics Table
  const departmentTableData = analyticsData.departmentStats.map((dept) => [
    dept.department,
    dept.jobs,
    dept.applications,
    dept.jobs !== "0" ? Math.round((Number.parseInt(dept.applications) / Number.parseInt(dept.jobs)) * 100) / 100 : 0,
  ])

  autoTable(pdf,{
    startY: yPosition,
    head: [["Department", "Jobs", "Applications", "Apps/Job Ratio"]],
    body: departmentTableData,
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "center" },
      3: { cellWidth: 35, halign: "center" },
    },
  })

  yPosition = (pdf as any).lastAutoTable.finalY + 15

  // Employment Type Analytics
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 20
  }

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Employment Type Analytics", 20, yPosition)
  yPosition += 10

  const employmentTableData = analyticsData.employmentStats.map((emp) => [
    emp.type,
    emp.jobs,
    emp.applications,
    `${Math.round((Number.parseInt(emp.applications) / totalApplications) * 100)}%`,
  ])

  autoTable(pdf,{
    startY: yPosition,
    head: [["Employment Type", "Jobs", "Applications", "% of Total"]],
    body: employmentTableData,
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "center" },
      3: { cellWidth: 35, halign: "center" },
    },
  })

  yPosition = (pdf as any).lastAutoTable.finalY + 15

  // Candidates Table
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 20
  }

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Candidate Details", 20, yPosition)
  yPosition += 10

  const candidateTableData = candidates.map((candidate) => [
    candidate.userApplicant.name,
    candidate.userApplicant.email,
    candidate.job.title,
    candidate.status.replace("_", " ").toUpperCase(),
    new Date(candidate.applicationDate).toLocaleDateString(),
  ])

  autoTable(pdf,{
    startY: yPosition,
    head: [["Name", "Email", "Position", "Status", "Applied Date"]],
    body: candidateTableData,
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
    },
  })

  // Footer
  const totalPages = pdf.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" })
  }

  // Save the PDF
  const fileName = `candidates-report-${new Date().toISOString().split("T")[0]}.pdf`
  pdf.save(fileName)
}

export async function generateExcelReport(candidates: Candidate[], analyticsData: AnalyticsData, filters: Filters) {
  const workbook = XLSX.utils.book_new()

  // Summary Sheet
  const summaryData = [
    ["Candidates Report Summary"],
    ["Generated on:", new Date().toLocaleDateString()],
    [""],
    ["Applied Filters:"],
    ["Status Filter:", filters.status.length > 0 ? filters.status.join(", ") : "None"],
    ["Date Range:", filters.dateRange === "all" ? "All Time" : filters.dateRange],
    [""],
    ["Summary Statistics:"],
    ["Total Candidates", candidates.length],
    ["Total Jobs Posted", analyticsData.departmentStats.reduce((sum, item) => sum + Number.parseInt(item.jobs), 0)],
    [
      "Total Applications",
      analyticsData.departmentStats.reduce((sum, item) => sum + Number.parseInt(item.applications), 0),
    ],
    ["Active Departments", analyticsData.departmentStats.length],
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

  // Candidates Sheet
  const candidatesData = [
    ["Name", "Email", "Position", "Status", "Application Date", "Has Resume"],
    ...candidates.map((candidate) => [
      candidate.userApplicant.name,
      candidate.userApplicant.email,
      candidate.job.title,
      candidate.status.replace("_", " ").toUpperCase(),
      new Date(candidate.applicationDate).toLocaleDateString(),
      candidate.resumePath ? "Yes" : "No",
    ]),
  ]

  const candidatesSheet = XLSX.utils.aoa_to_sheet(candidatesData)

  // Auto-size columns
  const candidatesRange = XLSX.utils.decode_range(candidatesSheet["!ref"] || "A1")
  const candidatesColWidths = []
  for (let C = candidatesRange.s.c; C <= candidatesRange.e.c; ++C) {
    let maxWidth = 10
    for (let R = candidatesRange.s.r; R <= candidatesRange.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = candidatesSheet[cellAddress]
      if (cell && cell.v) {
        const cellLength = cell.v.toString().length
        if (cellLength > maxWidth) maxWidth = cellLength
      }
    }
    candidatesColWidths.push({ width: Math.min(maxWidth + 2, 50) })
  }
  candidatesSheet["!cols"] = candidatesColWidths

  XLSX.utils.book_append_sheet(workbook, candidatesSheet, "Candidates")

  // Department Analytics Sheet
  const departmentData = [
    ["Department", "Jobs", "Applications", "Applications per Job"],
    ...analyticsData.departmentStats.map((dept) => [
      dept.department,
      Number.parseInt(dept.jobs),
      Number.parseInt(dept.applications),
      dept.jobs !== "0" ? Math.round((Number.parseInt(dept.applications) / Number.parseInt(dept.jobs)) * 100) / 100 : 0,
    ]),
  ]

  const departmentSheet = XLSX.utils.aoa_to_sheet(departmentData)
  XLSX.utils.book_append_sheet(workbook, departmentSheet, "Department Analytics")

  // Employment Type Analytics Sheet
  const totalApplications = analyticsData.departmentStats.reduce(
    (sum, item) => sum + Number.parseInt(item.applications),
    0,
  )

  const employmentData = [
    ["Employment Type", "Jobs", "Applications", "Percentage of Total"],
    ...analyticsData.employmentStats.map((emp) => [
      emp.type,
      Number.parseInt(emp.jobs),
      Number.parseInt(emp.applications),
      `${Math.round((Number.parseInt(emp.applications) / totalApplications) * 100)}%`,
    ]),
  ]

  const employmentSheet = XLSX.utils.aoa_to_sheet(employmentData)
  XLSX.utils.book_append_sheet(workbook, employmentSheet, "Employment Analytics")

  // Status Distribution Sheet
  const statusCounts = candidates.reduce(
    (acc, candidate) => {
      const status = candidate.status.replace("_", " ").toUpperCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statusData = [
    ["Status", "Count", "Percentage"],
    ...Object.entries(statusCounts).map(([status, count]) => [
      status,
      count,
      `${Math.round((count / candidates.length) * 100)}%`,
    ]),
  ]

  const statusSheet = XLSX.utils.aoa_to_sheet(statusData)
  XLSX.utils.book_append_sheet(workbook, statusSheet, "Status Distribution")

  // Save the Excel file
  const fileName = `candidates-report-${new Date().toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
