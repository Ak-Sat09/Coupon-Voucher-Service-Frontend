import { useCallback, useEffect, useRef, useState } from "react";
import { registerUser } from "../services/userService";
import { Eye, EyeOff } from "lucide-react";

const PRIMARY = "#0D9488";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.2-5.6l-6.6-5.6C29.6 34.6 27 35.5 24 35.5c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.6 4.6-4.7 6l6.6 5.6C39.2 37.9 44 31.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M20 6 9 17l-5-5" stroke={PRIMARY} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InputField({ label, children }) {
  return (
    <label className="grid gap-2 text-left">
      <span className="text-[13.5px] font-semibold text-[#18181B]">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-[#CFEAE6] bg-white px-4 text-[14px] text-[#18181B] outline-none placeholder:text-[#B4B2C4] transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10";

function AuthForm({ heading, subheading, children }) {
  return (
    <>
      <h1 className="font-['Poppins'] text-[1.7rem] font-bold leading-tight text-[#18181B] sm:text-[2rem]">
        {heading}
      </h1>
      <p className="mt-1.5 text-[13.5px] text-[#9291A5]">{subheading}</p>
      {children}
    </>
  );
}

function RingsAndPhone({ children }) {
  const dots = [
    { top: "2%", left: "50%" },
    { top: "18%", left: "88%" },
    { top: "50%", left: "97%" },
    { top: "82%", left: "88%" },
    { top: "98%", left: "50%" },
    { top: "82%", left: "12%" },
    { top: "50%", left: "3%" },
    { top: "18%", left: "12%" },
  ];
  return (
    <div className="relative grid h-[420px] w-[420px] place-items-center">
      {[420, 320, 220].map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full border"
          style={{ width: size, height: size, borderColor: PRIMARY, opacity: 0.35 - i * 0.06 }}
        />
      ))}
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{ top: d.top, left: d.left, backgroundColor: PRIMARY, boxShadow: "0 2px 6px rgba(13,148,136,0.35)" }}
        />
      ))}
      {children}
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="relative h-[300px] w-[152px] rounded-[26px] border-[6px] border-[#18181B] bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]">
      <div className="absolute left-1/2 top-0 h-[16px] w-[60px] -translate-x-1/2 rounded-b-xl bg-[#18181B]" />
      <div className="px-3.5 pt-6 text-left">
        <p className="text-[10px] font-bold leading-tight text-[#18181B]">Join us</p>
        <p className="text-[10px] font-bold leading-tight text-[#18181B]">Now!!</p>
        <p className="mt-0.5 text-[6px] text-[#B4B2C4]">Let's Create your account</p>
        <div className="mt-3 h-1.5 w-8 rounded-full bg-[#CFEAE6]" />
        <div className="mt-1 h-4 w-full rounded-md border border-[#CFEAE6]" />
        <div className="mt-2 h-1.5 w-6 rounded-full bg-[#CFEAE6]" />
        <div className="mt-1 h-4 w-full rounded-md border border-[#CFEAE6]" />
        <div className="mt-2 h-1.5 w-9 rounded-full bg-[#CFEAE6]" />
        <div className="mt-1 h-4 w-full rounded-md border border-[#CFEAE6]" />
        <div className="mt-5 h-6 w-full rounded-full" style={{ backgroundColor: PRIMARY }} />
        <div className="mt-1.5 h-5 w-full rounded-full border border-[#CFEAE6]" />
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const pwRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validEmail = useCallback((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), []);

  const onChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setMsg((p) => (p.text ? { text: "", type: "" } : p));
  }, []);

  const validate = useCallback(() => {
    const next = { name: "", email: "", password: "" };
    let ok = true;
    if (form.name.trim().length < 2) {
      next.name = "Enter your full name";
      ok = false;
    }
    if (!form.email) {
      next.email = "Email is required";
      ok = false;
    } else if (!validEmail(form.email)) {
      next.email = "Enter a valid email";
      ok = false;
    }
    if (form.password.length < 8) {
      next.password = "Use at least 8 characters";
      ok = false;
    }
    setErrors(next);
    return ok;
  }, [form, validEmail]);

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (loading) return;
      if (!validate()) {
        if (form.name.trim().length < 2) nameRef.current?.focus();
        else if (!form.email || !validEmail(form.email)) emailRef.current?.focus();
        else pwRef.current?.focus();
        return;
      }
      setLoading(true);
      setMsg({ text: "", type: "" });
      try {
        const res = await registerUser(form);
        if (res.success) {
          setDone(true);
        } else {
          setMsg({ text: res.message || "Registration failed.", type: "error" });
        }
      } catch {
        setMsg({ text: "Network error. Try again.", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [form, loading, validate, validEmail]
  );

  const formFields = (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit} noValidate>
      <InputField label="Full Name">
        <input
          ref={nameRef}
          name="name"
          type="text"
          placeholder="enter your name"
          className={inputCls}
          value={form.name}
          onChange={onChange}
          required
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
          disabled={loading}
        />
        {errors.name && <small className="text-[12px] font-medium text-red-600">{errors.name}</small>}
      </InputField>

      <InputField label="Email">
        <input
          ref={emailRef}
          name="email"
          type="email"
          placeholder="admin@gmail.com"
          className={inputCls}
          value={form.email}
          onChange={onChange}
          required
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          disabled={loading}
        />
        {errors.email && <small className="text-[12px] font-medium text-red-600">{errors.email}</small>}
      </InputField>

      <InputField label="Password">
        <div className="relative">
          <input
            ref={pwRef}
            name="password"
            type={showPw ? "text" : "password"}
            placeholder="enter your password"
            className={`${inputCls} pr-11`}
            value={form.password}
            onChange={onChange}
            required
            aria-invalid={Boolean(errors.password)}
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B4B2C4] transition hover:text-[#18181B]"
            aria-label={showPw ? "Hide password" : "Show password"}
            disabled={loading}
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors.password && <small className="text-[12px] font-medium text-red-600">{errors.password}</small>}
      </InputField>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="mt-3 inline-flex h-[50px] items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white shadow-[0_14px_28px_-10px_rgba(13,148,136,0.6)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: PRIMARY }}
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {loading ? "Creating account..." : "Sign up"}
      </button>

      <div className="my-1 flex items-center gap-3 text-[12px] font-medium text-[#B4B2C4]">
        <span className="h-px flex-1 bg-[#CFEAE6]" />
        OR
        <span className="h-px flex-1 bg-[#CFEAE6]" />
      </div>

      <button
        type="button"
        className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-full border border-[#CFEAE6] bg-white text-[14px] font-semibold text-[#18181B] transition hover:bg-[#F5FBFA]"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="mt-1 text-center text-[13px] text-[#9291A5]">
        Already have an Account?{" "}
        <a href="/login" className="font-semibold" style={{ color: PRIMARY }}>
          Sign-in
        </a>
      </p>
    </form>
  );

  const successView = (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full" style={{ backgroundColor: "#0D94881A" }}>
        <CheckIcon />
      </div>
      <h2 className="mt-5 font-['Poppins'] text-[1.5rem] font-bold text-[#18181B]">Account created</h2>
      <p className="mt-2 max-w-[300px] text-[14px] leading-6 text-[#9291A5]">
        {form.name.split(" ")[0] || "You"}'re in. Sign in to start exploring your account.
      </p>
      <a
        href="/login"
        className="mt-7 inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white transition hover:brightness-105"
        style={{ backgroundColor: PRIMARY }}
      >
        Continue to sign in
      </a>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-white font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #E3F5F2 1.5px, transparent 1.5px), radial-gradient(circle, #E3F5F2 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      />

      {/* mobile layout */}
      <div className="relative mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-10 md:hidden">
        {done ? (
          successView
        ) : (
          <>
            <h1 className="font-['Poppins'] text-[1.8rem] font-bold leading-[1.15] text-[#18181B]">
              Join us Now!!
            </h1>
            <p className="mt-2 text-[13.5px] text-[#9291A5]">Let's Create your account</p>

            {msg.text && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-[13px] font-medium leading-5 ${
                  msg.type === "error" ? "border-red-200 bg-red-50 text-red-600" : "border-[#0D9488]/20 bg-[#0D9488]/6 text-[#0D9488]"
                }`}
                role="alert"
              >
                {msg.text}
              </div>
            )}

            {formFields}
          </>
        )}
      </div>

      {/* desktop layout */}
      <div className="relative mx-auto hidden min-h-screen max-w-[1200px] items-center gap-16 px-10 md:flex">
        <div className="flex flex-1 justify-center">
          <RingsAndPhone>
            <PhoneMock />
          </RingsAndPhone>
        </div>

        <div className="w-full max-w-[420px] shrink-0">
          {done ? (
            successView
          ) : (
            <AuthForm heading="Join us Now!!" subheading="Let's Create your account">
              {msg.text && (
                <div
                  className={`mt-5 rounded-xl border px-4 py-3 text-[13px] font-medium leading-5 ${
                    msg.type === "error" ? "border-red-200 bg-red-50 text-red-600" : "border-[#0D9488]/20 bg-[#0D9488]/6 text-[#0D9488]"
                  }`}
                  role="alert"
                >
                  {msg.text}
                </div>
              )}
              {formFields}
            </AuthForm>
          )}
        </div>
      </div>
    </main>
  );
}
