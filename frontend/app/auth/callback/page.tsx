"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Loader2, XCircle } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken } = useAuth()
  const { toast } = useToast()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Google authentication failed. Please try again.",
      })
      setStatus("error")
      setTimeout(() => router.push("/login"), 3000)
      return
    }

    if (token) {
      loginWithToken(token)
      toast({
        title: "Welcome to Campus Bites! 🎉",
        description: "Successfully signed in with Google.",
      })
      setStatus("success")
      setTimeout(() => router.push("/student/dashboard"), 2000) // Redirect to student dashboard
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "No authentication token was received.",
      })
      setStatus("error")
      setTimeout(() => router.push("/login"), 3000)
    }
  }, [searchParams, router, loginWithToken, toast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto p-8">
        <div className="bg-gray-800/30 backdrop-blur-2xl border border-gray-700/30 rounded-3xl p-12 shadow-2xl">
          {status === "processing" && (
            <>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Signing you in...</h1>
              <p className="text-gray-400">Please wait while we complete your Google authentication.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Authentication Complete!</h1>
              <p className="text-gray-400">Redirecting you to your dashboard...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Authentication Failed</h1>
              <p className="text-gray-400">Redirecting you to the login page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
