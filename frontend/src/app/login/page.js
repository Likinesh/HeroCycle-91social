"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Hero Cycles</h1>
          <p className="text-muted-foreground text-sm mt-1">Pricing Engine</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-medium mb-6">Sign in</h2>
          
          {error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all"
                placeholder="admin@herocycles.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-muted-foreground mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg px-4 py-2.5 text-sm transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
