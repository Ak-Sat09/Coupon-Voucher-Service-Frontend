import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/userService";
import "../styles.css";

export default function Register() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [errors, setErrors]   = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const nameRef     = useRef(null);
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const calcStrength = useCallback((pw) => {
    let s = 0;
    if (pw.length >= 8)  s += 25;
    if (pw.length >= 12) s += 25;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 25;
    if (/[0-9]/.test(pw))        s += 15;
    if (/[^a-zA-Z0-9]/.test(pw)) s += 10;
    return Math.min(100, s);
  }, []);

  const validateEmail = useCallback((v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === "password") setPasswordStrength(calcStrength(value));
    setErrors(p => ({ ...p, [name]: "" }));
    if (message.text) setMessage({ text: "", type: "" });
  }, [message.text, calcStrength]);

  const validateForm = useCallback(() => {
    const errs = { name: "", email: "", password: "" };
    let ok = true;
    if (!form.name)                       { errs.name = "Name is required"; ok = false; }
    else if (form.name.trim().length < 2) { errs.name = "Minimum 2 characters"; ok = false; }
    if (!form.email)                      { errs.email = "Email is required"; ok = false; }
    else if (!validateEmail(form.email))  { errs.email = "Enter a valid email"; ok = false; }
    if (!form.password)                   { errs.password = "Password is required"; ok = false; }
    else if (form.password.length < 8)    { errs.password = "Minimum 8 characters"; ok = false; }
    setErrors(errs);
    return ok;
  }, [form, validateEmail]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) {
      if (errors.name)         nameRef.current?.focus();
      else if (errors.email)   emailRef.current?.focus();
      else if (errors.password) passwordRef.current?.focus();
      return;
    }
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await registerUser(form);
      if (res.success || res.message?.includes("success")) {
        setMessage({ text: "Account created! Redirecting to login…", type: "success" });
        setForm({ name: "", email: "", password: "" });
        setPasswordStrength(0);
        setTimeout(() => { window.location.href = "/login"; }, 2000);
      } else {
        setMessage({ text: res.message || "Registration failed. Please try again.", type: "error" });
      }
    } catch {
      setMessage({ text: "Connection error. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [form, isLoading, validateForm, errors]);

  const getStrengthMeta = () => {
    if (passwordStrength === 0)  return { color: "transparent", label: "" };
    if (passwordStrength < 40)   return { color: "#e05252", label: "Weak" };
    if (passwordStrength < 70)   return { color: "#e8a234", label: "Fair" };
    if (passwordStrength < 90)   return { color: "#4caf7d", label: "Good" };
    return                              { color: "#2e8b57", label: "Strong" };
  };
  const sm = getStrengthMeta();

  return (
    <div className="cv-page">
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
            <p className="cv-hero__eyebrow">Join Free Today</p>
            <h1 className="cv-hero__headline">
              Start<br/>
              Saving <em>Now.</em>
            </h1>
            <p className="cv-hero__sub">
              Create your free account and unlock access to thousands
              of exclusive coupons from verified sellers.
            </p>

            <div className="cv-ticker">
              <div className="cv-ticker__strip">
                <span>Free Forever</span><span className="cv-ticker__dot">·</span>
                <span>50K+ Coupons</span><span className="cv-ticker__dot">·</span>
                <span>Sign Up in 30s</span><span className="cv-ticker__dot">·</span>
                <span>Free Forever</span><span className="cv-ticker__dot">·</span>
                <span>50K+ Coupons</span><span className="cv-ticker__dot">·</span>
                <span>Sign Up in 30s</span><span className="cv-ticker__dot">·</span>
              </div>
            </div>

            <ul className="cv-feats">
              <li className="cv-feat">
                <span className="cv-feat__icon">🛍️</span>
                <span><strong>Shop &amp; Save</strong> — apply coupons at checkout instantly</span>
              </li>
              <li className="cv-feat">
                <span className="cv-feat__icon">📩</span>
                <span><strong>Request Vouchers</strong> — ask sellers directly for deals</span>
              </li>
              <li className="cv-feat">
                <span className="cv-feat__icon">📊</span>
                <span><strong>Track Savings</strong> — see exactly how much you've saved</span>
              </li>
            </ul>
          </div>

          <p className="cv-hero__copy">© 2025 CouponVault · All rights reserved</p>
        </aside>

        {/* ── RIGHT FORM ── */}
        <main className="cv-panel" role="main">
          <div className="cv-card">

            <div className="cv-card__head">
              <p className="cv-card__eyebrow">New Account</p>
              <h2 className="cv-card__title">Create<br/>Account</h2>
              <p className="cv-card__sub">Free forever · No credit card required</p>
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

              {/* Full Name */}
              <div className="cv-field">
                <label htmlFor="reg-name" className="cv-label">Full Name</label>
                <div className="cv-input-wrap">
                  <svg className="cv-input-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    ref={nameRef} id="reg-name" name="name" type="text"
                    placeholder="John Doe"
                    value={form.name} onChange={handleChange}
                    required aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "rn-err" : undefined}
                    autoComplete="name" disabled={isLoading}
                    className={`cv-input${errors.name ? " cv-input--err" : ""}`}
                  />
                </div>
                {errors.name && <span id="rn-err" className="cv-error" role="alert">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="cv-field">
                <label htmlFor="reg-email" className="cv-label">Email Address</label>
                <div className="cv-input-wrap">
                  <svg className="cv-input-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    ref={emailRef} id="reg-email" name="email" type="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    required aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "re-err" : undefined}
                    autoComplete="email" disabled={isLoading}
                    className={`cv-input${errors.email ? " cv-input--err" : ""}`}
                  />
                </div>
                {errors.email && <span id="re-err" className="cv-error" role="alert">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="cv-field">
                <label htmlFor="reg-pass" className="cv-label">Password</label>
                <div className="cv-input-wrap">
                  <svg className="cv-input-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    ref={passwordRef} id="reg-pass" name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password} onChange={handleChange}
                    required aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "rp-err" : undefined}
                    autoComplete="new-password" disabled={isLoading}
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
                {form.password && (
                  <div className="cv-strength">
                    <div className="cv-strength__bar">
                      <div className="cv-strength__fill"
                        style={{ width: `${passwordStrength}%`, background: sm.color }} />
                    </div>
                    {sm.label && <span className="cv-strength__label" style={{ color: sm.color }}>{sm.label}</span>}
                  </div>
                )}
                {errors.password && <span id="rp-err" className="cv-error" role="alert">{errors.password}</span>}
              </div>

              <button type="submit" disabled={isLoading} aria-busy={isLoading}
                className={`cv-btn${isLoading ? " cv-btn--loading" : ""}`}>
                {isLoading
                  ? <><span className="cv-spinner" />Creating Account…</>
                  : <>Create Free Account <span className="cv-btn__arrow">→</span></>
                }
              </button>
            </form>

            <p className="cv-foot">
              Already have an account?{" "}
              <Link to="/login" className="cv-link">Sign in here</Link>
            </p>
          </div>
        </main>

      </div>
    </div>
  );
}
