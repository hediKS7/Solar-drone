"use client"

import React from 'react'
import { useSimStore } from '@/store/useSimStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Battery, Sun, Leaf, Play, Lock, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'

export const Sidebar = () => {
  const { 
    battery, setBattery, 
    solar, setSolar, 
    environment, setEnvironment,
    mission, setMission,
    runSimulation, loading,
    userEmail, logout
  } = useSimStore()

  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring' as const, 
        damping: 20, 
        stiffness: 100,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="w-80 h-full overflow-y-auto border-r border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl p-4 flex flex-col gap-6 relative z-20"
    >
      {/* Sidebar Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white leading-tight">SOLARDRONE</h1>
            <p className="text-[10px] font-bold text-solar tracking-[0.2em] uppercase opacity-80">Pro Simulator</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-solar hover:bg-solar/10 rounded-lg transition-all"
          onClick={logout}
          title="Logout"
        >
          <Lock className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* User Info */}
      <motion.div variants={itemVariants} className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 group hover:border-solar/30 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-solar to-solar-dark flex items-center justify-center text-black font-bold text-xs">
          {userEmail?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Pilot Session</p>
          <p className="text-xs font-medium text-white truncate">{userEmail}</p>
        </div>
      </motion.div>

      {/* Main Tabs Configuration */}
      <motion.div variants={itemVariants} className="flex-1">
        <Tabs defaultValue="battery" className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-11 bg-white/5 p-1 rounded-xl border border-white/5">
            <TabsTrigger value="battery" className="rounded-lg data-[state=active]:bg-solar data-[state=active]:text-black transition-all">
              <Battery className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="solar" className="rounded-lg data-[state=active]:bg-solar data-[state=active]:text-black transition-all">
              <Sun className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="mission" className="rounded-lg data-[state=active]:bg-solar data-[state=active]:text-black transition-all">
              <Play className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="env" className="rounded-lg data-[state=active]:bg-solar data-[state=active]:text-black transition-all">
              <Leaf className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="battery" className="mt-4 space-y-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cell Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-white/70">Series (S)</Label>
                        <span className="text-xs font-mono font-bold text-solar">{battery.nSeries}</span>
                      </div>
                      <Slider 
                        value={[battery.nSeries]} 
                        min={1} max={12} step={1} 
                        onValueChange={(v) => setBattery({ nSeries: Array.isArray(v) ? v[0] : v })}
                        className="py-1"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-white/70">Parallel (P)</Label>
                        <span className="text-xs font-mono font-bold text-solar">{battery.nParallel}</span>
                      </div>
                      <Slider 
                        value={[battery.nParallel]} 
                        min={1} max={10} step={1} 
                        onValueChange={(v) => setBattery({ nParallel: Array.isArray(v) ? v[0] : v })}
                        className="py-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Nominal Capacity (Ah)</Label>
                      <Input 
                        type="number" 
                        value={battery.qNom} 
                        className="h-9 bg-white/5 border-white/10 rounded-lg text-xs focus:ring-solar/20"
                        onChange={(e) => setBattery({ qNom: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="solar" className="mt-4 space-y-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Generation Specs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Panel Area (m²)</Label>
                      <Input 
                        type="number" 
                        value={solar.aPanel} 
                        step="0.01"
                        className="h-9 bg-white/5 border-white/10 rounded-lg text-xs"
                        onChange={(e) => setSolar({ aPanel: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-white/70">Efficiency (%)</Label>
                        <span className="text-xs font-mono font-bold text-solar">{(solar.etaPanel * 100).toFixed(0)}%</span>
                      </div>
                      <Slider 
                        value={[solar.etaPanel * 100]} 
                        min={5} max={40} step={1} 
                        onValueChange={(v) => setSolar({ etaPanel: (Array.isArray(v) ? v[0] : v) / 100 })}
                        className="py-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="mission" className="mt-4 space-y-3 focus-visible:outline-none h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {mission.map((phase, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-2 tracking-widest">{phase.name}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-white/50">Duration (min)</Label>
                        <Input 
                          type="number" 
                          value={phase.durationMin} 
                          className="h-8 bg-black/20 border-white/5 rounded-lg text-xs"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            if (isNaN(val)) return
                            setMission(mission.map((p, i) => i === idx ? { ...p, durationMin: val } : p))
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-white/50">Load (Watts)</Label>
                        <Input 
                          type="number" 
                          value={phase.powerW} 
                          className="h-8 bg-black/20 border-white/5 rounded-lg text-xs"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            if (isNaN(val)) return
                            setMission(mission.map((p, i) => i === idx ? { ...p, powerW: val } : p))
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="env" className="mt-4 space-y-4 focus-visible:outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Irradiance (W/m²)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-white/70">Morning Min</Label>
                        <span className="text-xs font-mono font-bold text-solar">{environment.gMin}</span>
                      </div>
                      <Slider 
                        value={[environment.gMin]} 
                        min={0} max={1000} step={50} 
                        onValueChange={(v) => setEnvironment({ gMin: Array.isArray(v) ? v[0] : v })}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-white/70">Noon Peak</Label>
                        <span className="text-xs font-mono font-bold text-solar">{environment.gMax}</span>
                      </div>
                      <Slider 
                        value={[environment.gMax]} 
                        min={0} max={1200} step={50} 
                        onValueChange={(v) => setEnvironment({ gMax: Array.isArray(v) ? v[0] : v })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Footer / Action */}
      <motion.div variants={itemVariants} className="mt-auto pt-4">
        <Button 
          className="w-full h-14 bg-solar hover:bg-solar-dark text-black font-black rounded-2xl shadow-[0_0_20px_rgba(244,211,94,0.1)] hover:shadow-[0_0_30px_rgba(244,211,94,0.3)] transition-all group overflow-hidden relative"
          onClick={runSimulation}
          disabled={loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <div className="flex items-center justify-center gap-2 relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="w-4 h-4 fill-current" />
              </motion.div>
              RUN SIMULATION
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
          {/* Animated Background Pulse */}
          {!loading && (
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}
