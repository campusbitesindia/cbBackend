"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Users, GraduationCap } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { login } from "@/services/authService"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["student", "campus"], { message: "Please select your role" }),
})

type UserRole = "student" | "campus"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: undefined,
    },
  })

  const selectedRole = form.watch("role")

  // Handle OAuth token from URL and show session expiration message
  useEffect(() => {
    const token = searchParams.get('token')
    const redirect = searchParams.get('redirect')
    const message = searchParams.get('message')
    
    if (message) {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: message,
      })
    }
    
    if (token) {
      loginWithToken(token)
      // Clean up URL and navigate
      if (redirect) {
        router.replace(redirect)
      } else {
        router.replace('/')
      }
    }
  }, [searchParams, loginWithToken, router, toast])

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    try {
      const { token } = await login({
        email: values.email,
        password: values.password,
        role: values.role,
      });

      loginWithToken(token);

      toast({
        title: "Welcome back! 🎉",
        description: `Successfully logged in as ${values.role}`,
      })

      // Role-based routing
      switch (values.role) {
        case "student":
          router.push("/student/dashboard")
          break
        case "campus":
          router.push("/campus/dashboard")
          break
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = "http://localhost:8080/api/v1/users/auth/google"
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "student":
        return <GraduationCap className="w-5 h-5" />
      case "campus":
        return <Users className="w-5 h-5" />
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "student":
        return "from-blue-500 to-purple-600"
      case "campus":
        return "from-green-500 to-emerald-600"
    }
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-[#0a192f] dark:via-[#1e3a5f] dark:to-[#0f172a] text-gray-900 dark:text-white flex items-center justify-center relative overflow-hidden transition-all duration-500">
      {/* Professional Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse transition-colors duration-500"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-500"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 dark:bg-white/5 rounded-full blur-2xl animate-pulse delay-2000 transition-colors duration-500"></div>

        {/* Floating Food Icons */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-red-500/10 dark:bg-red-500/10 rounded-full flex items-center justify-center animate-float">
          <span className="text-2xl">🍕</span>
        </div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-orange-500/10 dark:bg-orange-500/10 rounded-full flex items-center justify-center animate-float-delayed">
          <span className="text-xl">🍔</span>
        </div>
        <div className="absolute bottom-32 left-16 w-14 h-14 bg-yellow-500/10 dark:bg-yellow-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
          <span className="text-xl">🌮</span>
        </div>
      </div>

      <div className="flex w-full max-w-7xl mx-auto relative z-10">
        {/* Left Side - Enhanced Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <div className="text-center animate-slide-in-left">
            {/* Logo with Enhanced Animation */}
            <div className="mb-12">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-spin-slow opacity-20"></div>
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Campus Bites Logo"
                    width={80}
                    height={80}
                    className="rounded-full relative z-10"
                  />
                </div>
                {/* Orbiting Elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 bg-yellow-400 rounded-full animate-orbit"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-3 h-3 bg-green-400 rounded-full animate-orbit-reverse"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-3">
                Campus Bites
              </h1>
              <p className="text-gray-400 text-lg">Your premium campus food experience</p>
            </div>

            {/* Role-Based Features */}
            <div className="space-y-8">
              <div className="flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Students</h3>
                  <p className="text-gray-400">Order your favorite meals instantly</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Campus Partners</h3>
                  <p className="text-gray-400">Manage your restaurant & orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-3xl p-10 shadow-2xl animate-slide-in-right relative overflow-hidden transition-all duration-500">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 dark:from-red-500/5 via-transparent to-purple-500/5 dark:to-blue-500/5 rounded-3xl transition-all duration-500"></div>

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-500">Welcome Back!</h2>
                  <p className="text-gray-600 dark:text-slate-300 text-lg transition-colors duration-500">
                    New to Campus Bites?{" "}
                    <Link
                      href="/register"
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors hover:underline"
                    >
                      Join us here
                    </Link>
                  </p>
                </div>

                <div className="space-y-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Role Selection */}
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-slate-300 text-lg font-semibold transition-colors duration-500">I am a</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger 
                                  suppressHydrationWarning 
                                  className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-xl h-14 text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-500"
                                >
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-slate-800/90 backdrop-blur-xl border-gray-200 dark:border-white/20 transition-all duration-500">
                                <SelectItem value="student" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-500">
                                  <div className="flex items-center gap-3">
                                    <GraduationCap className="w-5 h-5 text-blue-400" />
                                    <span>Student</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="campus" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-500">
                                  <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-green-400" />
                                    <span>Campus Partner</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Google Login Button - Only show for students */}
                      {selectedRole === "student" && (
                        <>
                          <Button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full h-14 bg-white hover:bg-gray-50 dark:bg-white/90 dark:hover:bg-white text-slate-800 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                            disabled={isLoading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                              <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                              <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                              <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.641-3.252-11.284-7.614l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                              <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.018,35.244,44,30.028,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            </svg>
                            Sign in with Google
                          </Button>

                          <div className="relative flex items-center">
                            <div className="flex-grow border-t border-gray-300 dark:border-white/20 transition-colors duration-500"></div>
                            <span className="flex-shrink mx-4 text-gray-500 dark:text-white/60 transition-colors duration-500">OR</span>
                            <div className="flex-grow border-t border-gray-300 dark:border-white/20 transition-colors duration-500"></div>
                          </div>
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-slate-300 text-lg font-semibold transition-colors duration-500">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 w-6 h-6 transition-colors duration-500" />
                                <Input
                                  suppressHydrationWarning
                                  placeholder="Enter your email"
                                  type="email"
                                  autoComplete="email"
                                  className="pl-12 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-14 text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 dark:text-red-400 transition-colors duration-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-gray-700 dark:text-slate-300 text-lg font-semibold transition-colors duration-500">Password</FormLabel>
                              <Link
                                href="/forgot-password"
                                className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors hover:underline"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 w-6 h-6 transition-colors duration-500" />
                                <Input
                                  suppressHydrationWarning
                                  placeholder="Enter your password"
                                  type={showPassword ? "text" : "password"}
                                  autoComplete="current-password"
                                  className="pl-12 pr-12 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-14 text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
                                  {...field}
                                />
                                <button
                                  suppressHydrationWarning
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-500"
                                >
                                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 dark:text-red-400 transition-colors duration-500" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-14 bg-gradient-to-r ${
                          selectedRole ? getRoleColor(selectedRole) : 'from-gray-500 to-gray-600 dark:from-gray-500 dark:to-gray-600'
                        } text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}