import { useState, useEffect, useCallback, useRef } from "react";
import "./SellerDashboard.css";

const API_BASE = "https://couponservice-latest.onrender.com";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonHeaders = () => ({ ...authHeader(), "Content-Type": "application/json" });

/* ══════════════════════════════════════════════════════════
   CONFIRM MODAL  — used for delete confirmation
══════════════════════════════════════════════════════════ */
function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  return (
    <div className="dtl-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="sl-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="sl-confirm__icon">🗑️</div>
        <h3 className="sl-confirm__title">Are you sure?</h3>
        <p className="sl-confirm__msg">{message}</p>
        <div className="sl-confirm__actions">
          <button className="dtl-close-btn" onClick={onCancel}>Cancel</button>
          <button className="sl-confirm__del" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COUPON FORM MODAL  — create & edit
   Fields: name, description, couponCode, expiryDate
══════════════════════════════════════════════════════════ */
function CouponFormModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [form, setForm]       = useState({
    name:        initial?.name        ?? "",
    description: initial?.description ?? "",
    couponCode:  initial?.couponCode  ?? "",
    expiryDate:  initial?.expiryDate
      ? initial.expiryDate.slice(0, 16)   // trim to "YYYY-MM-DDTHH:mm"
      : "",
  });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiErr, setApiErr]   = useState("");

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Name is required";
    if (!form.couponCode.trim())  e.couponCode  = "Coupon code is required";
    if (!form.expiryDate)         e.expiryDate  = "Expiry date is required";
    else if (new Date(form.expiryDate) < new Date()) e.expiryDate = "Date must be in future";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
    setApiErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiErr("");
    try {
      // Backend expects LocalDateTime → "2025-12-31T23:59:00"
      const payload = {
        ...form,
        expiryDate: form.expiryDate + ":00",   // add seconds
      };

      const url = isEdit
        ? `${API_BASE}/api/seller/coupons/${initial.id}`
        : `${API_BASE}/api/seller/coupons`;

      const res = await fetch(url, {
        method:  isEdit ? "PUT" : "POST",
        headers: jsonHeaders(),
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      onSave(json.data ?? json);
    } catch (err) {
      setApiErr(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dtl-overlay" role="dialog" aria-modal="true">
      <div className="dtl-modal sl-form-modal">

        {/* header */}
        <div className="dtl-modal__header">
          <div className="dtl-modal__icon">{isEdit ? "✏️" : "➕"}</div>
          <div className="dtl-modal__header-text">
            <p className="cv-card__eyebrow" style={{ fontSize: 10 }}>
              {isEdit ? "Edit Coupon" : "New Coupon"}
            </p>
            <h2 className="dtl-modal__title">
              {isEdit ? `Edit: ${initial.name}` : "Create Coupon"}
            </h2>
          </div>
          <button className="dtl-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="dtl-modal__body">
            {apiErr && (
              <div className="cv-alert cv-alert--error" style={{ marginBottom: 16 }}>
                <span className="cv-alert__icon">!</span>
                <span>{apiErr}</span>
              </div>
            )}

            <div className="sl-form-grid">
              {/* Name */}
              <div className="cv-field sl-full-col">
                <label className="cv-label">Coupon Name</label>
                <div className="cv-input-wrap">
                  <span className="cv-input-ico">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </span>
                  <input name="name" type="text" placeholder="e.g. Summer Sale 20%"
                    value={form.name} onChange={handleChange} disabled={saving}
                    className={`cv-input${errors.name ? " cv-input--err" : ""}`} />
                </div>
                {errors.name && <span className="cv-error">{errors.name}</span>}
              </div>

              {/* Coupon Code */}
              <div className="cv-field sl-full-col">
                <label className="cv-label">Coupon Code</label>
                <div className="cv-input-wrap">
                  <span className="cv-input-ico">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </span>
                  <input name="couponCode" type="text" placeholder="e.g. SUMMER20"
                    value={form.couponCode} onChange={handleChange} disabled={saving}
                    className={`cv-input${errors.couponCode ? " cv-input--err" : ""}`}
                    style={{ textTransform: "uppercase", letterSpacing: "0.1em" }} />
                </div>
                {errors.couponCode && <span className="cv-error">{errors.couponCode}</span>}
              </div>

              {/* Expiry Date */}
              <div className="cv-field sl-full-col">
                <label className="cv-label">Expiry Date &amp; Time</label>
                <div className="cv-input-wrap">
                  <span className="cv-input-ico">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                  <input name="expiryDate" type="datetime-local"
                    value={form.expiryDate} onChange={handleChange} disabled={saving}
                    className={`cv-input${errors.expiryDate ? " cv-input--err" : ""}`} />
                </div>
                {errors.expiryDate && <span className="cv-error">{errors.expiryDate}</span>}
              </div>

              {/* Description */}
              <div className="cv-field sl-full-col">
                <label className="cv-label">Description <span style={{ color: "var(--slate)", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                <textarea name="description" rows={3}
                  placeholder="Describe what this coupon is for…"
                  value={form.description} onChange={handleChange} disabled={saving}
                  className="sl-textarea" />
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="dtl-modal__footer" style={{ gap: 10 }}>
            <button type="button" className="dtl-close-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className={`cv-btn sl-save-btn${saving ? " cv-btn--loading" : ""}`}
              style={{ margin: 0, width: "auto", padding: "10px 24px" }}>
              {saving
                ? <><span className="cv-spinner" />{isEdit ? "Saving…" : "Creating…"}</>
                : <>{isEdit ? "Save Changes" : "Create Coupon"} <span className="cv-btn__arrow">→</span></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SELLER DASHBOARD
══════════════════════════════════════════════════════════ */
export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("requests"); // requests | coupons

  // ── Coupon Requests state ──
  const [requests, setRequests]       = useState([]);
  const [reqLoading, setReqLoading]   = useState(true);
  const [reqError, setReqError]       = useState("");
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptMsg, setAcceptMsg]     = useState({ id: null, text: "", type: "" });

  // ── Coupons state ──
  const [coupons, setCoupons]         = useState([]);
  const [cpnLoading, setCpnLoading]   = useState(true);
  const [cpnError, setCpnError]       = useState("");

  // ── Modals ──
  const [formModal, setFormModal]     = useState(null);   // null | { coupon? }
  const [deleteTarget, setDeleteTarget] = useState(null); // null | coupon object
  const [deletingId, setDeletingId]   = useState(null);

  const acceptTimer = useRef(null);

  /* ─── FETCH REQUESTS ──────────────────────────────────── */
  const fetchRequests = useCallback(async () => {
    setReqLoading(true);
    setReqError("");
    try {
      const res = await fetch(`${API_BASE}/api/coupon-requests/seller`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // ApiResponse<List<CouponAssignmentResponseDTO>> → { data: [...] }
      const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      setRequests(list);
    } catch {
      setReqError("Failed to load requests.");
    } finally {
      setReqLoading(false);
    }
  }, []);

  /* ─── FETCH COUPONS ───────────────────────────────────── */
  const fetchCoupons = useCallback(async () => {
    setCpnLoading(true);
    setCpnError("");
    try {
      // showCode=true so seller can see actual codes
      const res = await fetch(`${API_BASE}/api/seller/coupons?showCode=true`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      setCoupons(list);
    } catch {
      setCpnError("Failed to load coupons.");
    } finally {
      setCpnLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); fetchCoupons(); }, [fetchRequests, fetchCoupons]);
  useEffect(() => () => clearTimeout(acceptTimer.current), []);

  /* ─── ACCEPT REQUEST ──────────────────────────────────── */
  const handleAccept = useCallback(async (requestId) => {
    setAcceptingId(requestId);
    try {
      const res = await fetch(
        `${API_BASE}/api/coupon-requests/seller/accept/${requestId}`,
        { method: "POST", headers: authHeader() }
      );
      const json = await res.json().catch(() => ({}));
      const text = res.ok
        ? (typeof json.data === "string" ? json.data : "Coupon assigned successfully!")
        : (json.message ?? "Approval failed.");
      setAcceptMsg({ id: requestId, text, type: res.ok ? "success" : "error" });
      if (res.ok) {
        // remove from list optimistically
        setRequests(prev => prev.filter(r => r.requestId !== requestId));
      }
      clearTimeout(acceptTimer.current);
      acceptTimer.current = setTimeout(
        () => setAcceptMsg({ id: null, text: "", type: "" }), 3000
      );
    } catch {
      setAcceptMsg({ id: requestId, text: "Connection error.", type: "error" });
    } finally {
      setAcceptingId(null);
    }
  }, []);

  /* ─── DELETE COUPON ───────────────────────────────────── */
  const handleDelete = useCallback(async (coupon) => {
    setDeleteTarget(null);
    setDeletingId(coupon.id);
    try {
      const res = await fetch(`${API_BASE}/api/seller/coupons/${coupon.id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      // DELETE returns 204 No Content
      if (res.status === 204 || res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== coupon.id));
      } else {
        const j = await res.json().catch(() => ({}));
        alert(j.message ?? "Delete failed.");
      }
    } catch {
      alert("Connection error.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  /* ─── AFTER SAVE (create/edit) ────────────────────────── */
  const handleSave = useCallback((saved) => {
    setCoupons(prev => {
      const exists = prev.find(c => c.id === saved.id);
      return exists
        ? prev.map(c => c.id === saved.id ? saved : c)  // update
        : [saved, ...prev];                               // prepend new
    });
    setFormModal(null);
  }, []);

  /* ─── HELPERS ─────────────────────────────────────────── */
  const isExpired  = (d) => d && new Date(d) < new Date();
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  /* ═══════════════════════ RENDER ════════════════════════ */
  return (
    <div className="db-page">
      <div className="cv-bg-grid"  aria-hidden="true" />
      <div className="cv-bg-blob1" aria-hidden="true" />
      <div className="cv-bg-blob2" aria-hidden="true" />

      {/* ── Modals ── */}
      {formModal && (
        <CouponFormModal
          initial={formModal.coupon ?? null}
          onSave={handleSave}
          onClose={() => setFormModal(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── NAVBAR ── */}
      <header className="db-nav">
        <div className="db-nav__brand">
          <div className="cv-logo" style={{ width: 36, height: 36 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <span className="cv-brand-name" style={{ fontSize: 16 }}>CouponVault</span>
          <span className="sl-role-badge">Seller</span>
        </div>

        <div className="db-nav__stats">
          <div className="db-nav__pill">
            <span className="db-nav__pill-val">{coupons.length}</span>
            <span className="db-nav__pill-lbl">Coupons</span>
          </div>
          <div className="db-nav__pill db-nav__pill--gold">
            <span className="db-nav__pill-val">{requests.length}</span>
            <span className="db-nav__pill-lbl">Pending</span>
          </div>
        </div>

        <button className="db-logout" onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </header>

      {/* ── MAIN ── */}
      <main className="db-main">

        {/* hero */}
        <section className="db-hero-strip">
          <div className="db-hero-strip__text">
            <p className="cv-card__eyebrow" style={{ marginBottom: 6 }}>Seller Portal</p>
            <h1 className="db-hero-strip__title">
              Manage Your <em>Coupons</em>
            </h1>
            <p className="db-hero-strip__sub">
              {requests.length > 0
                ? `You have ${requests.length} pending request${requests.length !== 1 ? "s" : ""} waiting for approval.`
                : "Create coupons and approve buyer requests from here."}
            </p>
          </div>
          {/* quick create button in hero */}
          <button
            className="cv-btn sl-hero-create"
            onClick={() => setFormModal({ coupon: null })}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Coupon
          </button>
        </section>

        {/* ── TABS ── */}
        <div className="sl-tabs">
          <button
            className={`sl-tab${activeTab === "requests" ? " sl-tab--active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            Buyer Requests
            {requests.length > 0 && (
              <span className="sl-tab__badge">{requests.length}</span>
            )}
          </button>
          <button
            className={`sl-tab${activeTab === "coupons" ? " sl-tab--active" : ""}`}
            onClick={() => setActiveTab("coupons")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            My Coupons
            <span className="sl-tab__count">{coupons.length}</span>
          </button>
        </div>

        {/* ══════════════════════════════════
            TAB: BUYER REQUESTS
        ══════════════════════════════════ */}
        {activeTab === "requests" && (
          <div className="sl-section">
            {reqLoading && (
              <div className="db-state">
                <span className="db-spinner" />
                <p>Loading requests…</p>
              </div>
            )}
            {!reqLoading && reqError && (
              <div className="cv-alert cv-alert--error" style={{ maxWidth: 480 }}>
                <span className="cv-alert__icon">!</span><span>{reqError}</span>
              </div>
            )}
            {!reqLoading && !reqError && requests.length === 0 && (
              <div className="db-state">
                <span style={{ fontSize: 40 }}>📭</span>
                <p>No pending requests.</p>
              </div>
            )}
            {!reqLoading && !reqError && requests.length > 0 && (
              <div className="sl-req-list">
                {requests.map((req) => {
                  const isAccepting = acceptingId === req.requestId;
                  const msg = acceptMsg.id === req.requestId ? acceptMsg : null;
                  return (
                    <div key={req.requestId} className="sl-req-card">
                      <div className="sl-req-card__left">
                        <div className="sl-req-card__icon">📩</div>
                        <div className="sl-req-card__info">
                          <p className="sl-req-card__title">
                            Request <span className="sl-req-card__id">#{req.requestId}</span>
                          </p>
                          <div className="sl-req-card__meta">
                            <span>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                              </svg>
                              Coupon ID: <strong>#{req.couponId}</strong>
                            </span>
                            <span>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                              Buyer ID: <strong>#{req.buyerId}</strong>
                            </span>
                            {req.createdAt && (
                              <span>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {formatDate(req.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sl-req-card__right">
                        {msg && (
                          <span className={`sl-inline-msg sl-inline-msg--${msg.type}`}>
                            {msg.text}
                          </span>
                        )}
                        <button
                          className={`sl-approve-btn${isAccepting ? " sl-approve-btn--loading" : ""}`}
                          onClick={() => handleAccept(req.requestId)}
                          disabled={isAccepting}
                        >
                          {isAccepting ? (
                            <><span className="cv-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />Approving…</>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Approve
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            TAB: MY COUPONS
        ══════════════════════════════════ */}
        {activeTab === "coupons" && (
          <div className="sl-section">
            {/* top bar */}
            <div className="sl-coupons-topbar">
              <p className="sl-coupons-topbar__count">
                {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
              </p>
              <button
                className="cv-btn sl-create-btn"
                onClick={() => setFormModal({ coupon: null })}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Coupon
              </button>
            </div>

            {cpnLoading && (
              <div className="db-state">
                <span className="db-spinner" />
                <p>Loading coupons…</p>
              </div>
            )}
            {!cpnLoading && cpnError && (
              <div className="cv-alert cv-alert--error" style={{ maxWidth: 480 }}>
                <span className="cv-alert__icon">!</span><span>{cpnError}</span>
              </div>
            )}
            {!cpnLoading && !cpnError && coupons.length === 0 && (
              <div className="db-state">
                <span style={{ fontSize: 40 }}>🏷️</span>
                <p>No coupons yet. Create your first one!</p>
              </div>
            )}

            {!cpnLoading && !cpnError && coupons.length > 0 && (
              <div className="sl-coupon-table">
                {/* table header */}
                <div className="sl-coupon-table__head">
                  <span>Coupon</span>
                  <span>Code</span>
                  <span>Expires</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {/* rows */}
                {coupons.map((coupon, idx) => {
                  const expired   = isExpired(coupon.expiryDate);
                  const isDeleting = deletingId === coupon.id;
                  return (
                    <div
                      key={coupon.id}
                      className={`sl-coupon-row${expired ? " sl-coupon-row--expired" : ""}`}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      {/* name + description */}
                      <div className="sl-coupon-row__name">
                        <span className="sl-coupon-row__title">{coupon.name}</span>
                        {coupon.description && (
                          <span className="sl-coupon-row__desc">{coupon.description}</span>
                        )}
                      </div>

                      {/* code */}
                      <div className="sl-coupon-row__code">
                        <span className="sl-code-chip">{coupon.couponCode}</span>
                      </div>

                      {/* expiry */}
                      <div className="sl-coupon-row__expiry">
                        {formatDate(coupon.expiryDate)}
                      </div>

                      {/* status */}
                      <div className="sl-coupon-row__status">
                        <span className={`db-badge ${expired ? "db-badge--expired" : "db-badge--available"}`}>
                          {expired ? "Expired" : "Active"}
                        </span>
                      </div>

                      {/* actions */}
                      <div className="sl-coupon-row__actions">
                        {/* Edit */}
                        <button
                          className="sl-action-btn sl-action-btn--edit"
                          onClick={() => setFormModal({ coupon })}
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          className="sl-action-btn sl-action-btn--delete"
                          onClick={() => setDeleteTarget(coupon)}
                          disabled={isDeleting}
                          title="Delete"
                        >
                          {isDeleting ? (
                            <span className="cv-spinner"
                              style={{ width: 12, height: 12, borderWidth: 2,
                                borderTopColor: "var(--red)", borderColor: "rgba(224,82,82,0.2)" }} />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
