"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Gift, LogIn, RefreshCw, MapPin } from "lucide-react"
import { getAllCampuses, Campus } from "@/services/campusService"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import api from "@/lib/axios"

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string()
      .regex(/^\d{10}$/, { message: "Mobile number must be exactly 10 digits" })
      .refine((val) => Number(val) > 0, { message: "Mobile number must be positive" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    role: z.enum(['student', 'canteen'], { message: 'Please select a valid role' }),
    campus: z.string().min(1, { message: 'Please select a campus' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(true)
  const [existingUserDialog, setExistingUserDialog] = useState<{
    open: boolean
    message: string
    suggestions: string[]
    userInfo?: {
      hasGoogleAuth: boolean
      isVerified: boolean
      registrationMethod: string
    }
  }>({
    open: false,
    message: "",
    suggestions: [],
  })
  const [campusInput, setCampusInput] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', email: '', mobile: '', collegeName: '', city: '', message: '' });
  const [requestLoading, setRequestLoading] = useState(false);
  // Add a new state to track if a campus is selected
  const [campusSelected, setCampusSelected] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  // Autocomplete filter
  const filteredCampuses = campusInput
    ? campuses.filter((c) => c.name.toLowerCase().includes(campusInput.toLowerCase()))
    : campuses;

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      campus: "",
      phone: "",
    },
  })

  // Fetch campuses on component mount
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        setIsLoadingCampuses(true)
        const response = await getAllCampuses()
        setCampuses(response.campuses)
      } catch (error) {
        console.error('Error fetching campuses:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load campuses. Please refresh the page.',
        })
      } finally {
        setIsLoadingCampuses(false)
      }
    }

    fetchCampuses()
  }, [toast])

  useEffect(() => {
    form.setValue('role', 'student');
  }, [form]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    try {
      await register(values.name, values.email, values.password, values.role, values.campus, values.phone); // <-- pass campus _id and phone
      setPendingEmail(values.email);
      setShowOtpDialog(true);
      toast({
        title: "Almost done!",
        description: "Please verify your email with the OTP sent to your inbox.",
      }) 
    } catch (error) {
      // Handle existing user professionally
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          if (errorData.userExists) {
            setExistingUserDialog({
              open: true,
              message: errorData.message,
              suggestions: errorData.suggestions || [],
              userInfo: errorData.userInfo
            })
            return
          }
        } catch {
          // Not a JSON error, fall through to regular error handling
        }
      }
      
      // Regular error handling for other types of errors
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8080/api/v1/users/auth/google"
  }

  const handleGoToSignIn = () => {
    setExistingUserDialog(prev => ({ ...prev, open: false }))
    router.push('/login')
  }

  async function handleRequestCampus() {
    setRequestLoading(true);
    try {
      // Get the role from the registration form (default to 'student' if not set)
      const role = form.getValues('role') || 'student';
      // Use the campus input as collegeName
      const collegeName = requestForm.collegeName || campusInput;
      await api.post('/api/v1/admin/campus-request', {
        name: requestForm.name,
        email: requestForm.email,
        mobile: requestForm.mobile,
        role,
        collegeName,
        city: requestForm.city,
        message: requestForm.message,
      });
      toast({ title: 'Campus request submitted!', description: 'Our team will review it.' });
      setShowRequestDialog(false);
      setRequestForm({ name: '', email: '', mobile: '', collegeName: '', city: '', message: '' });
    } catch (err: any) {
      toast({ title: 'Failed to submit campus request', description: err.message, variant: 'destructive' });
    } finally {
      setRequestLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setIsVerifyingOtp(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const res = await api.post("/api/v1/users/verify-email", { email: pendingEmail, otp });
      if (res.data.success) {
        setOtpSuccess("Email verified successfully! You can now log in.");
        setTimeout(() => {
          setShowOtpDialog(false);
          router.push("/login");
        }, 1500);
      } else {
        setOtpError(res.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Invalid OTP or server error");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-[#0a192f] dark:via-[#1e3a5f] dark:to-[#0f172a] text-gray-900 dark:text-white flex items-center justify-center relative overflow-hidden transition-all duration-500">
      {/* Professional Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse transition-colors duration-500"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-500"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 dark:bg-white/5 rounded-full blur-2xl animate-pulse delay-2000 transition-colors duration-500"></div>

        {/* Floating Food Icons */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-purple-500/10 dark:bg-purple-500/10 rounded-full flex items-center justify-center animate-float">
          <span className="text-2xl">🎂</span>
        </div>
        <div className="absolute top-40 left-32 w-12 h-12 bg-green-500/10 dark:bg-green-500/10 rounded-full flex items-center justify-center animate-float-delayed">
          <span className="text-xl">🥤</span>
        </div>
        <div className="absolute bottom-32 right-16 w-14 h-14 bg-blue-500/10 dark:bg-blue-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
          <span className="text-xl">🍜</span>
        </div>
        <div className="absolute bottom-20 left-20 w-10 h-10 bg-pink-500/10 dark:bg-pink-500/10 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-lg">🍰</span>
        </div>
      </div>

      <div className="flex w-full max-w-6xl mx-auto relative z-10">
        {/* Left Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-3xl p-8 shadow-2xl animate-slide-in-left transition-all duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-500">Join Campus Bites!</h2>
                <p className="text-gray-600 dark:text-slate-300 transition-colors duration-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-slate-300 transition-colors duration-500">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 w-5 h-5 transition-colors duration-500" />
                            <Input
                              placeholder="Enter your full name"
                              autoComplete="name"
                              className="pl-10 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-slate-300 transition-colors duration-500">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 w-5 h-5 transition-colors duration-500" />
                            <Input
                              placeholder="Enter your email"
                              type="email"
                              autoComplete="email"
                              className="pl-10 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 transition-colors duration-500" />
                      </FormItem>
                    )}
                  />

                  {/* Remove the role dropdown and display only 'Student' */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-slate-300 transition-colors duration-500">I am a</FormLabel>
                        <FormControl>
                          <div className="pl-10 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-xl h-12 flex items-center font-semibold">
                            Student
                          </div>
                        </FormControl>
                        <input type="hidden" value="student" name="role" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="campus"
                    render={({ field }) => {
                      const selectedCampusObj = campuses.find(c => c._id === field.value);
                      return (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-slate-300 transition-colors duration-500">Campus</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 w-5 h-5 pointer-events-none flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                              </span>
                              {/* Hidden input for form value (campus _id) */}
                              <input type="hidden" value={field.value} name="campus" />
                              {/* Display input for user (campus name/city) */}
                              <Input
                                placeholder="Type your campus name"
                                value={campusSelected && selectedCampusObj ? (selectedCampusObj.name + (selectedCampusObj.city ? ` (${selectedCampusObj.city})` : '')) : campusInput}
                                readOnly={campusSelected}
                                onChange={e => {
                                  setCampusInput(e.target.value);
                                  setCampusSelected(false);
                                  field.onChange('');
                                }}
                                className="pl-10 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
                                style={{ lineHeight: '1.5', height: '48px' }}
                              />
                              {/* Clear button */}
                              {campusSelected && (
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                  onClick={() => {
                                    setCampusInput('');
                                    setCampusSelected(false);
                                    field.onChange('');
                                  }}
                                  tabIndex={-1}
                                  aria-label="Clear campus selection"
                                >
                                  ×
                                </button>
                              )}
                              {/* Autocomplete dropdown */}
                              {!campusSelected && campusInput && filteredCampuses.length > 0 && (
                                <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full mt-1 max-h-48 overflow-y-auto">
                                  {filteredCampuses.map((campus) => (
                                    <div
                                      key={campus._id}
                                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-black"
                                      onClick={() => {
                                        setCampusInput(campus.name + (campus.city ? ` (${campus.city})` : ''));
                                        field.onChange(campus._id); // <-- always set to _id
                                        setCampusSelected(true);
                                      }}
                                    >
                                      {campus.name} {campus.city ? <span className="text-gray-400 text-sm">({campus.city})</span> : null}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Request Campus link */}
                              {!campusSelected && campusInput && filteredCampuses.length === 0 && (
                                <div className="mt-2 text-blue-400 cursor-pointer underline" onClick={() => setShowRequestDialog(true)}>
                                  Can’t find your campus? <span className="font-semibold">Request to add it</span>
                                </div>
                              )}
                              {/* Helper message if not selected */}
                              {!campusSelected && campusInput && !filteredCampuses.some(c => c.name === campusInput) && (
                                <div className="mt-2 text-red-500 text-xs">Please select a campus from the list.</div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 dark:text-red-400 transition-colors duration-500" />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-slate-300 transition-colors duration-500">Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter your mobile number"
                              type="tel"
                              autoComplete="tel"
                              maxLength={10}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={field.value}
                              onChange={e => {
                                // Only allow digits
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                field.onChange(val);
                              }}
                              className="pl-4 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
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
                        <FormLabel className="text-gray-700 dark:text-slate-300 transition-colors duration-500">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 w-5 h-5 transition-colors duration-500" />
                            <Input
                              placeholder="Create a password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="pl-10 pr-10 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-500"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 transition-colors duration-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-slate-300 transition-colors duration-500">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 w-5 h-5 transition-colors duration-500" />
                            <Input
                              placeholder="Confirm your password"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="pl-10 pr-10 bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 rounded-xl h-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm duration-500"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors duration-500"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400 transition-colors duration-500" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !campusSelected || !campuses.some(c => c._id === form.getValues('campus'))}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25 group"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-white/20 transition-colors duration-500"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white/90 dark:bg-white/10 backdrop-blur-xl px-4 text-gray-600 dark:text-slate-400 transition-all duration-500">Or sign up with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <a href="http://localhost:8080/api/auth/google" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238
	C43.021,36.697,44,34.0,44,30C44,22.659,43.862,21.35,43.611,20.083z" />
                      </svg>
                      Sign up with Google
                    </Button>
                  </a>
                </div>
              </div>

              <p className="mt-6 text-xs text-center text-gray-500 dark:text-slate-500 transition-colors duration-500">
                By creating an account, you agree to our{" "}
                <Link href="#" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <div className="text-center animate-slide-in-right">
            {/* Special Offer */}
            <div className="mb-8 p-6 bg-gradient-to-r from-red-500/5 dark:from-red-500/10 to-rose-500/5 dark:to-rose-500/10 border border-red-500/10 dark:border-red-500/20 rounded-2xl backdrop-blur-sm transition-all duration-500">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-500">Welcome Bonus!</h2>
              <p className="text-red-600 dark:text-red-300 font-semibold text-lg transition-colors duration-500">Get 20% OFF on your first order</p>
              <p className="text-gray-600 dark:text-slate-400 text-sm mt-2 transition-colors duration-500">Plus free delivery for your first month</p>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold transition-colors duration-500">Instant Access</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm transition-colors duration-500">Start ordering immediately after signup</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">💎</span>
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold transition-colors duration-500">Premium Features</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm transition-colors duration-500">Order tracking, favorites, and more</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold transition-colors duration-500">Loyalty Rewards</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm transition-colors duration-500">Earn points with every order</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Existing User Dialog */}
      <AlertDialog open={existingUserDialog.open} onOpenChange={(open) => setExistingUserDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/20 transition-all duration-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white transition-colors duration-500">
              Account Already Exists
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-slate-300 transition-colors duration-500">
              {existingUserDialog.message}
              
              {existingUserDialog.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-gray-700 dark:text-slate-200">What you can do:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {existingUserDialog.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-600 dark:text-slate-400">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            {existingUserDialog.userInfo?.hasGoogleAuth ? (
              <>
                <AlertDialogAction
                  onClick={handleGoogleSignIn}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="mr-2">
                    <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.641-3.252-11.284-7.614l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.018,35.244,44,30.028,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                  Sign in with Google
                </AlertDialogAction>
              </>
            ) : (
              <>
                <AlertDialogAction
                  onClick={handleGoToSignIn}
                  className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In Instead
                </AlertDialogAction>
                {!existingUserDialog.userInfo?.isVerified && (
                  <AlertDialogAction
                    onClick={() => {
                      setExistingUserDialog(prev => ({ ...prev, open: false }))
                      toast({
                        title: "Check your email",
                        description: "Please check your email for the verification link or request a new one from the login page.",
                      })
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verify Email
                  </AlertDialogAction>
                )}
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Campus Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request New Campus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Your Name" value={requestForm.name} onChange={e => setRequestForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Email" value={requestForm.email} onChange={e => setRequestForm(f => ({ ...f, email: e.target.value }))} />
            <Input placeholder="Mobile" value={requestForm.mobile} onChange={e => setRequestForm(f => ({ ...f, mobile: e.target.value }))} />
            <Input placeholder="College Name" value={requestForm.collegeName} onChange={e => setRequestForm(f => ({ ...f, collegeName: e.target.value }))} />
            <Input placeholder="City" value={requestForm.city} onChange={e => setRequestForm(f => ({ ...f, city: e.target.value }))} />
            <Input placeholder="Message (optional)" value={requestForm.message} onChange={e => setRequestForm(f => ({ ...f, message: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button onClick={handleRequestCampus} disabled={requestLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full">
              {requestLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Email Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-200">Enter the OTP sent to <span className="font-semibold">{pendingEmail}</span></p>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
            />
            {otpError && <div className="text-red-500 text-sm">{otpError}</div>}
            {otpSuccess && <div className="text-green-600 text-sm">{otpSuccess}</div>}
          </div>
          <DialogFooter>
            <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp || !otp} className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full">
              {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
