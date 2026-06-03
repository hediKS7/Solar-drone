"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  size?: number
}

export const Logo: React.FC<LogoProps> = ({ className, size = 40 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-solar/20 rounded-xl blur-lg animate-pulse" />
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full"
      >
        {/* Solar Panel Grid Base */}
        <rect x="20" y="30" width="60" height="40" rx="4" fill="#1a1a1a" stroke="url(#logoGradient)" strokeWidth="2" />
        <line x1="40" y1="30" x2="40" y2="70" stroke="url(#logoGradient)" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="60" y1="30" x2="60" y2="70" stroke="url(#logoGradient)" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="url(#logoGradient)" strokeWidth="1" strokeOpacity="0.5" />

        {/* Drone Propellers/Arms (Minimalist) */}
        <motion.g
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Top Left Arm */}
          <path d="M15 25L30 35" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="15" cy="25" r="3" fill="#F4D35E" />
          
          {/* Top Right Arm */}
          <path d="M85 25L70 35" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="85" cy="25" r="3" fill="#F4D35E" />
          
          {/* Bottom Left Arm */}
          <path d="M15 75L30 65" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="15" cy="75" r="3" fill="#F4D35E" />
          
          {/* Bottom Right Arm */}
          <path d="M85 75L70 65" stroke="url(#logoGradient)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="85" cy="75" r="3" fill="#F4D35E" />
        </motion.g>

        {/* Center Core */}
        <rect x="42" y="45" width="16" height="10" rx="2" fill="url(#logoGradient)" />
        <circle cx="50" cy="50" r="2" fill="#000" />

        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4D35E" />
            <stop offset="1" stopColor="#E9C46A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
