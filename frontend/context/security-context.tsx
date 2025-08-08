"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

type SecurityDevice = {
  deviceId: string
  deviceName: string
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown'
  browser: string
  os: string
  lastActive: string
  firstSeen: string
  isActive: boolean
  isTrusted: boolean
  sessionCount: number
}

type SecurityEvent = {
  type: string
  description: string
  deviceInfo: any
  riskLevel: 'low' | 'medium' | 'high'
  resolved: boolean
  timestamp: string
}

type SecurityPrompt = {
  type: 'verification_recommended' | 'new_device_detected' | 'educational'
  message: string
  severity: 'low' | 'medium' | 'high'
  actions: Array<{
    type: string
    label: string
    endpoint?: string
  }>
}

type SecuritySettings = {
  emailNotifications: boolean
  loginAlerts: boolean
  deviceManagement: boolean
  maxDevices: number
}

type SecurityContextType = {
  // Security Dashboard Data
  securityScore: number
  scoreCategory: 'excellent' | 'good' | 'needs_improvement'
  devices: SecurityDevice[]
  recentEvents: SecurityEvent[]
  recommendations: Array<{
    type: string
    title: string
    description: string
    impact: 'low' | 'medium' | 'high'
    action: string
  }>
  settings: SecuritySettings

  // Security States
  isLoading: boolean
  currentPrompt: SecurityPrompt | null
  
  // Actions
  fetchSecurityDashboard: () => Promise<void>
  handleSecurityPrompt: (prompt: SecurityPrompt) => void
  dismissPrompt: () => void
  manageDevice: (deviceId: string, action: 'trust' | 'remove' | 'rename', newName?: string) => Promise<void>
  sendVerification: (purpose?: string) => Promise<void>
  verifyCode: (code: string, purpose?: string) => Promise<boolean>
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>
  markEducationPromptShown: (promptType: string) => Promise<void>
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

// Custom hook to use Security Context
export function useSecurity() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}

export function SecurityProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  
  // Security Dashboard State
  const [securityScore, setSecurityScore] = useState(100)
  const [scoreCategory, setScoreCategory] = useState<'excellent' | 'good' | 'needs_improvement'>('excellent')
  const [devices, setDevices] = useState<SecurityDevice[]>([])
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [settings, setSettings] = useState<SecuritySettings>({
    emailNotifications: true,
    loginAlerts: true,
    deviceManagement: true,
    maxDevices: 5
  })
  
  // UI State
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<SecurityPrompt | null>(null)

  // 📊 Fetch Security Dashboard Data
  const fetchSecurityDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/v1/security/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSecurityScore(data.securityScore)
        setScoreCategory(data.scoreCategory)
        setDevices(data.devices)
        setRecentEvents(data.recentEvents)
        setRecommendations(data.recommendations)
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch security dashboard:', error)
      toast({
        variant: "destructive",
        title: "Security Dashboard Error",
        description: "Failed to load security information"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // 🔔 Handle Security Prompts
  const handleSecurityPrompt = useCallback((prompt: SecurityPrompt) => {
    setCurrentPrompt(prompt)
    
    // Show toast notification for important prompts
    if (prompt.severity === 'medium' || prompt.severity === 'high') {
      toast({
        title: "Security Notice",
        description: prompt.message,
        duration: 5000
      })
    }
  }, [toast])

  // ✋ Dismiss Current Prompt
  const dismissPrompt = useCallback(() => {
    setCurrentPrompt(null)
  }, [])

  // 📱 Device Management
  const manageDevice = useCallback(async (deviceId: string, action: 'trust' | 'remove' | 'rename', newName?: string) => {
    try {
      const body: any = { deviceId, action }
      if (newName) body.newName = newName

      const response = await fetch('/api/v1/security/devices/manage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        setSecurityScore(data.securityScore)
        
        // Update devices list
        await fetchSecurityDashboard()
        
        toast({
          title: "Device Updated",
          description: data.message
        })
      } else {
        throw new Error('Failed to manage device')
      }
    } catch (error) {
      console.error('Device management error:', error)
      toast({
        variant: "destructive",
        title: "Device Management Failed",
        description: "Unable to update device settings"
      })
    }
  }, [fetchSecurityDashboard, toast])

  // 📧 Send Verification Code
  const sendVerification = useCallback(async (purpose = 'login_verification') => {
    try {
      const response = await fetch('/api/v1/security/verification/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ purpose })
      })

      if (response.ok) {
        toast({
          title: "Verification Sent",
          description: "Check your email for the verification code"
        })
      } else {
        throw new Error('Failed to send verification')
      }
    } catch (error) {
      console.error('Send verification error:', error)
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Unable to send verification code"
      })
    }
  }, [toast])

  // ✅ Verify Code
  const verifyCode = useCallback(async (code: string, purpose = 'login_verification'): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/security/verification/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, purpose })
      })

      if (response.ok) {
        const data = await response.json()
        setSecurityScore(data.securityScore)
        
        toast({
          title: "Verification Successful",
          description: "Your device has been verified"
        })
        
        return true
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Invalid or expired verification code"
        })
        return false
      }
    } catch (error) {
      console.error('Verify code error:', error)
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Unable to verify code"
      })
      return false
    }
  }, [toast])

  // ⚙️ Update Security Settings
  const updateSecuritySettings = useCallback(async (newSettings: Partial<SecuritySettings>) => {
    try {
      const response = await fetch('/api/v1/security/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setSecurityScore(data.securityScore)
        
        toast({
          title: "Settings Updated",
          description: "Your security preferences have been saved"
        })
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Settings update error:', error)
      toast({
        variant: "destructive",
        title: "Settings Update Failed",
        description: "Unable to save security settings"
      })
    }
  }, [toast])

  // 🎓 Mark Education Prompt as Shown
  const markEducationPromptShown = useCallback(async (promptType: string) => {
    try {
      await fetch(`/api/v1/security/education/${promptType}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'shown' })
      })
    } catch (error) {
      console.error('Education prompt error:', error)
    }
  }, [])

  // Initialize security dashboard on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchSecurityDashboard()
    }
  }, [fetchSecurityDashboard])

  return (
    <SecurityContext.Provider
      value={{
        securityScore,
        scoreCategory,
        devices,
        recentEvents,
        recommendations,
        settings,
        isLoading,
        currentPrompt,
        fetchSecurityDashboard,
        handleSecurityPrompt,
        dismissPrompt,
        manageDevice,
        sendVerification,
        verifyCode,
        updateSecuritySettings,
        markEducationPromptShown
      }}
    >
      {children}
    </SecurityContext.Provider>
  )
}