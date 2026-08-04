"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Mail, Lock, Wallet, Globe } from "lucide-react";

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setGoogleError(null);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setGoogleError(error.message);
      setGoogleLoading(false);
    }
    // On success Supabase redirects the browser — no further action needed.
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: wire up auth action
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#0c1322] selection:bg-[#4edea3]/30 selection:text-[#4edea3]">
      <Card
        className="w-full max-w-md relative overflow-hidden shadow-sm"
        style={{
          backgroundColor: "#191f2f",
          borderColor: "#444748",
          borderRadius: "0.5rem",
        }}
      >
        {/* Subtle top-edge accent */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #4edea3, transparent)" }}
        />

        <CardHeader className="flex flex-col items-center justify-center pt-6 pb-2 gap-0">
          {/* Logo icon */}
          <div
            className="w-10 h-10 flex items-center justify-center mb-3 rounded-md"
            style={{ backgroundColor: "#4edea3", border: "1px solid #444748" }}
          >
            <Wallet className="w-6 h-6" style={{ color: "#0c1322" }} />
          </div>

          <CardTitle
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "#dce2f7", fontFamily: "Inter, sans-serif" }}
          >
            Expense Flow
          </CardTitle>

          <CardDescription
            className="mt-1.5 text-sm"
            style={{ color: "#c4c7c8" }}
          >
            Financial Terminal Access
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium tracking-wide"
                style={{ color: "#dce2f7" }}
              >
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "#8e9192" }}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="operator@expenseflow.io"
                  required
                  className="pl-10 text-sm transition-colors focus-visible:ring-1"
                  style={{
                    backgroundColor: "#0c1322",
                    borderColor: "#444748",
                    color: "#dce2f7",
                    // placeholder handled via CSS below via tailwind
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-medium tracking-wide"
                style={{ color: "#dce2f7" }}
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "#8e9192" }}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 text-sm transition-colors focus-visible:ring-1"
                  style={{
                    backgroundColor: "#0c1322",
                    borderColor: "#444748",
                    color: "#dce2f7",
                  }}
                />
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  className="border-[#444748] data-[state=checked]:bg-[#4edea3] data-[state=checked]:border-[#4edea3] data-[state=checked]:text-[#003824]"
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm cursor-pointer select-none"
                  style={{ color: "#c4c7c8" }}
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm underline underline-offset-4 transition-colors hover:text-[#4edea3]"
                style={{ color: "#c4c7c8" }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full group flex items-center justify-center gap-2 font-medium text-sm py-3 h-10 transition-all hover:opacity-90 hover:shadow-lg"
              style={{
                backgroundColor: "#ffffff",
                color: "#0c1322",
                borderRadius: "0.375rem",
              }}
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <Separator className="flex-1" style={{ backgroundColor: "#444748" }} />
            <span
              className="shrink-0 mx-4 text-xs px-2"
              style={{ color: "#8e9192", backgroundColor: "#191f2f" }}
            >
              Or continue with
            </span>
            <Separator className="flex-1" style={{ backgroundColor: "#444748" }} />
          </div>

          {/* SSO options */}
          <div className="space-y-3 pb-0">
            {googleError && (
              <p className="text-xs text-center" style={{ color: "#f87171" }}>
                {googleError}
              </p>
            )}
            <Button
              id="google-signin-btn"
              type="button"
              variant="outline"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 text-sm font-medium py-3 h-10 transition-colors hover:bg-[#4edea3]/10 hover:border-[#4edea3]/40 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#0c1322",
                borderColor: "#444748",
                color: "#dce2f7",
                borderRadius: "0.375rem",
              }}
            >
              <Globe className="w-4 h-4" />
              {googleLoading ? "Redirecting…" : "Google"}
            </Button>
          </div>

        </CardContent>

      
      </Card>
    </main>
  );
}
