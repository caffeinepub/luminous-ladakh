import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "../types";

interface Props {
  onLogin: (
    username: string,
    password: string,
  ) => { success: boolean; error?: string };
  onSignup: (data: {
    username: string;
    email: string;
    password: string;
    role: Exclude<Role, "creator">;
  }) => { success: boolean; error?: string; electronicId?: string };
}

export function AuthScreen({ onLogin, onSignup }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as Exclude<Role, "creator">,
  });
  const [tcAccepted, setTcAccepted] = useState(false);
  const [showTc, setShowTc] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginForm.username || !loginForm.password) {
      setLoginError("Please fill in all fields");
      return;
    }
    setLoginLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = onLogin(loginForm.username, loginForm.password);
    setLoginLoading(false);
    if (!result.success) setLoginError(result.error || "Login failed");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    if (
      !signupForm.username ||
      !signupForm.email ||
      !signupForm.password ||
      !signupForm.confirmPassword
    ) {
      setSignupError("Please fill in all fields");
      return;
    }
    if (signupForm.username.length < 3) {
      setSignupError("Username must be at least 3 characters");
      return;
    }
    if (signupForm.password.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }
    if (!tcAccepted) {
      setSignupError("You must accept the Terms & Conditions");
      return;
    }
    setSignupLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = onSignup({
      username: signupForm.username,
      email: signupForm.email,
      password: signupForm.password,
      role: signupForm.role,
    });
    setSignupLoading(false);
    if (!result.success) {
      setSignupError(result.error || "Signup failed");
    } else {
      toast.success(
        `Welcome to Ladakh Connect! Your Electronic ID: ${result.electronicId}`,
        { duration: 6000 },
      );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#050505" }}
    >
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://picsum.photos/seed/pangong99/1200/800"
          alt="Ladakh landscape"
          className="w-full h-full object-cover"
          style={{ opacity: 0.08 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(180,140,60,0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo + App name */}
        <div className="flex flex-col items-center mb-8 slide-up">
          <img
            src="/assets/generated/ladakh-logo-transparent.dim_200x200.png"
            alt="Ladakh Connect"
            className="w-16 h-16 mb-3"
          />
          <h1
            className="text-4xl amber-text"
            style={{
              fontFamily: "PlayfairDisplay, serif",
              fontStyle: "italic",
              fontWeight: 700,
            }}
          >
            Ladakh Connect
          </h1>
          <p
            className="text-sm mt-1 text-center"
            style={{ color: "rgba(200,180,140,0.6)" }}
          >
            Discover the real Ladakh
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-2xl p-6 slide-up stagger-1"
          style={{
            background: "rgba(18,15,12,0.95)",
            border: "1px solid rgba(180,140,60,0.18)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          }}
        >
          {/* Heading */}
          <h2
            className="font-heading font-bold text-xl mb-1"
            style={{ color: "#f5ecd0" }}
          >
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p
            className="text-xs mb-5"
            style={{ color: "rgba(200,180,140,0.55)" }}
          >
            {mode === "login"
              ? "Sign in to continue to Ladakh Connect"
              : "Join the Ladakh community today"}
          </p>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label
                  htmlFor="login-username"
                  className="text-xs font-medium"
                  style={{ color: "rgba(220,200,160,0.7)" }}
                >
                  Username
                </Label>
                <Input
                  id="login-username"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, username: e.target.value }))
                  }
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#f0e8d0",
                    borderRadius: "10px",
                  }}
                  data-ocid="auth.input"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="login-password"
                  className="text-xs font-medium"
                  style={{ color: "rgba(220,200,160,0.7)" }}
                >
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, password: e.target.value }))
                  }
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#f0e8d0",
                    borderRadius: "10px",
                  }}
                  data-ocid="auth.input"
                />
              </div>
              {loginError && (
                <p
                  className="text-sm text-red-400"
                  data-ocid="auth.error_state"
                >
                  {loginError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full font-semibold"
                style={{
                  background: "linear-gradient(135deg, #c9a227, #e8c55a)",
                  color: "#1a1000",
                  borderRadius: "10px",
                  height: "44px",
                }}
                disabled={loginLoading}
                data-ocid="auth.submit_button"
              >
                {loginLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span
                    style={{
                      background: "rgba(18,15,12,0.95)",
                      padding: "0 8px",
                      color: "rgba(200,180,140,0.45)",
                    }}
                  >
                    or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Google", icon: "G" },
                  { label: "Facebook", icon: "f" },
                  { label: "Email", icon: "@" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => toast.info(`${s.label} login coming soon!`)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(220,200,160,0.75)",
                    }}
                    data-ocid="auth.secondary_button"
                  >
                    <span
                      className="text-base font-bold"
                      style={{ color: "#c9a227" }}
                    >
                      {s.icon}
                    </span>
                    {s.label}
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              {[
                {
                  id: "su-username",
                  label: "Username",
                  placeholder: "Choose a username",
                  field: "username",
                  type: "text",
                },
                {
                  id: "su-email",
                  label: "Email",
                  placeholder: "your@email.com",
                  field: "email",
                  type: "email",
                },
                {
                  id: "su-pass",
                  label: "Password",
                  placeholder: "Min 6 characters",
                  field: "password",
                  type: "password",
                },
                {
                  id: "su-confirm",
                  label: "Confirm Password",
                  placeholder: "Repeat password",
                  field: "confirmPassword",
                  type: "password",
                },
              ].map((f) => (
                <div key={f.id} className="space-y-1">
                  <Label
                    htmlFor={f.id}
                    className="text-xs font-medium"
                    style={{ color: "rgba(220,200,160,0.7)" }}
                  >
                    {f.label}
                  </Label>
                  <Input
                    id={f.id}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={
                      signupForm[f.field as keyof typeof signupForm] as string
                    }
                    onChange={(e) =>
                      setSignupForm((p) => ({
                        ...p,
                        [f.field]: e.target.value,
                      }))
                    }
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#f0e8d0",
                      borderRadius: "10px",
                    }}
                    data-ocid="auth.input"
                  />
                </div>
              ))}

              <div className="space-y-1">
                <Label
                  className="text-xs font-medium"
                  style={{ color: "rgba(220,200,160,0.7)" }}
                >
                  Account Type
                </Label>
                <Select
                  value={signupForm.role}
                  onValueChange={(v) =>
                    setSignupForm((p) => ({
                      ...p,
                      role: v as Exclude<Role, "creator">,
                    }))
                  }
                >
                  <SelectTrigger
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#f0e8d0",
                      borderRadius: "10px",
                    }}
                    data-ocid="auth.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: "#141210",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <SelectItem value="user">
                      User — Explore & Discover
                    </SelectItem>
                    <SelectItem value="member">
                      Member — Business Listing (₹1,000/mo)
                    </SelectItem>
                    <SelectItem value="community">
                      Community — Partner with Creator
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className="rounded-xl p-3 text-xs space-y-1"
                style={{
                  background: "rgba(255,200,0,0.05)",
                  border: "1px solid rgba(255,200,0,0.15)",
                  color: "rgba(220,200,160,0.65)",
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: "rgba(220,200,160,0.9)" }}
                >
                  📋 Rules & Guidelines
                </p>
                <p>• Only post real, undiscovered places (not businesses)</p>
                <p>
                  • Member payments are{" "}
                  <span className="text-red-400 font-semibold">
                    non-refundable
                  </span>
                </p>
                <p>• Violations lead to fines and suspension (L1–L7)</p>
                <p>
                  • No army/military content — auto-blocked, Level 2 warning
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="tc"
                  checked={tcAccepted}
                  onCheckedChange={(v) => setTcAccepted(!!v)}
                  data-ocid="auth.checkbox"
                />
                <label
                  htmlFor="tc"
                  className="text-xs cursor-pointer"
                  style={{ color: "rgba(200,180,140,0.6)" }}
                >
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTc(true)}
                    className="underline"
                    style={{ color: "#c9a227" }}
                  >
                    Terms & Conditions
                  </button>{" "}
                  and Privacy Policy
                </label>
              </div>

              {signupError && (
                <p
                  className="text-sm text-red-400"
                  data-ocid="auth.error_state"
                >
                  {signupError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full font-semibold"
                style={{
                  background: "linear-gradient(135deg, #c9a227, #e8c55a)",
                  color: "#1a1000",
                  borderRadius: "10px",
                  height: "44px",
                }}
                disabled={signupLoading}
                data-ocid="auth.submit_button"
              >
                {signupLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* Toggle mode */}
          <p
            className="text-center text-xs mt-5"
            style={{ color: "rgba(200,180,140,0.5)" }}
          >
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setLoginError("");
                  }}
                  className="font-semibold underline"
                  style={{ color: "#c9a227" }}
                  data-ocid="auth.toggle_mode"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setSignupError("");
                  }}
                  className="font-semibold underline"
                  style={{ color: "#c9a227" }}
                  data-ocid="auth.toggle_mode"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>

        <p
          className="text-center text-xs mt-5"
          style={{ color: "rgba(180,160,120,0.35)" }}
        >
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            Built with caffeine.ai
          </a>
        </p>
      </div>

      {/* T&C Modal */}
      {showTc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowTc(false)}
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowTc(false);
          }}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: "#141210",
              border: "1px solid rgba(180,140,60,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
            onKeyDown={(e) => e.stopPropagation()}
            data-ocid="auth.dialog"
          >
            <h2
              className="font-heading text-lg font-bold mb-4"
              style={{ color: "#f5ecd0" }}
            >
              Terms & Conditions
            </h2>
            <div
              className="text-sm space-y-3"
              style={{ color: "rgba(200,180,140,0.7)" }}
            >
              <p>
                <strong style={{ color: "#f5ecd0" }}>
                  1. Platform Purpose
                </strong>
                <br />
                Ladakh Connect is a community platform for discovering and
                promoting authentic Ladakhi destinations and businesses.
              </p>
              <p>
                <strong style={{ color: "#f5ecd0" }}>2. User Conduct</strong>
                <br />
                Users must post only genuine undiscovered places. Misleading
                content or spam will result in violations.
              </p>
              <p>
                <strong style={{ color: "#f5ecd0" }}>
                  3. Military & Restricted Content
                </strong>
                <br />
                Posting content showing army camps, military vehicles, uniforms,
                or restricted zones is{" "}
                <span className="text-red-400 font-semibold">
                  strictly prohibited
                </span>{" "}
                and results in automatic Level 2 warning.
              </p>
              <p>
                <strong style={{ color: "#f5ecd0" }}>4. Member Payments</strong>
                <br />
                All membership payments (₹1,000/mo Common, ₹1,500/mo Premier)
                are{" "}
                <span className="text-red-400 font-semibold">
                  strictly non-refundable
                </span>
                .
              </p>
              <p>
                <strong style={{ color: "#f5ecd0" }}>
                  5. Violation System
                </strong>
                <br />
                Level 1: Warning • Level 2: Final Warning • Level 3: ₹500 Fine •
                Level 4: ₹1,000 Fine • Level 5: ₹1,500 Fine • Level 6:
                Suspension • Level 7: Permanent Ban. Content and history deleted
                on ban; ID remains on cloud record.
              </p>
              <p>
                <strong style={{ color: "#f5ecd0" }}>6. Privacy & Data</strong>
                <br />
                Your data is stored securely in the cloud. Electronic IDs are
                unique identifiers for re-login purposes.
              </p>
            </div>
            <button
              type="button"
              className="w-full mt-5 py-3 rounded-xl font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #c9a227, #e8c55a)",
                color: "#1a1000",
              }}
              onClick={() => {
                setShowTc(false);
                setTcAccepted(true);
              }}
              data-ocid="auth.confirm_button"
            >
              Accept & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
