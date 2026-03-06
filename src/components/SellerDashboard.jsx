import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

/* ─────────────────────────── STYLES ─────────────────────────── */
const S = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Bricolage+Grotesque:wght@300;400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:       #f5f4f0;
  --bg2:      #edecea;
  --bg3:      #e4e2de;
  --white:    #ffffff;
  --ink:      #0f0e0b;
  --ink2:     #1e1c17;
  --ink3:     #2d2a22;
  --muted:    #7a7568;
  --muted2:   #a09892;
  --border:   rgba(15,14,11,0.1);
  --border2:  rgba(15,14,11,0.16);
  --violet:   #6d28d9;
  --violet2:  #7c3aed;
  --violet3:  #8b5cf6;
  --violet-g: rgba(109,40,217,0.08);
  --lime:     #65a30d;
  --lime2:    #84cc16;
  --lime-lt:  #a3e635;
  --lime-g:   rgba(101,163,13,0.08);
  --red:      #dc2626;
  --red-g:    rgba(220,38,38,0.08);
  --green:    #16a34a;
  --green-g:  rgba(22,163,74,0.07);
  --orange:   #ea580c;
  --orange-g: rgba(234,88,12,0.08);
  --shadow:   0 1px 3px rgba(0,0,0,0.08),0 8px 32px rgba(0,0,0,0.06);
  --shadow2:  0 2px 8px rgba(0,0,0,0.06),0 24px 64px rgba(0,0,0,0.08);
  --fd:'Cabinet Grotesk',sans-serif;
  --fb:'Bricolage Grotesque',sans-serif;
}
html,body{min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--fb);-webkit-font-smoothing:antialiased}

/* ── ROOT ── */
.sd{min-height:100vh;position:relative}
.sd::before{
  content:'';position:fixed;inset:0;
  background-image:radial-gradient(circle,rgba(15,14,11,0.055) 1px,transparent 1px);
  background-size:28px 28px;pointer-events:none;z-index:0;
}

/* ── TOPBAR ── */
.tb{
  position:sticky;top:0;z-index:100;
  background:rgba(245,244,240,0.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid var(--border);
  padding:0 40px;height:64px;
  display:flex;align-items:center;justify-content:space-between;
}
.brand{display:flex;align-items:center;gap:12px}
.brand__ic{
  width:40px;height:40px;border-radius:11px;background:var(--ink);
  display:flex;align-items:center;justify-content:center;font-size:17px;
  box-shadow:0 4px 16px rgba(15,14,11,0.2);flex-shrink:0;
}
.brand__name{font-family:var(--fd);font-size:17px;font-weight:900;letter-spacing:-0.025em;color:var(--ink)}
.brand__tag{
  font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
  background:var(--violet-g);border:1px solid rgba(109,40,217,0.2);
  color:var(--violet2);padding:3px 8px;border-radius:100px;margin-left:2px;
}
.tb__right{display:flex;align-items:center;gap:10px}
.tb__pill{
  display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:100px;
  background:var(--white);border:1.5px solid var(--border2);
  font-size:12px;font-weight:600;color:var(--ink3);box-shadow:var(--shadow);
}
.tb__dot{width:7px;height:7px;border-radius:50%;background:var(--violet3);animation:pulse 2s ease infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.6)}}
.tb__av{
  width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,var(--violet2),var(--violet3));
  display:flex;align-items:center;justify-content:center;
  font-family:var(--fd);font-size:12px;font-weight:900;color:#fff;
  border:2px solid var(--white);box-shadow:var(--shadow);cursor:pointer;
  transition:transform 200ms,box-shadow 200ms;
}
.tb__av:hover{transform:scale(1.08);box-shadow:var(--shadow2)}

/* ── MAIN ── */
.main{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:48px 40px 80px}

