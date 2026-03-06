import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/userService";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Bricolage+Grotesque:wght@300;400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f5f4f0;--bg2:#edecea;--bg3:#e4e2de;--white:#ffffff;
  --ink:#0f0e0b;--ink2:#1e1c17;--ink3:#2d2a22;
  --muted:#7a7568;--muted2:#a09892;
  --border:rgba(15,14,11,0.1);--border2:rgba(15,14,11,0.16);
  --violet:#6d28d9;--violet2:#7c3aed;--violet3:#8b5cf6;
  --violet-g:rgba(109,40,217,0.07);
  --lime:#65a30d;--lime2:#84cc16;--lime-lt:#a3e635;
  --lime-g:rgba(101,163,13,0.08);
  --red:#dc2626;--green:#16a34a;
  --shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 32px rgba(0,0,0,0.06);
  --shadow2:0 2px 8px rgba(0,0,0,0.06),0 24px 64px rgba(0,0,0,0.08);
  --fd:'Cabinet Grotesk',sans-serif;
  --fb:'Bricolage Grotesque',sans-serif;
}
html,body{min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--fb);-webkit-font-smoothing:antialiased}

.pg{min-height:100vh;display:grid;grid-template-columns:1.2fr 0.8fr;position:relative}
@media(max-width:900px){.pg{grid-template-columns:1fr}.pg__l{display:none}}
.pg::before{
  content:'';position:fixed;inset:0;
  background-image:radial-gradient(circle,rgba(15,14,11,0.05) 1px,transparent 1px);
  background-size:28px 28px;pointer-events:none;z-index:0;
}

/* LEFT */
.pg__l{
  position:relative;z-index:1;background:var(--bg);padding:52px 60px;
  display:flex;flex-direction:column;border-right:1px solid var(--border);overflow:hidden;
}
.pg__l::before{
  content:'';position:absolute;width:3px;height:200%;
  background:linear-gradient(transparent,rgba(101,163,13,0.14),transparent);
  top:-50%;right:80px;transform:rotate(12deg);pointer-events:none;
}
.pg__l::after{
  content:'';position:absolute;width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(101,163,13,0.08) 0%,transparent 65%);
  top:-200px;left:-160px;pointer-events:none;
}
.pg__l-in{position:relative;z-index:1;height:100%;display:flex;flex-direction:column}

.brand{display:flex;align-items:center;gap:12px}
.brand__ic{width:44px;height:44px;border-radius:12px;background:var(--ink);
  display:flex;align-items:center;justify-content:center;font-size:18px;
  box-shadow:0 4px 16px rgba(15,14,11,0.2);flex-shrink:0}
.brand__name{font-family:var(--fd);font-size:18px;font-weight:900;letter-spacing:-0.025em;color:var(--ink)}
.brand__tag{font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
  background:var(--lime-g);border:1px solid rgba(101,163,13,0.25);color:var(--lime);padding:3px 8px;border-radius:100px;margin-left:2px}

.pg__hero{flex:1;display:flex;flex-direction:column;justify-content:center;padding:44px 0}
.pg__eyebrow{display:inline-flex;align-items:center;gap:8px;
  font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--lime);margin-bottom:24px}
.pg__eyebrow-dot{width:5px;height:5px;border-radius:50%;background:var(--lime);animation:pulse 2s ease infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(1.6)}}

.pg__h1{font-family:var(--fd);font-size:clamp(50px,5.5vw,76px);font-weight:900;
  line-height:0.93;letter-spacing:-0.04em;color:var(--ink);margin-bottom:6px}
