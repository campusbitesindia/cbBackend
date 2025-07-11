"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ShieldCheck, Smartphone, Mail, X, AlertTriangle, Info, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useSecurity } from "@/context/security-context"

export function SecurityNotification() {
  const { currentPrompt, dismissPrompt, sendVerification, verifyCode, manageDevice } = useSecurity()
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [showCode, setShowCode] = useState(false)

  if (!currentPrompt) return null

  const handleAction = async (actionType: string) => {
    switch (actionType) {
      case 'verify_email':
        await sendVerification('device_verification')
        setShowVerificationDialog(true)
        break
        
      case 'trust_device':
        // In a real implementation, you'd get the current device ID
        const currentDeviceId = localStorage.getItem('current_device_id') || 'current'
        await manageDevice(currentDeviceId, 'trust')
        dismissPrompt()
        break
        
      case 'dismiss':
        dismissPrompt()
        break
    }
  }

  const handleVerification = async () => {
    if (!verificationCode.trim()) return
    
    setIsVerifying(true)
    const success = await verifyCode(verificationCode, 'device_verification')
    
    if (success) {
      setShowVerificationDialog(false)
      setVerificationCode("")
      dismissPrompt()
    }
    setIsVerifying(false)
  }

  const getIcon = () => {
    switch (currentPrompt.severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'medium':
        return <Shield className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getVariant = () => {
    switch (currentPrompt.severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <>
      {/* Main Security Notification */}
      <Card className="fixed bottom-4 right-4 w-96 max-w-sm shadow-lg border-l-4 border-l-blue-500 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm animate-slide-in-right z-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon()}
              <CardTitle className="text-sm font-medium">
                {currentPrompt.type === 'verification_recommended' ? 'Security Check' : 'New Device Detected'}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <CardDescription className="text-sm">
            {currentPrompt.message}
          </CardDescription>
          
          {currentPrompt.type === 'new_device_detected' && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Smartphone className="w-4 h-4" />
                <span className="font-medium">Campus Tip:</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Trusting this device will make future logins smoother on campus computers and phones.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 space-x-2">
          {currentPrompt.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.type === 'verify_email' ? 'default' : action.type === 'trust_device' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleAction(action.type)}
              className="text-xs"
            >
              {action.type === 'verify_email' && <Mail className="w-3 h-3 mr-1" />}
              {action.type === 'trust_device' && <ShieldCheck className="w-3 h-3 mr-1" />}
              {action.label}
            </Button>
          ))}
        </CardFooter>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Verify This Device
            </DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to your email. Enter it below to mark this device as trusted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Verification code sent to your registered email address.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <div className="relative">
                <Input
                  type={showCode ? "text" : "password"}
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pr-10"
                  maxLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCode(!showCode)}
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                The code will expire in 15 minutes
              </p>
            </div>
          </div>
          
          <DialogFooter className="space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowVerificationDialog(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerification}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="min-w-[80px]"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Verify'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Educational Security Tips Component
export function SecurityEducationBanner({ type }: { type: 'password' | 'device' | 'general' }) {
  const [isDismissed, setIsDismissed] = useState(false)
  const { markEducationPromptShown } = useSecurity()

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    markEducationPromptShown(type)
  }

  const getTip = () => {
    switch (type) {
      case 'password':
        return {
          title: "💡 Password Security Tip",
          message: "Use a unique password for your Campus Bites account. Consider using your campus credentials if available.",
          action: "Update Password"
        }
      case 'device':
        return {
          title: "📱 Device Management Tip",
          message: "Mark your personal devices as trusted for a smoother experience when ordering food on campus.",
          action: "Manage Devices"
        }
      default:
        return {
          title: "🔐 Security Tip",
          message: "Keep your account secure by enabling email notifications for login alerts.",
          action: "Security Settings"
        }
    }
  }

  const tip = getTip()

  return (
    <Alert className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 border-blue-200 dark:border-blue-800">
      <Shield className="w-4 h-4 text-blue-500" />
      <div className="flex items-center justify-between w-full">
        <div>
          <h4 className="font-medium text-blue-900 dark:text-blue-100">{tip.title}</h4>
          <AlertDescription className="text-blue-700 dark:text-blue-200">
            {tip.message}
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="sm" className="text-xs">
            {tip.action}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Alert>
  )
} 