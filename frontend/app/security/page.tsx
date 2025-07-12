"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Settings,
  Trash2,
  Star
} from "lucide-react"
import { useSecurity } from "@/context/security-context"
import { SecurityEducationBanner } from "@/components/security/SecurityNotification"

export default function SecurityDashboard() {
  const {
    securityScore,
    scoreCategory,
    devices,
    recentEvents,
    recommendations,
    isLoading,
    fetchSecurityDashboard,
    manageDevice
  } = useSecurity()

  useEffect(() => {
    fetchSecurityDashboard()
  }, [fetchSecurityDashboard])

  const getScoreColor = () => {
    if (securityScore >= 80) return "text-green-500"
    if (securityScore >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreDescription = () => {
    if (securityScore >= 80) return "Your account security is excellent! 🛡️"
    if (securityScore >= 60) return "Your account security is good, but can be improved 📈"
    return "Your account needs security improvements ⚠️"
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed_login':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'new_device':
        return <Smartphone className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account security and monitor recent activity
          </p>
        </div>

        {/* Educational Banner */}
        <SecurityEducationBanner type="general" />

        {/* Security Score Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Score
            </CardTitle>
            <CardDescription>
              Your overall account security rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`text-4xl font-bold ${getScoreColor()}`}>
                  {securityScore}%
                </div>
                <Badge variant={scoreCategory === 'excellent' ? 'default' : scoreCategory === 'good' ? 'secondary' : 'destructive'}>
                  {scoreCategory.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getScoreDescription()}
                </p>
              </div>
            </div>
            <Progress value={securityScore} className="w-full" />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Your Devices ({devices.length})
              </CardTitle>
              <CardDescription>
                Manage devices that have access to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.slice(0, 3).map((device) => (
                <div key={device.deviceId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.deviceType)}
                    <div>
                      <div className="font-medium text-sm">{device.deviceName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last active: {formatDate(device.lastActive)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.isTrusted && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Trusted
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => manageDevice(device.deviceId, device.isTrusted ? 'remove' : 'trust')}
                    >
                      {device.isTrusted ? <Trash2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
              {devices.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No devices registered
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest security events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                  <Badge 
                    variant={event.riskLevel === 'high' ? 'destructive' : event.riskLevel === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {event.riskLevel}
                  </Badge>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Security Recommendations
              </CardTitle>
              <CardDescription>
                Suggested actions to improve your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rec.impact === 'high' ? 'destructive' : 'secondary'}>
                      {rec.impact} impact
                    </Badge>
                    <Button variant="outline" size="sm">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 