.pg__h1 .ac{display:block;
  background:linear-gradient(135deg,var(--lime) 0%,var(--lime2) 60%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pg__h1 .lt{font-style:italic;font-weight:700;color:var(--muted2)}
.pg__sub{font-size:15px;line-height:1.75;color:var(--muted);font-weight:300;max-width:360px;margin:22px 0 44px}

/* 2×2 perks */
.perks{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:32px}
.perk{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:20px 16px;
  box-shadow:var(--shadow);transition:border-color 200ms,transform 200ms,box-shadow 200ms;
  animation:mIn .5s ease both}
.perk:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:var(--shadow2)}
.perk:nth-child(1){animation-delay:.1s}.perk:nth-child(2){animation-delay:.2s}
.perk:nth-child(3){animation-delay:.3s}.perk:nth-child(4){animation-delay:.4s}
@keyframes mIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.perk__ic{font-size:22px;margin-bottom:10px}
.perk__t{font-size:12px;font-weight:700;color:var(--ink);margin-bottom:4px}
.perk__s{font-size:11px;color:var(--muted);line-height:1.5}

/* steps */
.steps{display:flex;align-items:center;gap:0}
.step{display:flex;align-items:center;gap:8px}
.step__n{width:24px;height:24px;border-radius:50%;
  background:var(--lime-g);border:1.5px solid rgba(101,163,13,0.35);
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:800;color:var(--lime);flex-shrink:0}
.step__t{font-size:11px;font-weight:600;color:var(--muted);white-space:nowrap}
.step__line{flex:1;height:1px;background:var(--border);margin:0 8px;min-width:20px}

.pg__copy{font-size:11px;color:var(--muted2);letter-spacing:0.05em}

/* RIGHT */
.pg__r{position:relative;z-index:1;background:var(--white);
  display:flex;align-items:center;justify-content:center;
  padding:52px 52px;box-shadow:-1px 0 0 var(--border);overflow-y:auto}
.pg__r::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--lime) 0%,var(--lime2) 40%,var(--violet3) 100%)}

.fw{width:100%;max-width:400px;animation:fUp .4s cubic-bezier(0.16,1,0.3,1) both;padding:8px 0}
@keyframes fUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.fh{margin-bottom:34px}
.fh__tag{display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:700;
  letter-spacing:0.2em;text-transform:uppercase;color:var(--lime);margin-bottom:14px}
.fh__tag::before{content:'';width:20px;height:2px;background:var(--lime);border-radius:1px}
.fh__h2{font-family:var(--fd);font-size:44px;font-weight:900;letter-spacing:-0.04em;line-height:0.94;color:var(--ink);margin-bottom:12px}
.fh__h2 em{display:block;font-style:italic;font-weight:700;
  background:linear-gradient(135deg,var(--lime) 0%,var(--lime2) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.fh__sub{font-size:13px;color:var(--muted);font-weight:400;line-height:1.65}

.al{display:flex;align-items:flex-start;gap:10px;padding:13px 16px;border-radius:12px;
  font-size:13px;line-height:1.5;font-weight:500;margin-bottom:20px;border:1px solid;animation:aIn .2s ease both}
@keyframes aIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.al--error{background:rgba(220,38,38,0.05);border-color:rgba(220,38,38,0.2);color:var(--red)}
.al--success{background:rgba(22,163,74,0.05);border-color:rgba(22,163,74,0.2);color:var(--green)}
.al__ico{font-weight:900;font-size:14px;flex-shrink:0}

.socials{display:flex;gap:10px;margin-bottom:18px}
.social-btn{flex:1;padding:11px 14px;background:var(--bg);border:1.5px solid var(--border2);
  border-radius:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
  font-family:var(--fb);font-size:13px;font-weight:600;color:var(--ink3);
  transition:border-color 150ms,background 150ms,transform 200ms,box-shadow 200ms}
.social-btn:hover{border-color:var(--lime2);background:var(--white);transform:translateY(-1px);box-shadow:var(--shadow)}

.divider{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border)}
.divider span{font-size:10px;color:var(--muted2);font-weight:600;letter-spacing:0.12em;text-transform:uppercase}

.fields{display:flex;flex-direction:column;gap:15px}
.f{display:flex;flex-direction:column;gap:7px}
.lbl{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink3)}
.iw{position:relative}
.ico{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--muted2);pointer-events:none;z-index:1;transition:color 200ms}
.iw:focus-within .ico{color:var(--lime)}
.inp{width:100%;padding:14px 48px;font-family:var(--fb);font-size:14px;font-weight:400;
  background:var(--bg);border:1.5px solid var(--border2);border-radius:11px;color:var(--ink);outline:none;
  transition:border-color 200ms,background 200ms,box-shadow 200ms;-webkit-appearance:none}
