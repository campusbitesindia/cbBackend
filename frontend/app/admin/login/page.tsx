"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Placeholder: Replace with real API call
    if (email === "admin@campusbites.com" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b]">
      <form onSubmit={handleLogin} className="bg-white/10 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white text-center">Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
      </form>
    </div>
  );
} 