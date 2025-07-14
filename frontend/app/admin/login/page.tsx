"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/services/authService";
import { useAdminAuth } from "@/context/admin-auth-context";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: setAdminAuth } = useAdminAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await adminLogin({ username, password });
      if (data && data.token) {
        localStorage.setItem("isAdmin", "true");
        setAdminAuth();
        router.push("/admin/dashboard");
      } else {
        setError("Invalid admin credentials");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b]">
      <form onSubmit={handleLogin} className="bg-white/10 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white text-center">Admin Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="p-3 rounded bg-white/20 text-white placeholder:text-slate-300 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-3 rounded bg-white/20 text-white placeholder:text-slate-300 focus:outline-none"
          required
        />
        {error && <div className="text-red-400 text-center">{error}</div>}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-2 text-center">
          <span className="text-gray-300">username: admin, password: admin123</span>
        </div>
      </form>
    </div>
  );
} 