.inp::placeholder{color:var(--muted2)}
.inp:hover:not(:disabled){border-color:rgba(15,14,11,0.22)}
.inp:focus{border-color:var(--lime2);background:var(--white);box-shadow:0 0 0 3px rgba(101,163,13,0.12)}
.inp--e{border-color:var(--red)!important;background:#fff5f5!important}
.inp:disabled{opacity:0.5;cursor:not-allowed}
.eye{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;
  color:var(--muted2);padding:4px;border-radius:6px;display:flex;align-items:center;transition:color 150ms}
.eye:hover{color:var(--ink)}
.em{font-size:12px;font-weight:500;color:var(--red);display:flex;align-items:center;gap:5px}
.em::before{content:'↑';font-size:11px;font-weight:900}

/* strength */
.str{display:flex;align-items:center;gap:10px;margin-top:4px}
.str-bar{flex:1;height:3px;background:var(--bg3);border-radius:2px;overflow:hidden}
.str-fill{height:100%;border-radius:2px;transition:width .3s ease,background .3s ease}
.str-lbl{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;min-width:44px}

/* terms */
.terms{display:flex;align-items:flex-start;gap:10px;font-size:12px;color:var(--muted);line-height:1.5}
.terms input[type="checkbox"]{margin-top:2px;accent-color:var(--lime2);width:14px;height:14px;flex-shrink:0;cursor:pointer}
.terms a{color:var(--violet2);text-decoration:none;font-weight:600}
.terms a:hover{text-decoration:underline}

/* submit — lime CTA for register */
.sub-btn{width:100%;margin-top:6px;padding:16px 24px;
  font-family:var(--fd);font-size:14px;font-weight:800;
  background:linear-gradient(135deg,var(--lime) 0%,var(--lime2) 100%);
  color:var(--white);border:none;border-radius:11px;cursor:pointer;position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;gap:10px;
  transition:transform 300ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms,filter 150ms}
.sub-btn::before{content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%);opacity:0;transition:opacity 200ms}
.sub-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 40px rgba(101,163,13,0.3);filter:brightness(1.05)}
.sub-btn:hover::before{opacity:1}
.sub-btn:active:not(:disabled){transform:translateY(0);box-shadow:none}
.sub-btn:disabled{opacity:0.45;cursor:not-allowed}
.arr{font-size:18px;transition:transform 220ms cubic-bezier(0.34,1.56,0.64,1)}
.sub-btn:hover .arr{transform:translateX(5px)}
.spin{width:16px;height:16px;border-radius:50%;border:2.5px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:sp .6s linear infinite;flex-shrink:0}
@keyframes sp{to{transform:rotate(360deg)}}

