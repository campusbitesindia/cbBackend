"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const verifySchema = z.object({
  email: z.string().email("Enter a valid email"),
  otp: z
    .string()
    .min(4, "OTP must be at least 4 characters")
    .max(8, "OTP must be at most 8 characters"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyMailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormData) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://campusbites-mxpe.onrender.com/api/v1/usersverifyEmail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (res.ok && result.success) {
        toast({
          title: "Email Verified ✅",
          description: "Your email has been successfully verified.",
        });
        router.push("/login");
      } else {
        toast({
          title: "Verification Failed ❌",
          description: result.message || "Invalid OTP or email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the email address you registered with and the OTP sent to your inbox.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* OTP Field */}
          <div>
            <Input
              type="text"
              placeholder="Enter OTP"
              {...register("otp")}
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </div>
    </div>
  );
}
