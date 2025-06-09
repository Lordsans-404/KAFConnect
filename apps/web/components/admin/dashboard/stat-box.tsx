interface StatBoxProps {
  label: string
  value: number
}

export function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700 rounded-md p-3 border border-slate-200 dark:border-slate-600">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  )
}
