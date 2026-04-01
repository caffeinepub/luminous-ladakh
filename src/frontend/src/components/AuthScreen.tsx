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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-amber-glow/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        <img
          src="https://picsum.photos/seed/pangong99/1200/800"
          alt="Ladakh landscape"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 slide-up">
          <img
            src="/assets/generated/ladakh-logo-transparent.dim_200x200.png"
            alt="Ladakh Connect"
            className="w-20 h-20 mb-3"
          />
          <h1 className="text-3xl font-heading font-bold amber-text">
            Ladakh Connect
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Discover the real Ladakh. Connect with its soul.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card slide-up stagger-1">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6 bg-secondary">
              <TabsTrigger
                value="login"
                className="flex-1"
                data-ocid="auth.tab"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex-1"
                data-ocid="auth.tab"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="login-username"
                    className="text-sm text-muted-foreground"
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
                    className="bg-input border-border"
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="login-password"
                    className="text-sm text-muted-foreground"
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
                    className="bg-input border-border"
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
                  className="w-full bg-primary text-primary-foreground font-semibold"
                  disabled={loginLoading}
                  data-ocid="auth.submit_button"
                >
                  {loginLoading ? "Signing in..." : "Login"}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="text-xs border-border"
                  onClick={() => toast.info("Google login coming soon!")}
                  data-ocid="auth.secondary_button"
                >
                  🇬 Google
                </Button>
                <Button
                  variant="outline"
                  className="text-xs border-border"
                  onClick={() => toast.info("Facebook login coming soon!")}
                  data-ocid="auth.secondary_button"
                >
                  Facebook
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="su-username"
                    className="text-sm text-muted-foreground"
                  >
                    Username
                  </Label>
                  <Input
                    id="su-username"
                    placeholder="Choose a username"
                    value={signupForm.username}
                    onChange={(e) =>
                      setSignupForm((p) => ({ ...p, username: e.target.value }))
                    }
                    className="bg-input border-border"
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="su-email"
                    className="text-sm text-muted-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="su-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupForm.email}
                    onChange={(e) =>
                      setSignupForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="bg-input border-border"
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="su-pass"
                    className="text-sm text-muted-foreground"
                  >
                    Password
                  </Label>
                  <Input
                    id="su-pass"
                    type="password"
                    placeholder="Min 6 characters"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm((p) => ({ ...p, password: e.target.value }))
                    }
                    className="bg-input border-border"
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="su-confirm"
                    className="text-sm text-muted-foreground"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="su-confirm"
                    type="password"
                    placeholder="Repeat password"
                    value={signupForm.confirmPassword}
                    onChange={(e) =>
                      setSignupForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="bg-input border-border"
                    data-ocid="auth.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
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
                      className="bg-input border-border"
                      data-ocid="auth.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
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

                <div className="bg-secondary rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">
                    📋 Rules & Guidelines
                  </p>
                  <p>• Only post real, undiscovered places (not businesses)</p>
                  <p>
                    • Member payments are{" "}
                    <span className="text-red-400 font-semibold">
                      non-refundable
                    </span>
                  </p>
                  <p>• Violations may lead to account suspension</p>
                  <p>• Creator has full moderation authority</p>
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
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    I accept the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTc(true)}
                      className="text-primary underline"
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
                  className="w-full bg-primary text-primary-foreground font-semibold"
                  disabled={signupLoading}
                  data-ocid="auth.submit_button"
                >
                  {signupLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>

      {/* T&C Modal */}
      {showTc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowTc(false)}
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowTc(false);
          }}
        >
          <div
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
            onKeyDown={(e) => e.stopPropagation()}
            data-ocid="auth.dialog"
          >
            <h2 className="font-heading text-lg font-bold mb-4">
              Terms & Conditions
            </h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong className="text-foreground">1. Platform Purpose</strong>
                <br />
                Ladakh Connect is a community platform for discovering and
                promoting authentic Ladakhi destinations and businesses.
              </p>
              <p>
                <strong className="text-foreground">2. User Conduct</strong>
                <br />
                Users must post only genuine undiscovered places. Misleading
                content or spam will result in violations.
              </p>
              <p>
                <strong className="text-foreground">3. Member Payments</strong>
                <br />
                All membership payments (₹1,000/mo Common, ₹1,500/mo Premier)
                are{" "}
                <span className="text-red-400 font-semibold">
                  strictly non-refundable
                </span>
                .
              </p>
              <p>
                <strong className="text-foreground">4. Violation System</strong>
                <br />
                Violations range from Level 1 (warning) to Level 7 (permanent
                ban). The Creator has final moderation authority.
              </p>
              <p>
                <strong className="text-foreground">5. Privacy</strong>
                <br />
                Your data is stored locally on your device. Electronic IDs are
                unique identifiers for re-login purposes.
              </p>
              <p>
                <strong className="text-foreground">
                  6. Community Standards
                </strong>
                <br />
                Respect local culture, avoid posting restricted military zones
                or sensitive areas.
              </p>
            </div>
            <Button
              className="w-full mt-4 bg-primary text-primary-foreground"
              onClick={() => {
                setShowTc(false);
                setTcAccepted(true);
              }}
              data-ocid="auth.confirm_button"
            >
              Accept & Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