/* ── PAGE HEADER ── */
.ph{margin-bottom:36px}
.ph__eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--violet2);margin-bottom:12px;
}
.ph__dot{width:5px;height:5px;border-radius:50%;background:var(--violet2);animation:pulse 2s ease infinite}
.ph__h1{
  font-family:var(--fd);font-size:clamp(36px,4vw,54px);font-weight:900;
  line-height:.95;letter-spacing:-0.04em;color:var(--ink);
}
.ph__h1 span{
  background:linear-gradient(135deg,var(--violet2) 0%,var(--violet3) 50%,#a78bfa 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.ph__sub{font-size:14px;color:var(--muted);font-weight:300;margin-top:10px;line-height:1.7}

/* ── STAT STRIP ── */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:40px}
@media(max-width:640px){.stats{grid-template-columns:1fr 1fr}}
.stat{
  background:var(--white);border:1px solid var(--border);border-radius:16px;
  padding:20px 18px;box-shadow:var(--shadow);
  animation:mIn .5s ease both;
  transition:border-color 200ms,transform 200ms,box-shadow 200ms;
}
.stat:nth-child(1){animation-delay:.05s}.stat:nth-child(2){animation-delay:.1s}.stat:nth-child(3){animation-delay:.15s}
.stat:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:var(--shadow2)}
@keyframes mIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.stat__ic{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;margin-bottom:14px}
.stat__ic--v{background:var(--violet-g);border:1px solid rgba(109,40,217,0.15)}
.stat__ic--l{background:var(--lime-g);border:1px solid rgba(101,163,13,0.2)}
.stat__ic--o{background:var(--orange-g);border:1px solid rgba(234,88,12,0.15)}
.stat__val{font-family:var(--fd);font-size:28px;font-weight:900;letter-spacing:-0.03em;line-height:1;color:var(--ink);margin-bottom:5px}
.stat__val span{color:var(--violet2)}
.stat__key{font-size:10px;font-weight:600;color:var(--muted2);letter-spacing:0.06em;text-transform:uppercase}

/* ── SECTION CARD ── */
.sec{
  background:var(--white);border:1px solid var(--border);
  border-radius:20px;box-shadow:var(--shadow);
  overflow:hidden;margin-bottom:24px;
  animation:mIn .5s ease both;
}
.sec:nth-child(1){animation-delay:.1s}.sec:nth-child(2){animation-delay:.2s}.sec:nth-child(3){animation-delay:.3s}
.sec__top-bar{height:3px;background:linear-gradient(90deg,var(--violet2),var(--violet3),var(--lime-lt))}
.sec__top-bar--lime{background:linear-gradient(90deg,var(--lime),var(--lime2),var(--lime-lt))}
.sec__top-bar--ink{background:linear-gradient(90deg,var(--ink),var(--ink2),var(--ink3))}
.sec__head{
  display:flex;align-items:center;justify-content:space-between;
  padding:22px 24px 18px;border-bottom:1px solid var(--border);
}
.sec__title{font-family:var(--fd);font-size:18px;font-weight:900;letter-spacing:-0.02em;color:var(--ink)}
.sec__count{font-size:11px;font-weight:600;color:var(--muted2);letter-spacing:0.06em;text-transform:uppercase}
.sec__body{padding:16px 24px 24px}

/* ── REQUEST ROW ── */
.req{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:16px 18px;border:1px solid var(--border);border-radius:14px;
  background:var(--bg);margin-bottom:10px;
  transition:border-color 200ms,transform 200ms,box-shadow 200ms;
  animation:mIn .4s ease both;
}
.req:last-child{margin-bottom:0}
.req:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:var(--shadow)}
.req--accepted{background:var(--green-g);border-color:rgba(22,163,74,0.2)}
.req__l{display:flex;align-items:center;gap:12px}
.req__ic{
  width:38px;height:38px;border-radius:10px;flex-shrink:0;font-size:17px;
  background:var(--white);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
}
.req__name{font-family:var(--fd);font-size:14px;font-weight:800;letter-spacing:-0.01em;color:var(--ink)}
.req__buyer{font-size:11px;color:var(--muted);margin-top:3px;font-weight:400}
.req__buyer strong{color:var(--ink3);font-weight:600}
.req__status-ok{
  display:flex;align-items:center;gap:6px;
  font-size:12px;font-weight:700;color:var(--green);
}
.req__status-dot{width:6px;height:6px;border-radius:50%;background:var(--green)}

