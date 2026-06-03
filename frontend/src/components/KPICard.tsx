import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  color?: string
}

export const KPICard = ({ title, value, unit, icon: Icon, color = "solar" }: KPICardProps) => {
  // Map color strings to actual Tailwind classes
  const colorMap: Record<string, { bg: string, text: string }> = {
    "solar": { bg: "bg-solar/10", text: "text-solar" },
    "blue-500": { bg: "bg-blue-500/10", text: "text-blue-500" },
    "green-500": { bg: "bg-green-500/10", text: "text-green-500" },
    "emerald-500": { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  }
  
  const theme = colorMap[color] || colorMap["solar"]

  return (
    <Card className="overflow-hidden border-none bg-card/40 backdrop-blur-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-bold">{value}</h3>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${theme.bg}`}>
          <Icon className={`w-6 h-6 ${theme.text}`} />
        </div>
      </CardContent>
    </Card>
  )
}
