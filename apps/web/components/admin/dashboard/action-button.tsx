import { Button } from "@/components/ui/button"
import type { ElementType } from "react"

interface ActionButtonProps {
  icon: ElementType
  label: string
}

export function ActionButton({ icon: Icon, label }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-auto py-3 px-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col items-center justify-center space-y-1 w-full"
    >
      <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}
