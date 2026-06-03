"use client"

import React from 'react'
import { useSimStore } from '@/store/useSimStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Battery, Sun, Wind, Leaf, Play } from 'lucide-react'

export const Sidebar = () => {
  const { 
    battery, setBattery, 
    solar, setSolar, 
    environment, setEnvironment,
    mission, setMission,
    runSimulation, loading,
    userEmail, logout
  } = useSimStore()

  return (
    <div className="w-80 h-full overflow-y-auto border-r bg-card/50 backdrop-blur-md p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-solar flex items-center justify-center shadow-[0_0_15px_rgba(244,211,94,0.3)]">
            <Wind className="text-solar-dark w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SolarDrone Pro</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-solar hover:bg-solar/10"
          onClick={logout}
          title="Logout"
        >
          <Lock className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/10">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Authenticated User</p>
        <p className="text-xs font-medium text-solar truncate">{userEmail}</p>
      </div>

      <Tabs defaultValue="battery" className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-12">
          <TabsTrigger value="battery" title="Battery"><Battery className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="solar" title="Solar"><Sun className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="mission" title="Mission"><Play className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="env" title="Environment"><Leaf className="w-4 h-4" /></TabsTrigger>
        </TabsList>

        <TabsContent value="battery" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Series (S)</Label>
                  <span className="text-xs font-mono">{battery.nSeries}</span>
                </div>
                <Slider 
                  value={[battery.nSeries]} 
                  min={1} max={12} step={1} 
                  onValueChange={(v) => setBattery({ nSeries: Array.isArray(v) ? v[0] : v })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Parallel (P)</Label>
                  <span className="text-xs font-mono">{battery.nParallel}</span>
                </div>
                <Slider 
                  value={[battery.nParallel]} 
                  min={1} max={10} step={1} 
                  onValueChange={(v) => setBattery({ nParallel: Array.isArray(v) ? v[0] : v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nominal Capacity (Ah)</Label>
                <Input 
                  type="number" 
                  value={battery.qNom} 
                  onChange={(e) => setBattery({ qNom: parseFloat(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solar" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Panel Specs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Area (m²)</Label>
                <Input 
                  type="number" 
                  value={solar.aPanel} 
                  step="0.01"
                  onChange={(e) => setSolar({ aPanel: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Efficiency (%)</Label>
                  <span className="text-xs font-mono">{(solar.etaPanel * 100).toFixed(0)}%</span>
                </div>
                <Slider 
                  value={[solar.etaPanel * 100]} 
                  min={5} max={40} step={1} 
                  onValueChange={(v) => setSolar({ etaPanel: (Array.isArray(v) ? v[0] : v) / 100 })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mission" className="mt-4 space-y-4">
           {mission.map((phase, idx) => (
             <Card key={idx}>
               <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{phase.name}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                     <Label className="text-[10px]">Min</Label>
                     <Input 
                       type="number" 
                       value={phase.durationMin} 
                       className="h-8 text-xs"
                       onChange={(e) => {
                         const val = parseFloat(e.target.value)
                         if (isNaN(val)) return
                         const newMission = mission.map((p, i) => 
                           i === idx ? { ...p, durationMin: val } : p
                         )
                         setMission(newMission)
                       }}
                     />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-[10px]">Watts</Label>
                     <Input 
                       type="number" 
                       value={phase.powerW} 
                       className="h-8 text-xs"
                       onChange={(e) => {
                         const val = parseFloat(e.target.value)
                         if (isNaN(val)) return
                         const newMission = mission.map((p, i) => 
                           i === idx ? { ...p, powerW: val } : p
                         )
                         setMission(newMission)
                       }}
                     />
                   </div>
                 </div>
               </CardContent>
             </Card>
           ))}
        </TabsContent>

        <TabsContent value="env" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Irradiance (W/m²)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Min (Morning)</Label>
                <Slider 
                  value={[environment.gMin]} 
                  min={0} max={1000} step={50} 
                  onValueChange={(v) => setEnvironment({ gMin: Array.isArray(v) ? v[0] : v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max (Noon)</Label>
                <Slider 
                  value={[environment.gMax]} 
                  min={0} max={1200} step={50} 
                  onValueChange={(v) => setEnvironment({ gMax: Array.isArray(v) ? v[0] : v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cloud Factor</Label>
                <Slider 
                  value={[environment.cloudFactor * 100]} 
                  min={0} max={100} step={5} 
                  onValueChange={(v) => setEnvironment({ cloudFactor: (Array.isArray(v) ? v[0] : v) / 100 })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-auto pt-4">
        <Button 
          className="w-full h-12 bg-solar hover:bg-solar-dark text-black font-bold gap-2"
          onClick={runSimulation}
          disabled={loading}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          RUN SIMULATION
        </Button>
      </div>
    </div>
  )
}