/* accept btn */
.accept-btn{
  padding:9px 18px;border-radius:9px;
  font-family:var(--fd);font-size:12px;font-weight:800;letter-spacing:0.02em;
  background:var(--ink);color:var(--bg);border:none;cursor:pointer;
  display:flex;align-items:center;gap:7px;
  transition:background 200ms,transform 300ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms;
  white-space:nowrap;
}
.accept-btn:hover:not(:disabled){background:var(--ink2);transform:translateY(-1px);box-shadow:0 8px 24px rgba(15,14,11,0.2)}
.accept-btn:active:not(:disabled){transform:translateY(0)}
.accept-btn:disabled{opacity:.45;cursor:not-allowed}
.spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(245,244,240,0.25);border-top-color:var(--bg);animation:sp .6s linear infinite;flex-shrink:0}
@keyframes sp{to{transform:rotate(360deg)}}

/* ── COUPON ITEM ── */
.ci{
  border:1px solid var(--border);border-radius:14px;
  background:var(--bg);margin-bottom:10px;overflow:hidden;
  transition:border-color 200ms,box-shadow 200ms;
  animation:mIn .4s ease both;
}
.ci:last-child{margin-bottom:0}
.ci:hover{border-color:var(--border2);box-shadow:var(--shadow)}
.ci__bar{height:2px;background:linear-gradient(90deg,var(--violet2),var(--lime-lt))}
.ci__row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px}
.ci__l{flex:1;min-width:0}
.ci__name{font-family:var(--fd);font-size:15px;font-weight:800;letter-spacing:-0.01em;color:var(--ink)}
.ci__desc{font-size:12px;color:var(--muted);margin-top:4px;font-weight:300;line-height:1.6;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci__meta{display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap}
.ci__code{
  font-family:var(--fd);font-size:11px;font-weight:800;letter-spacing:0.1em;
  color:var(--violet2);background:var(--violet-g);border:1px solid rgba(109,40,217,0.15);
  padding:3px 10px;border-radius:100px;
}
.ci__exp{font-size:11px;color:var(--muted2);font-weight:600}
.ci__exp--soon{color:var(--orange)}
.ci__actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.ci__btn{
  padding:8px 14px;border-radius:8px;font-family:var(--fd);
  font-size:11px;font-weight:800;letter-spacing:0.03em;
  border:1.5px solid;cursor:pointer;
  transition:all 180ms;white-space:nowrap;
}
.ci__btn--edit{
  background:transparent;border-color:var(--border2);color:var(--ink3);
}
.ci__btn--edit:hover{border-color:var(--violet3);color:var(--violet2);background:var(--violet-g)}
.ci__btn--del{
  background:transparent;border-color:rgba(220,38,38,0.2);color:var(--red);
}
.ci__btn--del:hover{background:var(--red-g);border-color:rgba(220,38,38,0.35)}

/* ── FORM (create / edit inline) ── */
.form-wrap{
  background:var(--white);border:1.5px solid var(--border2);
  border-radius:14px;padding:22px;margin-top:4px;
  box-shadow:var(--shadow2);
  animation:fUp .35s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:560px){.form-grid{grid-template-columns:1fr}}
.form-grid--full{grid-column:1/-1}
.f{display:flex;flex-direction:column;gap:6px}
.lbl{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink3)}
.inp{
  width:100%;padding:12px 14px;
  font-family:var(--fb);font-size:13px;font-weight:400;
  background:var(--bg);border:1.5px solid var(--border2);
  border-radius:10px;color:var(--ink);outline:none;
  transition:border-color 200ms,background 200ms,box-shadow 200ms;
}
.inp::placeholder{color:var(--muted2)}
.inp:hover:not(:disabled){border-color:rgba(15,14,11,0.22)}
.inp:focus{border-color:var(--violet2);background:var(--white);box-shadow:0 0 0 3px rgba(109,40,217,0.1)}
.form-actions{display:flex;gap:10px;margin-top:6px;grid-column:1/-1}

