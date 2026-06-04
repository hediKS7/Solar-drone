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
  Leaf,
  Sparkles,
  Brain
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
  Line
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

export const Dashboard = () => {
  const { result, loading, aiAnalysis, isAnalyzing } = useSimStore()

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
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50 custom-scrollbar">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Environmental Impact Summary */}
        <Card className="xl:col-span-1 border-none bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              Environmental Impact (LCA)
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-3 rounded-lg bg-background/40 border border-white/5">
                      <span className="text-sm text-muted-foreground">CO₂ Footprint (No Solar)</span>
                      <span className="font-bold">{result.lca_metrics.co2_no_solar} kg</span>
                   </div>
                   <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm text-emerald-400 font-medium">CO₂ Footprint (With Solar)</span>
                      <span className="font-bold text-emerald-400">{result.lca_metrics.co2_with_solar} kg</span>
                   </div>
                </div>
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                   <h4 className="text-4xl font-black text-emerald-500">-{result.lca_metrics.reduction_pct}%</h4>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">Carbon Reduction</p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* AI Insights Card */}
        <Card className="xl:col-span-2 border-none bg-gradient-to-br from-indigo-500/10 to-solar/10 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain size={120} className="text-white" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-solar animate-pulse" />
              AI Mission Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 min-h-[250px]">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div 
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 gap-4"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-solar/20 animate-ping absolute inset-0" />
                    <Brain className="w-12 h-12 text-solar relative z-10" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Mistral AI is processing mission data...</p>
                </motion.div>
              ) : aiAnalysis ? (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="prose prose-invert prose-sm max-w-none 
                    prose-headings:text-solar prose-headings:mb-1 prose-headings:mt-3 
                    prose-p:text-white/70 prose-p:leading-snug prose-li:text-white/70
                    prose-strong:text-solar prose-strong:font-bold
                    bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner"
                >
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm text-muted-foreground italic">Simulation results ready for AI analysis.</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
