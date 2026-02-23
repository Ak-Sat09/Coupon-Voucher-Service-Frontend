import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/userService";
import { setToken } from "../utils/auth";

/* ─────────────────────────────────────────
   Inline styles — drop styles.css import
   and paste these into your styles.css
───────────────────────────────────────── */

export default function Login() {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({ email: "", password: "" });
  const [message, setMessage]   = useState({ text: "", type: "" });
  const [isLoading, setIsLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef    = useRef(null);
  const passwordRef = useRef(null);
  const attempts    = useRef(0);
  const lastTime    = useRef(0);

  useEffect(() => { emailRef.current?.focus(); }, []);

  const validateEmail    = useCallback((v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), []);
  const validatePassword = useCallback((v) => v.length >= 8, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
    if (message.text) setMessage({ text: "", type: "" });
  }, [message.text]);

  const validateForm = useCallback(() => {
    const errs = { email: "", password: "" };
    let ok = true;
    if (!form.email)                     { errs.email    = "Email is required"; ok = false; }
    else if (!validateEmail(form.email)) { errs.email    = "Enter a valid email"; ok = false; }
    if (!form.password)                  { errs.password = "Password is required"; ok = false; }
    else if (!validatePassword(form.password)) { errs.password = "Minimum 8 characters"; ok = false; }
    setErrors(errs);
    return ok;
  }, [form, validateEmail, validatePassword]);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastTime.current > 60000) attempts.current = 0;
    if (attempts.current >= 5 && now - lastTime.current < 60000) {
      setMessage({ text: "Too many attempts. Please wait a minute.", type: "error" });
      return false;
    }
    return true;
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) {
      (errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    if (!checkRateLimit()) return;
    attempts.current += 1;
    lastTime.current  = Date.now();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await loginUser(form);
      if (res.success) {
        setToken(res.data);
        setMessage({ text: "Welcome back! Redirecting…", type: "success" });
        setForm({ email: "", password: "" });
        attempts.current = 0;
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setMessage({ text: res.message || "Invalid email or password.", type: "error" });
        passwordRef.current?.select();
      }
    } catch {
      setMessage({ text: "Connection error. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [form, isLoading, validateForm, checkRateLimit, errors]);

  return (
    <div className="cv-page">
      {/* ── Decorative background ── */}
      <div className="cv-bg-grid" aria-hidden="true" />
      <div className="cv-bg-blob1" aria-hidden="true" />
      <div className="cv-bg-blob2" aria-hidden="true" />

      <div className="cv-shell">

        {/* ── LEFT HERO ── */}
        <aside className="cv-hero" aria-hidden="true">
          <div className="cv-hero__top">
            <div className="cv-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <span className="cv-brand-name">CouponVault</span>
          </div>

          <div className="cv-hero__body">
            <p className="cv-hero__eyebrow">Members Platform</p>
            <h1 className="cv-hero__headline">
              Your Deals.<br/>
              Your <em>Savings.</em>
            </h1>
            <p className="cv-hero__sub">
              Access thousands of verified coupons from top sellers.
              Save more, spend smarter — every single day.
            </p>

            <div className="cv-ticker">
              <div className="cv-ticker__strip">
                <span>50K+ Coupons</span><span className="cv-ticker__dot">·</span>
                <span>12K Sellers</span><span className="cv-ticker__dot">·</span>
                <span>₹2Cr+ Saved</span><span className="cv-ticker__dot">·</span>
                <span>50K+ Coupons</span><span className="cv-ticker__dot">·</span>
                <span>12K Sellers</span><span className="cv-ticker__dot">·</span>
                <span>₹2Cr+ Saved</span><span className="cv-ticker__dot">·</span>
              </div>
            </div>

            <ul className="cv-feats">
              <li className="cv-feat">
                <span className="cv-feat__icon">🏷️</span>
                <span><strong>Verified Deals</strong> — every coupon seller-approved</span>
              </li>
              <li className="cv-feat">
                <span className="cv-feat__icon">⚡</span>
                <span><strong>Instant Redemption</strong> — request & redeem in seconds</span>
              </li>
              <li className="cv-feat">
                <span className="cv-feat__icon">🔒</span>
                <span><strong>Secure & Private</strong> — your savings, safely managed</span>
              </li>
            </ul>
          </div>

          <p className="cv-hero__copy">© 2025 CouponVault · All rights reserved</p>
        </aside>

        {/* ── RIGHT FORM ── */}
        <main className="cv-panel" role="main">
          <div className="cv-card">

            <div className="cv-card__head">
              <p className="cv-card__eyebrow">Sign In</p>
              <h2 className="cv-card__title">Welcome<br/>back</h2>
              <p className="cv-card__sub">Browse and redeem exclusive deals</p>
            </div>

            {message.text && (
              <div
                className={`cv-alert cv-alert--${message.type}`}
                role={message.type === "error" ? "alert" : "status"}
                aria-live={message.type === "error" ? "assertive" : "polite"}
              >
                <span className="cv-alert__icon">{message.type === "success" ? "✓" : "!"}</span>
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="cv-form">

              {/* Email */}
              <div className="cv-field">
                <label htmlFor="login-email" className="cv-label">Email Address</label>
                <div className="cv-input-wrap">
                  <svg className="cv-input-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    ref={emailRef} id="login-email" name="email" type="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    required aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "le-err" : undefined}
                    autoComplete="email" disabled={isLoading}
                    className={`cv-input${errors.email ? " cv-input--err" : ""}`}
                  />
                </div>
                {errors.email && <span id="le-err" className="cv-error" role="alert">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="cv-field">
                <label htmlFor="login-pass" className="cv-label">Password</label>
                <div className="cv-input-wrap">
                  <svg className="cv-input-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    ref={passwordRef} id="login-pass" name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password} onChange={handleChange}
                    required aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "lp-err" : undefined}
                    autoComplete="current-password" disabled={isLoading}
                    className={`cv-input${errors.password ? " cv-input--err" : ""}`}
                  />
                  <button type="button" className="cv-eye" onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {errors.password && <span id="lp-err" className="cv-error" role="alert">{errors.password}</span>}
              </div>

              <button type="submit" disabled={isLoading} aria-busy={isLoading}
                className={`cv-btn${isLoading ? " cv-btn--loading" : ""}`}>
                {isLoading
                  ? <><span className="cv-spinner" />Signing In…</>
                  : <>Sign In &amp; Browse Deals <span className="cv-btn__arrow">→</span></>
                }
              </button>
            </form>

            <p className="cv-foot">
              New to CouponVault?{" "}
              <Link to="/register" className="cv-link">Create free account</Link>
            </p>
          </div>
        </main>

      </div>
    </div>
  );
}
