"use client"

import React, { useState } from 'react'
import { useSimStore } from '@/store/useSimStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from './Logo'

export const Login = () => {
  const { login } = useSimStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Validation logic
    setTimeout(() => {
      if (!email.endsWith('@ept.ucar.tn')) {
        setError('Invalid email. Must be an @ept.ucar.tn address.')
        setIsSubmitting(false)
        return
      }

      if (password !== 'energy_2026') {
        setError('Incorrect password.')
        setIsSubmitting(false)
        return
      }

      login(email)
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-solar/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-solar to-transparent" />
          
          <CardHeader className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <Logo size={64} className="shadow-[0_0_30px_rgba(244,211,94,0.3)]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase">SOLARDRONE PRO</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-base font-medium tracking-wide">
              Precision Simulation Interface
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">
                    Institutional Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-solar transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="username@ept.ucar.tn"
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-solar/50 focus:ring-solar/20 transition-all rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground ml-1">
                    Access Key
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-solar transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-solar/50 focus:ring-solar/20 transition-all rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-solar hover:bg-solar-dark text-black font-bold rounded-xl shadow-[0_0_20px_rgba(244,211,94,0.2)] hover:shadow-[0_0_30px_rgba(244,211,94,0.3)] transition-all group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    INITIATE SYSTEM
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground pt-2">
                &copy; 2026 Engineering Project Lab. All rights reserved.
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
