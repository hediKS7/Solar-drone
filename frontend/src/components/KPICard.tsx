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
        <div className={`p-3 rounded-xl bg-${color}/10`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}
