import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
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
    securityWord?: string;
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
  onRecoverPassword: (
    username: string,
    securityWord: string,
    newPassword: string,
  ) => { success: boolean; error?: string };
}

type AuthMethod = "email" | "google" | "facebook";
type RoleChoice = "user" | "member" | "community" | "creator";
type RecoveryStep = "username" | "secword" | "newpassword";

export function AuthScreen({
  onLogin,
  onSignup,
  onSocialLogin,
  onRecoverPassword,
}: Props) {
  const { t } = useLanguage();

  const ROLES: {
    value: RoleChoice;
    label: string;
    icon: string;
    desc: string;
  }[] = [
    {
      value: "user",
      label: t("user", "User"),
      icon: "🧭",
      desc: t("userDesc", "Explore & discover Ladakh"),
    },
    {
      value: "member",
      label: t("member", "Member"),
      icon: "🏪",
      desc: t("memberDesc", "Promote your business"),
    },
    {
      value: "community",
      label: t("communityMember", "Community"),
      icon: "🤝",
      desc: t("communityDesc", "Community access (code required)"),
    },
    {
      value: "creator",
      label: t("creator", "Creator"),
      icon: "👑",
      desc: t("creatorDesc", "Admin & platform management"),
    },
  ];

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
  const [signupSecurityWord, setSignupSecurityWord] = useState("");
  const [communityCode, setCommunityCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Social
  const [socialEmail, setSocialEmail] = useState("");
  const [socialName, setSocialName] = useState("");
  const [socialCommunityCode, setSocialCommunityCode] = useState("");

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>("username");
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoverySecWord, setRecoverySecWord] = useState("");
  const [recoveryNewPw, setRecoveryNewPw] = useState("");
  const [recoveryConfirmPw, setRecoveryConfirmPw] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setError("");
    setSuccessMsg("");
    setLoginUsername("");
    setLoginPassword("");
  }

  function resetRecovery() {
    setShowForgotPassword(false);
    setRecoveryStep("username");
    setRecoveryUsername("");
    setRecoverySecWord("");
    setRecoveryNewPw("");
    setRecoveryConfirmPw("");
    setError("");
  }

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = onLogin(loginUsername, loginPassword);
    if (!result.success)
      setError(result.error || t("loginFailed", "Login failed"));
  }

  function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signupPassword !== signupConfirm) {
      setError(t("passwordsNoMatch", "Passwords do not match"));
      return;
    }
    if (!termsAccepted) {
      setError(t("acceptTerms", "Please accept the Terms & Conditions"));
      return;
    }
    const role = selectedRole as Exclude<Role, "creator">;
    const result = onSignup({
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
      role,
      communityCode: role === "community" ? communityCode : undefined,
      securityWord: signupSecurityWord || undefined,
    });
    if (!result.success) {
      setError(result.error || t("signupFailed", "Signup failed"));
    } else if (result.electronicId) {
      setSuccessMsg(
        `${t("welcomeElectronicId", "Welcome! Your Electronic ID is:")}: ${result.electronicId} — ${t("saveForRelogin", "save this for re-login.")}`,
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
      setError(result.error || t("loginFailed", "Login failed"));
    } else if (result.isNew && result.electronicId) {
      setSuccessMsg(
        `${t("accountCreated", "Account created! Your Electronic ID:")}: ${result.electronicId}`,
      );
    }
  }

  function handleRecoveryNext() {
    setError("");
    if (recoveryStep === "username") {
      if (!recoveryUsername.trim()) {
        setError(t("enterUsername", "Please enter your username"));
        return;
      }
      setRecoveryStep("secword");
    } else if (recoveryStep === "secword") {
      if (!recoverySecWord.trim()) {
        setError(t("enterSecurityWord", "Please enter your security word"));
        return;
      }
      setRecoveryStep("newpassword");
    } else if (recoveryStep === "newpassword") {
      if (recoveryNewPw !== recoveryConfirmPw) {
        setError(t("passwordsNoMatch", "Passwords do not match"));
        return;
      }
      if (recoveryNewPw.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const result = onRecoverPassword(
        recoveryUsername,
        recoverySecWord,
        recoveryNewPw,
      );
      if (!result.success) {
        setError(result.error || t("recoveryFailed", "Recovery failed"));
        setRecoveryStep("secword");
        setRecoverySecWord("");
      } else {
        setShowForgotPassword(false);
        setRecoveryStep("username");
        setSuccessMsg(
          t(
            "passwordResetSuccess",
            "Password reset successfully! You can now log in with your new password.",
          ),
        );
      }
    }
  }

  const providerName = method === "google" ? "Google" : "Facebook";

  // Forgot password flow
  if (showForgotPassword) {
    const isCreatorRole = selectedRole === "creator";
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={resetRecovery}
            className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors"
          >
            {t("backToLogin", "← Back to Login")}
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto bg-amber-500/15 rounded-full flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-amber-400 text-2xl">
                lock_reset
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {t("recoverPassword", "Recover Password")}
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              {recoveryStep === "username" &&
                t("enterUsername", "Enter your username")}
              {recoveryStep === "secword" &&
                t("enterSecurityWord", "Enter your security word")}
              {recoveryStep === "newpassword" &&
                t("setNewPassword", "Set a new password")}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {(["username", "secword", "newpassword"] as RecoveryStep[]).map(
              (step, i) => (
                <div
                  key={step}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    ["username", "secword", "newpassword"].indexOf(
                      recoveryStep,
                    ) >= i
                      ? "bg-amber-500"
                      : "bg-zinc-700"
                  }`}
                />
              ),
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {recoveryStep === "username" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="rec-username" className={labelCls}>
                  {t("username", "Username")}
                </label>
                <input
                  id="rec-username"
                  className={inputCls}
                  placeholder={t("enterYourUsername", "Enter your username")}
                  value={recoveryUsername}
                  onChange={(e) => setRecoveryUsername(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleRecoveryNext}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                {t("next", "Next")} →
              </button>
            </div>
          )}

          {recoveryStep === "secword" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="rec-secword" className={labelCls}>
                  {t("securityWord", "Security Word")}
                </label>
                <input
                  id="rec-secword"
                  className={inputCls}
                  placeholder={
                    isCreatorRole
                      ? t(
                          "creatorSecurityHint",
                          "e.g. King of Hearts, Ace of Spades",
                        )
                      : t(
                          "securityWordPlaceholder",
                          "Your personal security word",
                        )
                  }
                  value={recoverySecWord}
                  onChange={(e) => setRecoverySecWord(e.target.value)}
                />
                {isCreatorRole && (
                  <p className="text-xs text-amber-400/70 mt-1">
                    {t(
                      "creatorSecurityHint",
                      `Enter a card from a 52-card deck, or "52 decks of cards"`,
                    )}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleRecoveryNext}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                {t("next", "Next")} →
              </button>
            </div>
          )}

          {recoveryStep === "newpassword" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="rec-newpw" className={labelCls}>
                  {t("newPassword", "New Password")}
                </label>
                <input
                  id="rec-newpw"
                  type="password"
                  className={inputCls}
                  placeholder={t("createNewPassword", "Create a new password")}
                  value={recoveryNewPw}
                  onChange={(e) => setRecoveryNewPw(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="rec-confirmpw" className={labelCls}>
                  {t("confirmNewPassword", "Confirm New Password")}
                </label>
                <input
                  id="rec-confirmpw"
                  type="password"
                  className={inputCls}
                  placeholder={t(
                    "confirmYourNewPassword",
                    "Confirm your new password",
                  )}
                  value={recoveryConfirmPw}
                  onChange={(e) => setRecoveryConfirmPw(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleRecoveryNext}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                {t("resetPassword", "Reset Password")}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
            {t("buildingLadakh", "Building Ladakh in one app")}
          </p>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-center text-zinc-300 font-semibold mb-4 text-sm">
            {t("whoAreYou", "Who are you?")}
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
        <p className="text-zinc-500 text-sm mt-1">
          {t("buildingLadakh", "Building Ladakh in one app")}
        </p>
      </div>

      <div className="w-full max-w-sm">
        {/* Back + Role badge */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="text-zinc-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← {t("back", "Back")}
          </button>
          <span className="ml-auto px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold capitalize">
            {ROLES.find((r) => r.value === selectedRole)?.icon}{" "}
            {ROLES.find((r) => r.value === selectedRole)?.label}
          </span>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-sm">
            {successMsg}
          </div>
        )}

        {/* Creator: login only */}
        {isCreatorRole ? (
          <div>
            <p className="text-zinc-400 text-xs mb-4 text-center">
              {t(
                "creatorRestricted",
                "Creator access is restricted. Enter your credentials.",
              )}
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="creator-username" className={labelCls}>
                  {t("username", "Username")}
                </label>
                <input
                  id="creator-username"
                  className={inputCls}
                  placeholder={t("enterYourUsername", "Enter your username")}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label htmlFor="creator-password" className={labelCls}>
                  {t("password", "Password")}
                </label>
                <input
                  id="creator-password"
                  type="password"
                  className={inputCls}
                  placeholder={t("enterYourPassword", "Enter your password")}
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
                {t("signInAsCreator", "Sign In as Creator")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setError("");
                }}
                className="w-full text-center text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                {t("creatorRecovery", "Forgot Password? (Creator recovery)")}
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
                {t("signIn", "Sign In")}
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
                {t("signup", "Sign Up")}
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
                    ? `📧 ${t("email", "Email")}`
                    : m === "google"
                      ? "🔵 Google"
                      : "🔷 Facebook"}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* EMAIL LOGIN */}
            {isLogin && method === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-username" className={labelCls}>
                    {t("username", "Username")}
                  </label>
                  <input
                    id="login-username"
                    className={inputCls}
                    placeholder={t("enterYourUsername", "Enter your username")}
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className={labelCls}>
                    {t("password", "Password")}
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className={inputCls}
                    placeholder={t("enterYourPassword", "Enter your password")}
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
                  {t("signIn", "Sign In")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="w-full text-center text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  {t("forgotPassword", "Forgot Password?")}
                </button>
              </form>
            )}

            {/* EMAIL SIGNUP */}
            {!isLogin && method === "email" && (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label htmlFor="signup-username" className={labelCls}>
                    {t("username", "Username")}
                  </label>
                  <input
                    id="signup-username"
                    className={inputCls}
                    placeholder={t("chooseUsername", "Choose a username")}
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className={labelCls}>
                    {t("email", "Email")}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    className={inputCls}
                    placeholder={t("yourEmail", "your@email.com")}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className={labelCls}>
                    {t("password", "Password")}
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    className={inputCls}
                    placeholder={t("createPassword", "Create a password")}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-confirm" className={labelCls}>
                    {t("confirmPassword", "Confirm Password")}
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    className={inputCls}
                    placeholder={t(
                      "confirmYourPassword",
                      "Confirm your password",
                    )}
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-secword" className={labelCls}>
                    {t("securityWord", "Security Word")}
                    <span className="text-zinc-600 ml-1">
                      {t("securityWordHint", "(for password recovery)")}
                    </span>
                  </label>
                  <input
                    id="signup-secword"
                    className={inputCls}
                    placeholder={t(
                      "securityWordPlaceholder",
                      "A word or phrase only you know",
                    )}
                    value={signupSecurityWord}
                    onChange={(e) => setSignupSecurityWord(e.target.value)}
                  />
                  <p className="text-xs text-zinc-600 mt-1">
                    {t(
                      "securityWordSaveHint",
                      "Save this — you'll need it if you forget your password.",
                    )}
                  </p>
                </div>
                {selectedRole === "community" && (
                  <div>
                    <label htmlFor="signup-code" className={labelCls}>
                      {t("communityAccessCode", "Community Access Code")}
                    </label>
                    <input
                      id="signup-code"
                      className={inputCls}
                      placeholder={t(
                        "communityCodePlaceholder",
                        "Enter the access code from your Creator",
                      )}
                      value={communityCode}
                      onChange={(e) => setCommunityCode(e.target.value)}
                      required
                    />
                  </div>
                )}
                {/* Platform Rules */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      policy
                    </span>
                    📋 Platform Rules
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="text-amber-400 font-bold text-xs shrink-0 mt-0.5">
                        1.
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          Respect &amp; Authenticity
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                          All content must be genuine and respectful. Fake
                          reviews, misleading business info, or impersonating
                          users is strictly prohibited and may result in
                          suspension or permanent ban (Violation Level 5+).
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-400 font-bold text-xs shrink-0 mt-0.5">
                        2.
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          Privacy &amp; Safety
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                          Do not share other users&apos; personal contact
                          details or private information publicly. Content that
                          endangers safety, spreads misinformation, or violates
                          privacy will be removed and penalized.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 accent-amber-500"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span className="text-xs text-zinc-400">
                    {t(
                      "termsAgreement",
                      "I agree to the Terms & Conditions and Privacy Policy. Military/army content is strictly prohibited.",
                    )}
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                >
                  {t("createAccount", "Create Account")}
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
                      {t("continueWithGoogle", "Continue with")} {providerName}
                    </p>
                    <p className="text-xs opacity-70">
                      {t("enterDetails", "Enter your account details")}
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="social-email" className={labelCls}>
                    {providerName} {t("email", "Email")}
                  </label>
                  <input
                    id="social-email"
                    type="email"
                    className={inputCls}
                    placeholder={`your@${
                      method === "google" ? "gmail.com" : "facebook.com"
                    }`}
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="social-name" className={labelCls}>
                    {t("yourFullName", "Your Full Name")}
                  </label>
                  <input
                    id="social-name"
                    className={inputCls}
                    placeholder={t("nameOnAccount", "Name as on your account")}
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    required
                  />
                </div>
                {!isLogin && selectedRole === "community" && (
                  <div>
                    <label htmlFor="social-code" className={labelCls}>
                      {t("communityAccessCode", "Community Access Code")}
                    </label>
                    <input
                      id="social-code"
                      className={inputCls}
                      placeholder={t("enterAccessCode", "Enter access code")}
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
                  {loading
                    ? t("connecting", "Connecting...")
                    : `${t("continueWithGoogle", "Continue with")} ${providerName}`}
                </button>
              </form>
            )}
          </>
        )}

        {/* Warnings */}
        <div className="mt-6 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            {t(
              "militaryWarning",
              "⚠️ Military/army content is strictly prohibited and will result in automatic account warnings.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
