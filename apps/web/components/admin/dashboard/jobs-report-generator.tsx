import jsPDF from "jspdf"
import {autoTable} from "jspdf-autotable" // Correct import
import * as XLSX from "xlsx"
import html2canvas from "html2canvas"

interface Job {
  id: string
  title: string
  department: string
  location: string
  postedAt: string
  applications?: any[]
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

declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

export async function generateJobsPDFReport(jobs: Job[], analyticsData: AnalyticsData) {
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Header
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.text("Jobs & Analytics Report", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 10

  // Date and summary info
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  const reportDate = new Date().toLocaleDateString()
  pdf.text(`Generated on: ${reportDate}`, 20, yPosition)
  yPosition += 10

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
    ["Total Active Jobs", jobs.length.toString()],
    ["Total Jobs Posted", totalJobs.toString()],
    ["Total Applications Received", totalApplications.toString()],
    ["Average Applications per Job", totalJobs > 0 ? Math.round(totalApplications / totalJobs).toString() : "0"],
    ["Active Departments", analyticsData.departmentStats.length.toString()],
    ["Employment Types", analyticsData.employmentStats.length.toString()],
  ]

  autoTable(pdf,{
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [6, 182, 212] }, // cyan-500
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: "center" },
    },
  })

  yPosition = (pdf as any).lastAutoTable.finalY + 15

  // Try to capture charts as images
  try {
    // Capture Department Chart
    const departmentChartElement = document.querySelector('[data-chart="department-analytics"]') as HTMLElement
    if (departmentChartElement) {
      if (yPosition > pageHeight - 100) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Department Analytics Chart", 20, yPosition)
      yPosition += 10

      const departmentCanvas = await html2canvas(departmentChartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const departmentImgData = departmentCanvas.toDataURL("image/png")
      const imgWidth = 170
      const imgHeight = (departmentCanvas.height * imgWidth) / departmentCanvas.width

      if (yPosition + imgHeight > pageHeight - 20) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.addImage(departmentImgData, "PNG", 20, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 15
    }

    // Capture Employment Type Chart
    const employmentChartElement = document.querySelector('[data-chart="employment-analytics"]') as HTMLElement
    if (employmentChartElement) {
      if (yPosition > pageHeight - 100) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Employment Type Analytics Chart", 20, yPosition)
      yPosition += 10

      const employmentCanvas = await html2canvas(employmentChartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const employmentImgData = employmentCanvas.toDataURL("image/png")
      const imgWidth = 170
      const imgHeight = (employmentCanvas.height * imgWidth) / employmentCanvas.width

      if (yPosition + imgHeight > pageHeight - 20) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.addImage(employmentImgData, "PNG", 20, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 15
    }
  } catch (error) {
    console.warn("Could not capture charts as images, falling back to tables:", error)
  }

  // Department Analytics Table (fallback or additional data)
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 20
  }

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Department Analytics Data", 20, yPosition)
  yPosition += 10

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
    headStyles: { fillColor: [6, 182, 212] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "center" },
      3: { cellWidth: 35, halign: "center" },
    },
  })

  yPosition = (pdf as any).lastAutoTable.finalY + 15

  // Employment Type Analytics Table
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 20
  }

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Employment Type Analytics Data", 20, yPosition)
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
    headStyles: { fillColor: [6, 182, 212] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "center" },
      3: { cellWidth: 35, halign: "center" },
    },
  })

  yPosition = (pdf as any).lastAutoTable.finalY + 15

  // Jobs Listing
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 20
  }

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text("Active Job Listings", 20, yPosition)
  yPosition += 10

  const jobsTableData = jobs.map((job) => [
    job.title,
    job.department,
    job.location,
    job.applications?.length ?? 0,
    new Date(job.postedAt).toLocaleDateString(),
  ])

  autoTable(pdf,{
    startY: yPosition,
    head: [["Job Title", "Department", "Location", "Applications", "Posted Date"]],
    body: jobsTableData,
    theme: "grid",
    headStyles: { fillColor: [6, 182, 212] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 30 },
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
  const fileName = `jobs-analytics-report-${new Date().toISOString().split("T")[0]}.pdf`
  pdf.save(fileName)
}

export async function generateJobsExcelReport(jobs: Job[], analyticsData: AnalyticsData) {
  const workbook = XLSX.utils.book_new()

  // Summary Sheet
  const totalApplications = analyticsData.departmentStats.reduce(
    (sum, item) => sum + Number.parseInt(item.applications),
    0,
  )
  const totalJobs = analyticsData.departmentStats.reduce((sum, item) => sum + Number.parseInt(item.jobs), 0)

  const summaryData = [
    ["Jobs & Analytics Report Summary"],
    ["Generated on:", new Date().toLocaleDateString()],
    [""],
    ["Summary Statistics:"],
    ["Total Active Jobs", jobs.length],
    ["Total Jobs Posted", totalJobs],
    ["Total Applications Received", totalApplications],
    ["Average Applications per Job", totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0],
    ["Active Departments", analyticsData.departmentStats.length],
    ["Employment Types", analyticsData.employmentStats.length],
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

  // Jobs Sheet
  const jobsData = [
    ["Job Title", "Department", "Location", "Applications", "Posted Date", "Days Since Posted"],
    ...jobs.map((job) => [
      job.title,
      job.department,
      job.location,
      job.applications?.length ?? 0,
      new Date(job.postedAt).toLocaleDateString(),
      Math.floor((new Date().getTime() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24)),
    ]),
  ]

  const jobsSheet = XLSX.utils.aoa_to_sheet(jobsData)

  // Auto-size columns
  const jobsRange = XLSX.utils.decode_range(jobsSheet["!ref"] || "A1")
  const jobsColWidths = []
  for (let C = jobsRange.s.c; C <= jobsRange.e.c; ++C) {
    let maxWidth = 10
    for (let R = jobsRange.s.r; R <= jobsRange.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = jobsSheet[cellAddress]
      if (cell && cell.v) {
        const cellLength = cell.v.toString().length
        if (cellLength > maxWidth) maxWidth = cellLength
      }
    }
    jobsColWidths.push({ width: Math.min(maxWidth + 2, 50) })
  }
  jobsSheet["!cols"] = jobsColWidths

  XLSX.utils.book_append_sheet(workbook, jobsSheet, "Active Jobs")

  // Department Analytics Sheet
  const departmentData = [
    ["Department", "Jobs", "Applications", "Applications per Job", "% of Total Jobs", "% of Total Applications"],
    ...analyticsData.departmentStats.map((dept) => [
      dept.department,
      Number.parseInt(dept.jobs),
      Number.parseInt(dept.applications),
      dept.jobs !== "0" ? Math.round((Number.parseInt(dept.applications) / Number.parseInt(dept.jobs)) * 100) / 100 : 0,
      `${Math.round((Number.parseInt(dept.jobs) / totalJobs) * 100)}%`,
      `${Math.round((Number.parseInt(dept.applications) / totalApplications) * 100)}%`,
    ]),
  ]

  const departmentSheet = XLSX.utils.aoa_to_sheet(departmentData)
  XLSX.utils.book_append_sheet(workbook, departmentSheet, "Department Analytics")

  // Employment Type Analytics Sheet
  const employmentData = [
    ["Employment Type", "Jobs", "Applications", "% of Total Jobs", "% of Total Applications"],
    ...analyticsData.employmentStats.map((emp) => [
      emp.type,
      Number.parseInt(emp.jobs),
      Number.parseInt(emp.applications),
      `${Math.round((Number.parseInt(emp.jobs) / totalJobs) * 100)}%`,
      `${Math.round((Number.parseInt(emp.applications) / totalApplications) * 100)}%`,
    ]),
  ]

  const employmentSheet = XLSX.utils.aoa_to_sheet(employmentData)
  XLSX.utils.book_append_sheet(workbook, employmentSheet, "Employment Analytics")

  // Performance Analysis Sheet
  const performanceData = [
    ["Job Title", "Department", "Applications", "Days Posted", "Applications per Day"],
    ...jobs.map((job) => {
      const daysPosted = Math.max(
        1,
        Math.floor((new Date().getTime() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24)),
      )
      const applicationsPerDay = (job.applications?.length ?? 0) / daysPosted
      return [
        job.title,
        job.department,
        job.applications?.length ?? 0,
        daysPosted,
        Math.round(applicationsPerDay * 100) / 100,
      ]
    }),
  ]

  const performanceSheet = XLSX.utils.aoa_to_sheet(performanceData)
  XLSX.utils.book_append_sheet(workbook, performanceSheet, "Job Performance")

  // Save the Excel file
  const fileName = `jobs-analytics-report-${new Date().toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
