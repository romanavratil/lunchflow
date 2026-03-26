"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    restaurantName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Auto sign-in after signup
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">LunchFlow</span>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-white text-2xl font-bold tracking-tight mb-1">Create your account</h1>
          <p className="text-white/40 text-sm mb-7">Get started — it&apos;s free</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-white/60 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-white/60 mb-1.5">
                  Restaurant
                </label>
                <input
                  type="text"
                  value={form.restaurantName}
                  onChange={(e) => set("restaurantName", e.target.value)}
                  placeholder="Bistro Roma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-white/60 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@restaurant.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
