import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Northlane" },
      { name: "description", content: "Sign in to manage Northlane journal and customer stories." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "otp">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  async function redirectBasedOnRole(userId: string) {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (data?.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/" });
      }
    } catch {
      navigate({ to: "/" });
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) redirectBasedOnRole(data.user.id);
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If email confirmation is required, session will be null
        if (!data.session) {
          setMode("otp");
          toast.success("Verification code sent to your email.");
          return;
        }
        toast.success("Account created successfully!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully!");
      }
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await redirectBasedOnRole(data.user.id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth" },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (error) throw error;
      if (data.session && data.user) {
        toast.success("Email verified successfully!");
        await redirectBasedOnRole(data.user.id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back to home */}
      <div className="container-editorial pt-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Northlane
        </Link>
      </div>

      <div className="container-editorial flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="headline text-3xl">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to manage your studio orders, wishlist, and recommendations."
                : "Join Northlane for exclusive workspace gear, order tracking, and AI assistance."}
            </p>
          </div>

          {mode !== "otp" && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium transition hover:border-foreground/40 hover:bg-muted/30 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span className="h-px flex-1 bg-hairline" /> or{" "}
                <span className="h-px flex-1 bg-hairline" />
              </div>
            </>
          )}

          {mode === "otp" ? (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit verification code to <br/><strong className="text-foreground">{email}</strong>
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono rounded-lg border border-border bg-surface px-4 py-2.5 text-lg outline-none focus:border-foreground/40"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-foreground/90 disabled:opacity-50"
              >
                {busy ? "Verifying…" : "Confirm Email"}
              </button>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <button type="button" className="text-foreground underline" onClick={() => setMode("signup")}>
                  Change email
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-foreground/40"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-foreground/90 disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button className="text-foreground underline" onClick={() => setMode("signup")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button className="text-foreground underline" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </>
            )}
          </div>
          </>
          )}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to Northlane's terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
