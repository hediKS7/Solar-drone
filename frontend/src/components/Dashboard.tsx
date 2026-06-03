"use client"

import React from 'react'
import { useSimStore } from '@/store/useSimStore'
import { KPICard } from './KPICard'
import { 
  Battery, 
  Clock, 
  Zap, 
  Sun, 
  TrendingDown,
  AlertCircle,
  Leaf
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Dashboard = () => {
  const { result, loading } = useSimStore()

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-solar/20 border-t-solar rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Calculating simulation...</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="p-4 rounded-full bg-muted">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">No Simulation Data</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Adjust the parameters in the sidebar and click "RUN SIMULATION" to see the results.
          </p>
        </div>
      </div>
    )
  }

  // Downsample data for better performance if needed
  const chartData = result.time_series.filter((_, i) => i % 10 === 0).map(d => ({
    ...d,
    t_min: Math.round(d.t / 60),
    soc: parseFloat(d.soc.toFixed(1)),
    v_bat: parseFloat(d.v_bat.toFixed(2)),
  }))

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Flight Duration" 
          value={result.summary.duration_min} 
          unit="min" 
          icon={Clock} 
          color="blue-500" 
        />
        <KPICard 
          title="Final SoC" 
          value={result.summary.final_soc.toFixed(1)} 
          unit="%" 
          icon={Battery} 
          color="green-500" 
        />
        <KPICard 
          title="Solar Yield" 
          value={result.summary.solar_energy_wh.toFixed(1)} 
          unit="Wh" 
          icon={Sun} 
          color="solar" 
        />
        <KPICard 
          title="CO2 Reduction" 
          value={result.lca_metrics.reduction_pct} 
          unit="%" 
          icon={TrendingDown} 
          color="emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SoC and Voltage Chart */}
        <Card className="border-none bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Battery className="w-5 h-5 text-green-500" />
              State of Charge & Voltage
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t_min" label={{ value: 'Time (min)', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'SoC (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} label={{ value: 'Voltage (V)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="soc" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSoc)" 
                  name="SoC (%)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="v_bat" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="Voltage (V)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Power Balance Chart */}
        <Card className="border-none bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-solar" />
              Power Balance (W)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t_min" />
                <YAxis label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Area 
                  type="stepAfter" 
                  dataKey="p_load" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.1}
                  name="Drone Load"
                />
                <Area 
                  type="monotone" 
                  dataKey="p_solar" 
                  stroke="#F4D35E" 
                  fill="#F4D35E" 
                  fillOpacity={0.5}
                  name="Solar In"
                />
                <Area 
                  type="monotone" 
                  dataKey="p_bat" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                  name="Battery Net"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Summary */}
      <Card className="border-none bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            Environmental Impact (LCA)
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 rounded-lg bg-background/40">
                    <span className="text-sm text-muted-foreground">CO₂ Footprint (No Solar)</span>
                    <span className="font-bold">{result.lca_metrics.co2_no_solar} kg</span>
                 </div>
                 <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-sm text-emerald-400 font-medium">CO₂ Footprint (With Solar)</span>
                    <span className="font-bold text-emerald-400">{result.lca_metrics.co2_with_solar} kg</span>
                 </div>
                 <p className="text-xs text-muted-foreground italic">
                   * Based on 500 mission cycles and Tunisia grid emission factors.
                 </p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl">
                 <h4 className="text-4xl font-black text-emerald-500">-{result.lca_metrics.reduction_pct}%</h4>
                 <p className="text-sm font-medium uppercase tracking-tighter text-muted-foreground mt-2">Carbon Reduction</p>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