/* primary action btn */
.btn-primary{
  padding:12px 22px;border-radius:10px;
  font-family:var(--fd);font-size:13px;font-weight:800;
  background:var(--ink);color:var(--bg);border:none;cursor:pointer;
  display:flex;align-items:center;gap:8px;
  transition:background 200ms,transform 300ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms;
}
.btn-primary:hover{background:var(--ink2);transform:translateY(-1px);box-shadow:0 10px 32px rgba(15,14,11,0.22)}
.btn-primary:active{transform:translateY(0)}

/* ghost btn */
.btn-ghost{
  padding:12px 18px;border-radius:10px;
  font-family:var(--fd);font-size:13px;font-weight:700;
  background:transparent;border:1.5px solid var(--border2);color:var(--ink3);cursor:pointer;
  transition:border-color 180ms,color 180ms,background 180ms;
}
.btn-ghost:hover{border-color:var(--border2);color:var(--ink);background:var(--bg2)}

/* create trigger */
.create-btn{
  display:flex;align-items:center;gap:9px;
  padding:12px 20px;border-radius:10px;
  font-family:var(--fd);font-size:13px;font-weight:800;
  background:var(--ink);color:var(--bg);border:none;cursor:pointer;
  transition:background 200ms,transform 300ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms;
}
.create-btn:hover{background:var(--ink2);transform:translateY(-1px);box-shadow:0 10px 32px rgba(15,14,11,0.22)}
.create-btn__plus{
  width:20px;height:20px;border-radius:6px;
  background:rgba(245,244,240,0.15);
  display:flex;align-items:center;justify-content:center;
  font-size:16px;line-height:1;font-weight:400;
}

/* ── EMPTY / LOADING ── */
.empty{
  padding:40px 20px;text-align:center;
}
.empty__ic{font-size:36px;margin-bottom:12px}
.empty__t{font-family:var(--fd);font-size:16px;font-weight:800;color:var(--ink);margin-bottom:6px;letter-spacing:-0.02em}
.empty__s{font-size:13px;color:var(--muted);font-weight:300}

/* shimmer skeletons */
.skel-row{
  border:1px solid var(--border);border-radius:14px;
  background:var(--bg);padding:16px 18px;margin-bottom:10px;
}
.sh{border-radius:6px;background:linear-gradient(90deg,var(--bg2) 25%,var(--bg3) 50%,var(--bg2) 75%);background-size:200% 100%;animation:shimmer 1.4s ease infinite}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.sh--title{height:14px;width:40%;margin-bottom:8px}
.sh--sub{height:10px;width:60%}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:28px;left:50%;
  transform:translateX(-50%) translateY(80px);
  background:var(--ink);color:var(--bg);
  padding:11px 22px;border-radius:100px;
  font-family:var(--fd);font-size:12px;font-weight:700;
  box-shadow:0 8px 32px rgba(15,14,11,0.25);
  z-index:999;white-space:nowrap;
  transition:transform 300ms cubic-bezier(0.34,1.56,0.64,1),opacity 200ms;
  display:flex;align-items:center;gap:8px;opacity:0;pointer-events:none;
}
.toast--show{transform:translateX(-50%) translateY(0);opacity:1}
.toast__ic{color:var(--lime2)}