.foot{margin-top:24px;text-align:center;font-size:13px;color:var(--muted);padding-top:18px;border-top:1px solid var(--border)}
.fl{color:var(--violet2);text-decoration:none;font-weight:700;border-bottom:1px solid transparent;transition:border-color 150ms}
.fl:hover{border-color:var(--violet2)}
`;

const calcStr = pw => {
  let s = 0;
  if (pw.length >= 8)  s += 25; if (pw.length >= 12) s += 25;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 25;
  if (/[0-9]/.test(pw)) s += 15; if (/[^a-zA-Z0-9]/.test(pw)) s += 10;
  return Math.min(100, s);
};
const strMeta = n => {
  if (!n) return { c:"transparent", l:"" };
  if (n < 40) return { c:"#dc2626", l:"Weak" };
  if (n < 70) return { c:"#ea580c", l:"Fair" };
  if (n < 90) return { c:"#65a30d", l:"Good" };
  return { c:"#16a34a", l:"Strong" };
};

const PERKS = [
  { i:"🏷️", t:"50K+ Coupons", s:"New deals added daily" },
  { i:"⚡",  t:"Instant Access", s:"Redeem in seconds" },
  { i:"🔒", t:"100% Secure",  s:"Your data is private" },
  { i:"💸", t:"Free Forever", s:"No credit card needed" },
];

export default function Register() {
  const [form, setForm]     = useState({ name:"", email:"", password:"" });
  const [errors, setErrors] = useState({ name:"", email:"", password:"" });
  const [msg, setMsg]       = useState({ text:"", type:"" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [str, setStr]         = useState(0);
  const [agreed, setAgreed]   = useState(false);
  const nameRef  = useRef(null);
  const emailRef = useRef(null);
  const pwRef    = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  const validEmail = useCallback(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), []);
  const onChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === "password") setStr(calcStr(value));
    setErrors(p => ({ ...p, [name]: "" }));
    if (msg.text) setMsg({ text:"", type:"" });
  }, [msg.text]);
  const validate = useCallback(() => {
    const e = { name:"", email:"", password:"" }; let ok = true;
    if (!form.name)                       { e.name = "Full name required"; ok = false; }
    else if (form.name.trim().length < 2) { e.name = "Minimum 2 characters"; ok = false; }
    if (!form.email)                      { e.email = "Email address required"; ok = false; }
    else if (!validEmail(form.email))     { e.email = "Enter a valid email"; ok = false; }
    if (!form.password)                   { e.password = "Password required"; ok = false; }
    else if (form.password.length < 8)    { e.password = "Minimum 8 characters"; ok = false; }
    setErrors(e); return ok;
  }, [form, validEmail]);
  const onSubmit = useCallback(async e => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) {
      if (errors.name) nameRef.current?.focus();
      else if (errors.email) emailRef.current?.focus();
      else pwRef.current?.focus();
      return;
    }
    if (!agreed) { setMsg({ text:"Please accept the Terms & Privacy Policy.", type:"error" }); return; }
    setLoading(true); setMsg({ text:"", type:"" });
    try {
      const res = await registerUser(form);
      if (res.success || res.message?.includes("success")) {
        setMsg({ text:"Account created! Redirecting to login…", type:"success" });
        setForm({ name:"", email:"", password:"" }); setStr(0);
        setTimeout(() => { window.location.href = "/login"; }, 2000);
      } else { setMsg({ text: res.message || "Registration failed.", type:"error" }); }
    } catch { setMsg({ text:"Network error. Try again.", type:"error" }); }
    finally { setLoading(false); }
  }, [form, loading, validate, errors, agreed]);

  const sm = strMeta(str);
  const EyeOn  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const EyeOff = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <>
      <style>{S}</style>
      <div className="pg">

        {/* LEFT */}
        <div className="pg__l">
          <div className="pg__l-in">
            <div className="brand">
              <div className="brand__ic">🏷️</div>
              <span className="brand__name">CouponVault</span>
              <span className="brand__tag">Free</span>
            </div>

            <div className="pg__hero">
              <div className="pg__eyebrow">
                <span className="pg__eyebrow-dot"/>
                Join Free Today
              </div>
              <h1 className="pg__h1">
                Start<br/>
                <span className="ac">Saving Now.</span>
                <span className="lt"> No Cards.</span>
              </h1>
              <p className="pg__sub">
                Create your free account and unlock access to thousands of
                exclusive coupons from verified sellers — no credit card required.
              </p>

              <div className="perks">
                {PERKS.map((p,i) => (
                  <div className="perk" key={i}>
                    <div className="perk__ic">{p.i}</div>
                    <div className="perk__t">{p.t}</div>
                    <div className="perk__s">{p.s}</div>
                  </div>
                ))}
              </div>

              <div className="steps">
                <div className="step"><div className="step__n">1</div><div className="step__t">Register</div></div>
                <div className="step__line"/>
                <div className="step"><div className="step__n">2</div><div className="step__t">Browse Deals</div></div>
                <div className="step__line"/>
                <div className="step"><div className="step__n">3</div><div className="step__t">Save Big</div></div>
              </div>
            </div>

            <p className="pg__copy">© 2025 CouponVault · All rights reserved</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="pg__r">
          <div className="fw">
            <div className="fh">
              <div className="fh__tag">New Account</div>
              <h2 className="fh__h2">
                Create
                <em>Your Account.</em>
              </h2>
              <p className="fh__sub">Free forever · No credit card · Join 1M+ smart shoppers.</p>
            </div>

            {msg.text && (
              <div className={`al al--${msg.type}`} role="alert" aria-live="assertive">
                <span className="al__ico">{msg.type === "success" ? "✓" : "✕"}</span>
                <span>{msg.text}</span>
              </div>
            )}

            <div className="socials">
              <button type="button" className="social-btn">
                <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign up with Google
              </button>
            </div>

            <div className="divider"><span>or sign up with email</span></div>

            <form onSubmit={onSubmit} noValidate className="fields">
              <div className="f">
                <label htmlFor="r-name" className="lbl">Full Name</label>
                <div className="iw">
                  <svg className="ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input ref={nameRef} id="r-name" name="name" type="text" placeholder="John Doe"
                    value={form.name} onChange={onChange} required aria-required="true"
                    aria-invalid={!!errors.name} autoComplete="name" disabled={loading}
                    className={`inp${errors.name?" inp--e":""}`}/>
                </div>
                {errors.name && <span className="em" role="alert">{errors.name}</span>}
              </div>

              <div className="f">
                <label htmlFor="r-email" className="lbl">Email Address</label>
                <div className="iw">
                  <svg className="ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input ref={emailRef} id="r-email" name="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={onChange} required aria-required="true"
                    aria-invalid={!!errors.email} autoComplete="email" disabled={loading}
                    className={`inp${errors.email?" inp--e":""}`}/>
                </div>
                {errors.email && <span className="em" role="alert">{errors.email}</span>}
              </div>

              <div className="f">
                <label htmlFor="r-pw" className="lbl">Password</label>
                <div className="iw">
                  <svg className="ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input ref={pwRef} id="r-pw" name="password" type={showPw?"text":"password"}
                    placeholder="Create a strong password" value={form.password} onChange={onChange}
                    required aria-required="true" aria-invalid={!!errors.password}
                    autoComplete="new-password" disabled={loading}
                    className={`inp${errors.password?" inp--e":""}`}/>
                  <button type="button" className="eye" onClick={()=>setShowPw(s=>!s)}
                    aria-label={showPw?"Hide":"Show"}>{showPw?<EyeOn/>:<EyeOff/>}</button>
                </div>
                {form.password && (
                  <div className="str">
                    <div className="str-bar"><div className="str-fill" style={{width:`${str}%`,background:sm.c}}/></div>
                    {sm.l && <span className="str-lbl" style={{color:sm.c}}>{sm.l}</span>}
                  </div>
                )}
                {errors.password && <span className="em" role="alert">{errors.password}</span>}
              </div>

              <div className="terms">
                <input type="checkbox" id="terms" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/>
                <label htmlFor="terms">I agree to the <a href="/">Terms of Service</a> and <a href="/">Privacy Policy</a></label>
              </div>

              <button type="submit" disabled={loading} aria-busy={loading} className="sub-btn">
                {loading
                  ? <><span className="spin"/>Creating Account…</>
                  : <>Create Free Account <span className="arr">→</span></>
                }
              </button>
            </form>

            <p className="foot">
              Already have an account?{" "}
              <Link to="/login" className="fl">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}