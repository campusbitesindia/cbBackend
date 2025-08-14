"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPass: z.string().min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPass, {
    message: "Passwords do not match",
    path: ["confirmPass"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setLoading(true);
      const res = await fetch( `https://campusbites-mxpe.onrender.com/api/v1/users/resetPassword/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: "Password has been reset successfully. Please log in.",
        });
        router.push("/login");
      } else {
        toast({
          title: "Error",
          description: result.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <p className="text-sm text-slate-600 mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="New Password"
              {...register("password")}
              className="w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Confirm New Password"
              {...register("confirmPass")}
              className="w-full"
            />
            {errors.confirmPass && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPass.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