@media(max-width:600px){
  .tb{padding:0 20px}
  .main{padding:28px 16px 60px}
  .sec__head{padding:18px 16px 14px}
  .sec__body{padding:12px 16px 18px}
  .ci__row{flex-direction:column;align-items:flex-start}
  .ci__actions{width:100%;justify-content:flex-end}
  .req{flex-direction:column;align-items:flex-start}
}
`;

/* ─────────────────────── SUB-COMPONENTS ─────────────────────── */

function SkeletonRow() {
  return (
    <div className="skel-row">
      <div className="sh sh--title" />
      <div className="sh sh--sub" />
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="empty">
      <div className="empty__ic">{icon}</div>
      <div className="empty__t">{title}</div>
      <p className="empty__s">{sub}</p>
    </div>
  );
}

function CouponForm({ value, onChange, onSubmit, onCancel, submitLabel }) {
  return (
    <div className="form-wrap">
      <div className="form-grid">
        <div className="f">
          <label className="lbl">Coupon Name</label>
          <input className="inp" type="text" placeholder="e.g. Summer Sale" value={value.name}
            onChange={e => onChange({ ...value, name: e.target.value })} required />
        </div>
        <div className="f">
          <label className="lbl">Coupon Code</label>
          <input className="inp" type="text" placeholder="e.g. SAVE50" value={value.couponCode}
            onChange={e => onChange({ ...value, couponCode: e.target.value })} required />
        </div>
        <div className="f form-grid--full">
          <label className="lbl">Description</label>
          <input className="inp" type="text" placeholder="What does this coupon offer?" value={value.description}
            onChange={e => onChange({ ...value, description: e.target.value })} required />
        </div>
        <div className="f">
          <label className="lbl">Expiry Date</label>
          <input className="inp" type="date" value={value.expiryDate}
            onChange={e => onChange({ ...value, expiryDate: e.target.value })} required />
        </div>
        <div className="form-actions">
          <button className="btn-primary" onClick={onSubmit}>{submitLabel}</button>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

export default function SellerDashboard() {
  const [requests, setRequests]         = useState([]);
  const [coupons, setCoupons]           = useState([]);
  const [loadingRequests, setLoadingR]  = useState(true);
  const [loadingCoupons, setLoadingC]   = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newCoupon, setNewCoupon]   = useState({ name:"", description:"", couponCode:"", expiryDate:"" });

  const [editingId, setEditingId]       = useState(null);
  const [editingCoupon, setEditingCoupon] = useState({ name:"", description:"", couponCode:"", expiryDate:"" });

  const [toastMsg, setToastMsg]   = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastRef                  = useRef(null);

  /* toast helper */
  const toast = useCallback((msg) => {
    setToastMsg(msg); setShowToast(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setShowToast(false), 2400);
  }, []);

  /* fetch */
  const fetchRequests = useCallback(async () => {
    setLoadingR(true);
    try {
      const res  = await fetch(`${API_BASE}/api/coupon-requests/seller`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const json = await res.json();
      setRequests(json.data ?? []);
    } catch(e) { console.error(e); }
    finally { setLoadingR(false); }
  }, []);

  const fetchCoupons = useCallback(async () => {
    setLoadingC(true);
    try {
      const res  = await fetch(`${API_BASE}/api/seller/coupons/my`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const json = await res.json();
      setCoupons(json.data ?? []);
    } catch(e) { console.error(e); }
    finally { setLoadingC(false); }
  }, []);

  useEffect(() => { fetchRequests(); fetchCoupons(); }, [fetchRequests, fetchCoupons]);

  /* accept request */
  const handleAccept = useCallback(async (req) => {
    const id = req.id ?? req.requestId;
    if (!id) return;
    setProcessingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/coupon-requests/seller/accept/${id}`, {
        method:"POST", headers:{ Authorization:`Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      toast("✦ Request accepted!");
      fetchRequests();
    } catch { toast("Failed to accept request."); }
    finally { setProcessingId(null); }
  }, [fetchRequests, toast]);

  /* create */
  const handleCreate = useCallback(async (e) => {
    e?.preventDefault?.();
    try {
      const payload = { ...newCoupon, expiryDate: new Date(newCoupon.expiryDate).toISOString() };
      const res = await fetch(`${API_BASE}/api/seller/coupons`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setCoupons(p => [...p, json.data]);
      setNewCoupon({ name:"", description:"", couponCode:"", expiryDate:"" });
      setShowCreate(false);
      toast("✦ Coupon created!");
    } catch { toast("Failed to create coupon."); }
  }, [newCoupon, toast]);

  /* delete */
  const handleDelete = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/seller/coupons/${id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      setCoupons(p => p.filter(c => c.id !== id));
      toast("Coupon deleted.");
    } catch { toast("Failed to delete."); }
  }, [toast]);

  /* edit */
  const startEdit = useCallback((c) => {
    setEditingId(c.id);
    setEditingCoupon({
      name: c.name, description: c.description, couponCode: c.couponCode,
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split("T")[0] : "",
    });
  }, []);

  const submitEdit = useCallback(async (e) => {
    e?.preventDefault?.();
    try {
      const payload = { ...editingCoupon, expiryDate: new Date(editingCoupon.expiryDate).toISOString() };
      const res = await fetch(`${API_BASE}/api/seller/coupons/${editingId}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setCoupons(p => p.map(c => c.id === editingId ? json.data : c));
      setEditingId(null);
      toast("✦ Coupon updated!");
    } catch { toast("Failed to update."); }
  }, [editingId, editingCoupon, toast]);

  /* derived stats */
  const acceptedCount = requests.filter(r => r.status === "ACCEPTED").length;
  const pendingCount  = requests.filter(r => r.status !== "ACCEPTED").length;

  /* ── RENDER ── */
  return (
    <>
      <style>{S}</style>
      <div className="sd">

        {/* TOPBAR */}
        <header className="tb">
          <div className="brand">
            <div className="brand__ic">🏷️</div>
            <span className="brand__name">CouponVault</span>
            <span className="brand__tag">Seller</span>
          </div>
          <div className="tb__right">
            <div className="tb__pill">
              <span className="tb__dot"/>
              Seller Portal
            </div>
            <div className="tb__av" title="Profile">SV</div>
          </div>
        </header>

        {/* MAIN */}
        <main className="main">

          {/* Page header */}
          <div className="ph">
            <div className="ph__eyebrow">
              <span className="ph__dot"/>
              Seller Dashboard
            </div>
            <h1 className="ph__h1">Manage <span>Your Store.</span></h1>
            <p className="ph__sub">Handle coupon requests, create offers, and track your inventory — all in one place.</p>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat">
              <div className="stat__ic stat__ic--v">🏷️</div>
              <div className="stat__val">{coupons.length}<span>+</span></div>
              <div className="stat__key">My Coupons</div>
            </div>
            <div className="stat">
              <div className="stat__ic stat__ic--o">📥</div>
              <div className="stat__val">{pendingCount}</div>
              <div className="stat__key">Pending Requests</div>
            </div>
            <div className="stat">
              <div className="stat__ic stat__ic--l">✓</div>
              <div className="stat__val">{acceptedCount}</div>
              <div className="stat__key">Accepted</div>
            </div>
          </div>

          {/* ── COUPON REQUESTS ── */}
          <div className="sec">
            <div className="sec__top-bar"/>
            <div className="sec__head">
              <div className="sec__title">Coupon Requests</div>
              <div className="sec__count">{requests.length} total</div>
            </div>
            <div className="sec__body">
              {loadingRequests
                ? [1,2,3].map(i => <SkeletonRow key={i}/>)
                : requests.length === 0
                ? <EmptyState icon="📭" title="No requests yet" sub="Buyer requests for your coupons will appear here." />
                : requests.map(req => {
                    const id       = req.id ?? req.requestId;
                    const accepted = req.status === "ACCEPTED";
                    return (
                      <div key={id} className={`req ${accepted ? "req--accepted" : ""}`}
                           style={{ animationDelay: `${(id % 6) * 0.06}s` }}>
                        <div className="req__l">
                          <div className="req__ic">{accepted ? "✅" : "📩"}</div>
                          <div>
                            <div className="req__name">{req.couponName ?? `Coupon #${req.couponId}`}</div>
                            <div className="req__buyer">Buyer: <strong>{req.buyerId ?? "—"}</strong></div>
                          </div>
                        </div>
                        {accepted
                          ? <div className="req__status-ok">
                              <span className="req__status-dot"/>
                              Accepted
                            </div>
                          : <button className="accept-btn" onClick={() => handleAccept(req)} disabled={processingId === id}>
                              {processingId === id
                                ? <><span className="spin"/>Processing…</>
                                : <>Accept →</>}
                            </button>
                        }
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* ── CREATE COUPON ── */}
          <div className="sec">
            <div className="sec__top-bar sec__top-bar--lime"/>
            <div className="sec__head">
              <div className="sec__title">Create New Coupon</div>
              {!showCreate && (
                <button className="create-btn" onClick={() => setShowCreate(true)}>
                  <span className="create-btn__plus">+</span>
                  New Coupon
                </button>
              )}
            </div>
            {showCreate && (
              <div className="sec__body">
                <CouponForm
                  value={newCoupon}
                  onChange={setNewCoupon}
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreate(false)}
                  submitLabel="Create Coupon →"
                />
              </div>
            )}
          </div>

          {/* ── MY COUPONS ── */}
          <div className="sec">
            <div className="sec__top-bar sec__top-bar--ink"/>
            <div className="sec__head">
              <div className="sec__title">My Coupons</div>
              <div className="sec__count">{coupons.length} listed</div>
            </div>
            <div className="sec__body">
              {loadingCoupons
                ? [1,2,3].map(i => <SkeletonRow key={i}/>)
                : coupons.length === 0
                ? <EmptyState icon="🎟️" title="No coupons yet" sub="Create your first coupon using the form above." />
                : coupons.map((c, idx) => {
                    const expDate  = c.expiryDate ? new Date(c.expiryDate) : null;
                    const daysLeft = expDate ? Math.ceil((expDate - Date.now()) / 86400000) : null;
                    const soon     = daysLeft !== null && daysLeft <= 5;

                    return (
                      <div key={c.id} className="ci" style={{ animationDelay: `${idx * 0.06}s` }}>
                        <div className="ci__bar"/>
                        {editingId === c.id ? (
                          <div style={{ padding:"16px 18px" }}>
                            <CouponForm
                              value={editingCoupon}
                              onChange={setEditingCoupon}
                              onSubmit={submitEdit}
                              onCancel={() => setEditingId(null)}
                              submitLabel="Save Changes →"
                            />
                          </div>
                        ) : (
                          <div className="ci__row">
                            <div className="ci__l">
                              <div className="ci__name">{c.name}</div>
                              <div className="ci__desc">{c.description}</div>
                              <div className="ci__meta">
                                <span className="ci__code">{c.couponCode}</span>
                                {expDate && (
                                  <span className={`ci__exp ${soon ? "ci__exp--soon" : ""}`}>
                                    {soon ? `⚠ Expires in ${daysLeft}d` : `Valid till ${expDate.toLocaleDateString()}`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ci__actions">
                              <button className="ci__btn ci__btn--edit" onClick={() => startEdit(c)}>Edit</button>
                              <button className="ci__btn ci__btn--del"  onClick={() => handleDelete(c.id)}>Delete</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              }
            </div>
          </div>

        </main>

        {/* Toast */}
        <div className={`toast ${showToast ? "toast--show" : ""}`} aria-live="polite">
          <span className="toast__ic">✓</span>
          {toastMsg}
        </div>

      </div>
    </>
  );
}