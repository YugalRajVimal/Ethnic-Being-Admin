import React, { useState } from "react";
import { motion } from "framer-motion";
import { RiEyeLine, RiEyeOffLine, RiShieldCheckLine } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eb-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-eb-terra/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-eb-gold/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
      >
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-eb-terra/10 border border-eb-terra/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="font-display text-3xl font-bold text-eb-terra">E</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-eb-cream">EthnicBeing</h1>
          <p className="text-eb-muted text-sm mt-1 font-mono uppercase tracking-widest">Admin Console</p>
        </div>

        {/* Card */}
        <div className="bg-eb-card border border-eb-border rounded-2xl p-8 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <RiShieldCheckLine size={16} className="text-eb-terra" />
            <p className="text-xs font-mono text-eb-muted uppercase tracking-wider">Secure Sign In</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ethnicbeing.com"
                className="bg-eb-surface border border-eb-border rounded-lg px-4 py-3 text-sm text-eb-cream placeholder-eb-muted/40 focus:outline-none focus:border-eb-terra/60 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-eb-muted">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-eb-surface border border-eb-border rounded-lg px-4 py-3 pr-10 text-sm text-eb-cream placeholder-eb-muted/40 focus:outline-none focus:border-eb-terra/60 transition-colors w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-eb-muted hover:text-eb-cream transition-colors"
                >
                  {showPwd ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-eb-red/10 border border-eb-red/30 rounded-lg px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-eb-terra hover:bg-eb-terra/80 text-white font-medium py-3 rounded-lg text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-eb-muted/50 mt-6 font-mono">
          Admin access only · EthnicBeing © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
