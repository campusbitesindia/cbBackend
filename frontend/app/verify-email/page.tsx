"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Mail, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Try to get email from query params or localStorage
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("verify_email", emailParam);
    } else {
      setEmail(localStorage.getItem("verify_email") || "");
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (!otp || !email) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/v1/users/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setShowConfetti(true);
        toast({ title: "Email Verified!", description: "Your account is now active. Redirecting..." });
        setTimeout(() => router.push("/login"), 2500);
      } else {
        toast({ variant: "destructive", title: "Invalid OTP", description: data.message || "Please check your code and try again." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Verification Failed", description: "Something went wrong. Please try again." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resend: true })
      });
      if (res.ok) {
        toast({ title: "OTP Resent", description: "A new verification code has been sent to your email." });
        setCooldown(60);
      } else {
        toast({ variant: "destructive", title: "Resend Failed", description: "Could not resend OTP. Please try again later." });
      }
    } catch {
      toast({ variant: "destructive", title: "Resend Failed", description: "Could not resend OTP. Please try again later." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b] px-4">
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center relative overflow-hidden">
        {/* Brand Logo */}
        <div className="mb-2">
          <Image src="/logo.png" alt="Campus Bites Logo" width={48} height={48} className="rounded-full" />
        </div>
        {/* Step Indicator */}
        <div className="w-full flex items-center justify-center mb-4">
          <span className="text-xs text-gray-500 tracking-wide">Step 2 of 2: Email Verification</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full mb-6">
          <div className="h-1 bg-blue-500 rounded-full transition-all duration-500" style={{ width: '100%' }} />
        </div>
        <Mail className="w-12 h-12 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-center">Verify Your Email</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          We’ve sent a verification code to <span className="font-semibold text-blue-600">{email}</span>.<br />
          Please enter it below to activate your account.
        </p>
        {/* Animated OTP Input */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full flex flex-col items-center"
        >
          <InputOTP
            maxLength={4}
            value={otp}
            onChange={setOtp}
            disabled={isVerifying || success}
            aria-label="Enter verification code"
            autoFocus
            render={({ slots }) => (
              <InputOTPGroup className="justify-center mb-4 gap-2">
                {slots.map((slot, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <InputOTPSlot
                      index={idx}
                      className={`w-12 h-12 text-xl border-2 rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${otp[idx] ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
                    />
                    {otp[idx] && <CheckCircle className="w-4 h-4 text-green-500 absolute -top-2 -right-2" />}
                  </motion.div>
                ))}
              </InputOTPGroup>
            )}
          />
        </motion.div>
        <Button
          className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 rounded-xl transition-all duration-300"
          onClick={handleVerify}
          disabled={otp.length !== 4 || isVerifying || success}
          aria-label="Verify email"
        >
          {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />} Verify
        </Button>
        <div className="flex items-center justify-between w-full mt-6">
          <span className="text-sm text-gray-500">Didn’t get the code?</span>
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-800 px-2"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            aria-label="Resend code"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? "Resending..." : "Resend Code"}
          </Button>
        </div>
        {/* Need Help Link */}
        <div className="w-full flex justify-end mt-2">
          <a href="mailto:support@campusbites.in" className="text-xs text-blue-500 hover:underline">Need help?</a>
        </div>
        {success && (
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-gray-900/80 rounded-2xl"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-green-700 mb-2">Email verified!</h2>
                <p className="text-gray-700 dark:text-gray-200 mb-4">Redirecting to login...</p>
                {/* Confetti animation (simple dots) */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {[...Array(20)].map((_, i) => (
                    <span key={i} className="inline-block w-2 h-2 rounded-full" style={{ background: `hsl(${i * 18}, 80%, 60%)` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
} 