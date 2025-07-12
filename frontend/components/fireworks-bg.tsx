"use client"

import { useEffect, useRef } from "react"
import { fireworks } from "@tsparticles/fireworks"

interface FireworksBackgroundProps {
  className?: string
}

export default function FireworksBackground({ className = "" }: FireworksBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create fireworks with professional settings
    const startFireworks = () => {
      fireworks.create(containerRef.current!, {
        background: "transparent",
        colors: [
          "#ef4444", // red-500
          "#f97316", // orange-500
          "#eab308", // yellow-500
          "#22c55e", // green-500
          "#3b82f6", // blue-500
          "#8b5cf6", // purple-500
          "#ec4899", // pink-500
          "#f59e0b", // amber-500
          "#10b981", // emerald-500
          "#6366f1", // indigo-500
        ],
        gravity: { min: 0.1, max: 0.3 },
        minHeight: { min: 10, max: 30 },
        rate: { min: 3, max: 8 },
        saturation: { min: 50, max: 100 },
        brightness: { min: 50, max: 80 },
        speed: { min: 10, max: 25 },
        splitCount: { min: 50, max: 150 },
        sounds: false, // Disable sounds for web compatibility
      })
    }

    // Start fireworks immediately
    startFireworks()

    // Create interval for continuous fireworks
    const interval = setInterval(() => {
      startFireworks()
    }, 2000) // New fireworks every 2 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: "transparent",
        overflow: "hidden",
      }}
    />
  )
} 