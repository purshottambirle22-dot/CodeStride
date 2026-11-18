import { useState, type FormEvent } from "react";
import { loginUser, registerUser } from "./api/auth";
import type { LoginResponse } from "./types";
import { Code2, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

interface AuthPageProps {
  onLogin: (tokens: LoginResponse) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser({ username: username.trim(), email: email.trim(), password });
        setIsRegister(false);
        setPassword("");
        setSuccessMsg("Account created successfully! You can now sign in.");
      } else {
        const tokens = await loginUser({ email: email.trim(), password });
        onLogin(tokens);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <section className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-8 shadow-xl dark:shadow-2xl shadow-black/5 dark:shadow-black/60 backdrop-blur-xl">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-600/30">
            <Code2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            CodeStride
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {isRegister
              ? "Create your account to start tracking DSA progress."
              : "Sign in to access your practice workspace and leaderboard."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError("");
              setSuccessMsg("");
            }}
            className={`rounded-lg py-2 text-xs font-bold transition ${
              !isRegister
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError("");
              setSuccessMsg("");
            }}
            className={`rounded-lg py-2 text-xs font-bold transition ${
              isRegister
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                  placeholder="e.g. algo_master"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              "Please wait..."
            ) : isRegister ? (
              <>
                Create Account <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          CodeStride · Practice consistently. Improve every day.
        </p>
      </section>
    </main>
  );
}
