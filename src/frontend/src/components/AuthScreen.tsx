import { useState } from "react";
import type { Role } from "../types";

const inputCls =
  "w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-4 py-3 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors";
const labelCls = "block text-xs font-medium text-zinc-400 mb-1";

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
    communityCode?: string;
  }) => { success: boolean; error?: string; electronicId?: string };
  onSocialLogin?: (
    provider: "google" | "facebook",
    email: string,
    name: string,
    role: Exclude<Role, "creator">,
  ) => {
    success: boolean;
    error?: string;
    isNew?: boolean;
    electronicId?: string;
  };
}

type AuthMethod = "email" | "google" | "facebook";
type RoleChoice = "user" | "member" | "community" | "creator";

const ROLES: {
  value: RoleChoice;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    value: "user",
    label: "User",
    icon: "🧭",
    desc: "Explore & discover Ladakh",
  },
  {
    value: "member",
    label: "Member",
    icon: "🏪",
    desc: "Promote your business",
  },
  {
    value: "community",
    label: "Community",
    icon: "🤝",
    desc: "Community access (code required)",
  },
  {
    value: "creator",
    label: "Creator",
    icon: "👑",
    desc: "Admin & platform management",
  },
];

export function AuthScreen({ onLogin, onSignup, onSocialLogin }: Props) {
  const [selectedRole, setSelectedRole] = useState<RoleChoice | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [method, setMethod] = useState<AuthMethod>("email");

  // Email login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Email signup
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [communityCode, setCommunityCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Social
  const [socialEmail, setSocialEmail] = useState("");
  const [socialName, setSocialName] = useState("");
  const [socialCommunityCode, setSocialCommunityCode] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setError("");
    setSuccessMsg("");
    setLoginUsername("");
    setLoginPassword("");
  }

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = onLogin(loginUsername, loginPassword);
    if (!result.success) setError(result.error || "Login failed");
  }

  function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions");
      return;
    }
    const role = selectedRole as Exclude<Role, "creator">;
    const result = onSignup({
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
      role,
      communityCode: role === "community" ? communityCode : undefined,
    });
    if (!result.success) {
      setError(result.error || "Signup failed");
    } else if (result.electronicId) {
      setSuccessMsg(
        `Welcome! Your Electronic ID is: ${result.electronicId} — save this for re-login.`,
      );
    }
  }

  function handleSocialSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!onSocialLogin) return;
    setLoading(true);
    const role = (selectedRole as Exclude<Role, "creator">) || "user";
    const result = onSocialLogin(
      method as "google" | "facebook",
      socialEmail,
      socialName,
      role,
    );
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed");
    } else if (result.isNew && result.electronicId) {
      setSuccessMsg(
        `Account created! Your Electronic ID: ${result.electronicId}`,
      );
    }
  }

  const providerName = method === "google" ? "Google" : "Facebook";

  // Step 1: Role selection
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <div className="mb-8 text-center">
          <img
            src="/assets/ladakh-connect-logo.png"
            alt="Ladakh Connect"
            className="w-20 h-20 mx-auto mb-3 rounded-2xl shadow-lg"
          />
          <h1
            className="text-3xl text-amber-400"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: 700,
            }}
          >
            Ladakh Connect
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Building Ladakh in one app
          </p>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-center text-zinc-300 font-semibold mb-4 text-sm">
            Who are you?
          </p>
          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  setSelectedRole(r.value);
                  resetForm();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/50 hover:bg-zinc-800 transition-all text-left"
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{r.label}</p>
                  <p className="text-zinc-500 text-xs">{r.desc}</p>
                </div>
                <span className="ml-auto text-zinc-600 text-lg">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isCreatorRole = selectedRole === "creator";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img
          src="/assets/ladakh-connect-logo.png"
          alt="Ladakh Connect"
          className="w-16 h-16 mx-auto mb-3 rounded-2xl shadow-lg"
        />
        <h1
          className="text-3xl text-amber-400"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
          }}
        >
          Ladakh Connect
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Building Ladakh in one app</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Back + Role badge */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <span className="ml-auto px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold capitalize">
            {ROLES.find((r) => r.value === selectedRole)?.icon} {selectedRole}
          </span>
        </div>

        {/* Creator: login only */}
        {isCreatorRole ? (
          <div>
            <p className="text-zinc-400 text-xs mb-4 text-center">
              Creator access is restricted. Enter your credentials.
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="auth-username" className={labelCls}>
                  Username
                </label>
                <input
                  className={inputCls}
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label htmlFor="auth-password" className={labelCls}>
                  Password
                </label>
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                Sign In as Creator
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Login / Signup toggle */}
            <div className="flex rounded-xl overflow-hidden border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  isLogin
                    ? "bg-amber-500 text-black"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  !isLogin
                    ? "bg-amber-500 text-black"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Method tabs */}
            <div className="flex gap-2 mb-5">
              {(["email", "google", "facebook"] as AuthMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMethod(m);
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    method === m
                      ? "border-amber-500 text-amber-400 bg-amber-500/10"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m === "email"
                    ? "📧 Email"
                    : m === "google"
                      ? "🔵 Google"
                      : "🔷 Facebook"}
                </button>
              ))}
            </div>

            {/* Error / Success */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-sm">
                {successMsg}
              </div>
            )}

            {/* EMAIL LOGIN */}
            {isLogin && method === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label htmlFor="auth-username" className={labelCls}>
                    Username
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Enter your username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className={labelCls}>
                    Password
                  </label>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                >
                  Sign In
                </button>
              </form>
            )}

            {/* EMAIL SIGNUP */}
            {!isLogin && method === "email" && (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label htmlFor="auth-username" className={labelCls}>
                    Username
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Choose a username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="auth-email" className={labelCls}>
                    Email
                  </label>
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className={labelCls}>
                    Password
                  </label>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="auth-confirm" className={labelCls}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Confirm your password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {selectedRole === "community" && (
                  <div>
                    <label htmlFor="auth-code" className={labelCls}>
                      Community Access Code
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Enter the access code from your Creator"
                      value={communityCode}
                      onChange={(e) => setCommunityCode(e.target.value)}
                      required
                    />
                  </div>
                )}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 accent-amber-500"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span className="text-xs text-zinc-400">
                    I agree to the{" "}
                    <span className="text-amber-400 underline cursor-pointer">
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="text-amber-400 underline cursor-pointer">
                      Privacy Policy
                    </span>
                    . Military/army content is strictly prohibited.
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                >
                  Create Account
                </button>
              </form>
            )}

            {/* GOOGLE / FACEBOOK */}
            {method !== "email" && (
              <form onSubmit={handleSocialSubmit} className="space-y-4">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border border-zinc-700 ${
                    method === "google"
                      ? "bg-white text-zinc-900"
                      : "bg-[#1877F2] text-white"
                  }`}
                >
                  <span className="text-2xl">
                    {method === "google" ? "🔵" : "🔷"}
                  </span>
                  <div>
                    <p className="font-bold text-sm">
                      Continue with {providerName}
                    </p>
                    <p className="text-xs opacity-70">
                      Enter your {providerName} account details
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="auth-social-email" className={labelCls}>
                    {providerName} Email
                  </label>
                  <input
                    type="email"
                    className={inputCls}
                    placeholder={`your@${method === "google" ? "gmail.com" : "facebook.com"}`}
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="auth-name" className={labelCls}>
                    Your Full Name
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Name as on your account"
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    required
                  />
                </div>
                {!isLogin && selectedRole === "community" && (
                  <div>
                    <label htmlFor="auth-code" className={labelCls}>
                      Community Access Code
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Enter access code"
                      value={socialCommunityCode}
                      onChange={(e) => setSocialCommunityCode(e.target.value)}
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    method === "google"
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "bg-[#1877F2] text-white hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Connecting..." : `Continue with ${providerName}`}
                </button>
              </form>
            )}
          </>
        )}

        {/* Warnings */}
        <div className="mt-6 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            ⚠️ Military/army content is strictly prohibited and will result in
            automatic account warnings.
          </p>
        </div>
      </div>
    </div>
  );
}
