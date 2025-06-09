import { BarChart3, LineChart } from "lucide-react"
import type { ElementType } from "react"

interface MetricCardProps {
  title: string
  value: number
  icon: ElementType
  trend: "up" | "down" | "stable"
  color: string
  detail: string
}

export function MetricCard({ title, value, icon: Icon, trend, color, detail }: MetricCardProps) {
  // Determine border color based on metric type
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-100 dark:border-cyan-900/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-100 dark:border-green-900/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-100 dark:border-blue-900/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-100 dark:border-cyan-900/30"
    }
  }

  // Determine trend icon based on metric direction
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <BarChart3 className="h-4 w-4 text-green-500" />
      case "down":
        return <BarChart3 className="h-4 w-4 rotate-180 text-red-500" />
      case "stable":
        return <LineChart className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className={`bg-white dark:bg-slate-700 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-600 dark:text-slate-300">{title}</div>
        <Icon className="h-5 w-5 text-cyan-500" />
      </div>
      <div className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{detail}</div>
      <div className="absolute bottom-2 right-2 flex items-center">{getTrendIcon()}</div>
    </div>
  )
}
