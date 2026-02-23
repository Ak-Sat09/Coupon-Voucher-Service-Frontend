import { useState, useEffect, useCallback, useRef } from "react";
import "./styles.css";

const API_BASE = "https://couponservice-latest.onrender.com";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

/* ══════════════════════════════════════════
   COUPON DETAIL MODAL
   Hits GET /api/seller/coupons/{couponId}
══════════════════════════════════════════ */
function CouponDetailModal({ couponId, onClose }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const overlayRef            = useRef(null);

  /* fetch by id */
  useEffect(() => {
    if (!couponId) return;
    setLoading(true);
    setError("");
    setDetail(null);

    fetch(`${API_BASE}/api/seller/coupons/${couponId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // ApiResponse<CouponResponse> → { "data": { ... } }
        setDetail(json.data ?? json);
      })
      .catch(() => setError("Failed to load coupon details."))
      .finally(() => setLoading(false));
  }, [couponId]);

  /* close on overlay click */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const copyCode = () => {
    if (!detail?.couponCode || detail.couponCode === "****") return;
    navigator.clipboard.writeText(detail.couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isExpired  = (d) => d && new Date(d) < new Date();
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };
  const daysLeft = (d) => {
    if (!d) return null;
    return Math.ceil((new Date(d) - new Date()) / 86400000);
  };

  const isOwned = detail?.couponCode && detail.couponCode !== "****";
  const expired = detail ? isExpired(detail.expiryDate) : false;
  const days    = detail ? daysLeft(detail.expiryDate) : null;

  return (
    <div className="dtl-overlay" ref={overlayRef} onClick={handleOverlayClick}
      role="dialog" aria-modal="true" aria-label="Coupon Details">
      <div className="dtl-modal">

        {/* header */}
        <div className="dtl-modal__header">
          <div className="dtl-modal__icon">🏷️</div>
          <div className="dtl-modal__header-text">
            <p className="cv-card__eyebrow" style={{ fontSize: 10 }}>Coupon Detail</p>
            <h2 className="dtl-modal__title">
              {loading ? "Loading…" : (detail?.name ?? "—")}
            </h2>
          </div>
          <button className="dtl-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="dtl-modal__body">

          {/* loading */}
          {loading && (
            <div className="db-state" style={{ padding: "48px 0" }}>
              <span className="db-spinner" />
              <p>Fetching details…</p>
            </div>
          )}

          {/* error */}
          {!loading && error && (
            <div className="cv-alert cv-alert--error">
              <span className="cv-alert__icon">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* content */}
          {!loading && detail && (
            <div className="dtl-content">

              {/* status badges */}
              <div className="dtl-badges">
                {isOwned && <span className="db-badge db-badge--owned">✓ Owned</span>}
                {expired  && <span className="db-badge db-badge--expired">Expired</span>}
                {!expired && days !== null && days <= 7 && (
                  <span className="db-badge db-badge--expiring">
                    {days === 0 ? "Expires Today!" : `${days} days left`}
                  </span>
                )}
                {!expired && !isOwned && (
                  <span className="db-badge db-badge--available">Available</span>
                )}
              </div>

              {/* description */}
              {detail.description && (
                <div className="dtl-row dtl-row--block">
                  <span className="dtl-row__label">Description</span>
                  <p className="dtl-row__desc">{detail.description}</p>
                </div>
              )}

              {/* info grid */}
              <div className="dtl-info-grid">
                <div className="dtl-info-cell">
                  <span className="dtl-info-cell__label">Coupon ID</span>
                  <span className="dtl-info-cell__val">#{detail.id}</span>
                </div>
                <div className="dtl-info-cell">
                  <span className="dtl-info-cell__label">Status</span>
                  <span className="dtl-info-cell__val"
                    style={{ color: expired ? "var(--red)" : "var(--green)" }}>
                    {expired ? "Expired" : "Active"}
                  </span>
                </div>
                <div className="dtl-info-cell" style={{ gridColumn: "1 / -1" }}>
                  <span className="dtl-info-cell__label">Expiry Date</span>
                  <span className="dtl-info-cell__val">{formatDate(detail.expiryDate)}</span>
                </div>
              </div>

              {/* coupon code section */}
              <div className="dtl-code-section">
                <span className="dtl-code-section__label">Coupon Code</span>
                {isOwned ? (
                  <button className="db-code-btn dtl-code-btn" onClick={copyCode}>
                    <span className="db-code-btn__code" style={{ fontSize: 16, letterSpacing: "0.18em" }}>
                      {detail.couponCode}
                    </span>
                    <span className="db-code-btn__action">
                      {copied ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          Copy Code
                        </>
                      )}
                    </span>
                  </button>
                ) : (
                  <div className="db-code-masked" style={{ borderRadius: 10, padding: "14px 18px" }}>
                    <span className="db-code-masked__dots" style={{ fontSize: 20 }}>
                      •••• •••• ••••
                    </span>
                    <span className="db-code-masked__hint">Request to reveal</span>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* footer */}
        <div className="dtl-modal__footer">
          <button className="dtl-close-btn" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
export default function Dashboard() {
  const [coupons, setCoupons]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [copiedId, setCopiedId]         = useState(null);
  const [requestingId, setRequestingId] = useState(null);
  const [requestMsg, setRequestMsg]     = useState({ id: null, text: "", type: "" });
  const [detailCouponId, setDetailCouponId] = useState(null); // ← controls modal
  const timerRef = useRef(null);

  /* ─── FETCH ALL ─────────────────────────── */
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/seller/coupons`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : [];
      setCoupons(list);
    } catch {
      setError("Failed to load coupons. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  /* ─── REQUEST ───────────────────────────── */
  const handleRequest = useCallback(async (couponId) => {
    setRequestingId(couponId);
    try {
      const res = await fetch(`${API_BASE}/api/coupon-requests/${couponId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      const text = res.ok
        ? (typeof json.data === "string" ? json.data : "Request sent to seller!")
        : (json.message ?? "Request failed.");
      setRequestMsg({ id: couponId, text, type: res.ok ? "success" : "error" });
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(
        () => setRequestMsg({ id: null, text: "", type: "" }), 3000
      );
    } catch {
      setRequestMsg({ id: couponId, text: "Connection error.", type: "error" });
    } finally {
      setRequestingId(null);
    }
  }, []);

  /* ─── COPY ──────────────────────────────── */
  const copyCode = useCallback((id, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  /* ─── SEARCH ────────────────────────────── */
  const visible = coupons.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  /* ─── HELPERS ───────────────────────────── */
  const isExpired  = (d) => d && new Date(d) < new Date();
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };
  const daysLeft = (d) => {
    if (!d) return null;
    return Math.ceil((new Date(d) - new Date()) / 86400000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  /* ═══════════════════════ RENDER ════════════════════════════ */
  return (
    <div className="db-page">
      <div className="cv-bg-grid"  aria-hidden="true" />
      <div className="cv-bg-blob1" aria-hidden="true" />
      <div className="cv-bg-blob2" aria-hidden="true" />

      {/* modal */}
      {detailCouponId && (
        <CouponDetailModal
          couponId={detailCouponId}
          onClose={() => setDetailCouponId(null)}
        />
      )}

      {/* ── NAVBAR ── */}
      <header className="db-nav">
        <div className="db-nav__brand">
          <div className="cv-logo" style={{ width: 36, height: 36 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <span className="cv-brand-name" style={{ fontSize: 16 }}>CouponVault</span>
        </div>

        <div className="db-nav__pill db-nav__pill--gold">
          <span className="db-nav__pill-val">{coupons.length}</span>
          <span className="db-nav__pill-lbl">Total Coupons</span>
        </div>

        <button className="db-logout" onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </header>

      {/* ── MAIN ── */}
      <main className="db-main">

        {/* hero strip */}
        <section className="db-hero-strip">
          <div className="db-hero-strip__text">
            <p className="cv-card__eyebrow" style={{ marginBottom: 6 }}>Buyer Dashboard</p>
            <h1 className="db-hero-strip__title">
              Browse &amp; <em>Claim</em> Deals
            </h1>
            <p className="db-hero-strip__sub">
              {coupons.length > 0
                ? `${coupons.length} coupons available. Click Detail to learn more.`
                : "Find a deal you like and request it from the seller."}
            </p>
          </div>
        </section>

        {/* search */}
        <div className="db-controls">
          <div className="db-search-wrap">
            <svg className="db-search-ico" width="15" height="15"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="db-search"
              type="text"
              placeholder="Search coupons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── STATES ── */}
        {loading && (
          <div className="db-state">
            <span className="db-spinner" />
            <p>Loading your deals…</p>
          </div>
        )}

        {!loading && error && (
          <div className="cv-alert cv-alert--error"
            style={{ maxWidth: 480, margin: "0 auto" }}>
            <span className="cv-alert__icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="db-state">
            <span style={{ fontSize: 40 }}>🏷️</span>
            <p>No coupons found.</p>
          </div>
        )}

        {/* ── COUPON GRID ── */}
        {!loading && !error && visible.length > 0 && (
          <div className="db-grid">
            {visible.map((coupon, idx) => {
              const isOwned  = coupon.couponCode && coupon.couponCode !== "****";
              const expired  = isExpired(coupon.expiryDate);
              const days     = daysLeft(coupon.expiryDate);
              const expiring = days !== null && days >= 0 && days <= 7;
              const isCopied = copiedId === coupon.id;
              const isReq    = requestingId === coupon.id;
              const msg      = requestMsg.id === coupon.id ? requestMsg : null;
              console.log(expiring);

              return (
                <article
                  key={coupon.id}
                  className={[
                    "db-card",
                    isOwned ? "db-card--owned"   : "",
                    expired ? "db-card--expired" : "",
                  ].join(" ").trim()}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* top */}
                  <div className="db-card__top">
                    <div className="db-card__icon-wrap">
                      <span>🏷️</span>
                    </div>
                    {isOwned && (
                      <span className="db-badge db-badge--owned">Owned</span>
                    )}
                  </div>

                  {/* body */}
                  <div className="db-card__body">
                    <h3 className="db-card__name">{coupon.name}</h3>
                    {coupon.description && (
                      <p className="db-card__desc">{coupon.description}</p>
                    )}
                  </div>

                  {/* code */}
                  <div className="db-card__code-row">
                    {isOwned ? (
                      <button
                        className="db-code-btn"
                        onClick={() => copyCode(coupon.id, coupon.couponCode)}
                        title="Click to copy"
                      >
                        <span className="db-code-btn__code">{coupon.couponCode}</span>
                        <span className="db-code-btn__action">
                          {isCopied ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                              Copy
                            </>
                          )}
                        </span>
                      </button>
                    ) : (
                      <div className="db-code-masked">
                        <span className="db-code-masked__dots">•••• •••• ••••</span>
                        <span className="db-code-masked__hint">Request to reveal</span>
                      </div>
                    )}
                  </div>

                  {/* footer — expiry + Detail + Request buttons */}
                  <div className="db-card__footer">
                    <span className="db-expiry">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Expires {formatDate(coupon.expiryDate)}
                    </span>

                    <div className="db-card__actions">
                      {/* ── DETAIL BUTTON ── */}
                      <button
                        className="db-detail-btn"
                        onClick={() => setDetailCouponId(coupon.id)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Detail
                      </button>

                      {/* ── REQUEST BUTTON ── */}
                      {!isOwned && !expired && (
                        <button
                          className={`db-req-btn${isReq ? " db-req-btn--loading" : ""}`}
                          onClick={() => handleRequest(coupon.id)}
                          disabled={isReq}
                          aria-busy={isReq}
                        >
                          {isReq ? (
                            <>
                              <span className="cv-spinner"
                                style={{ width: 13, height: 13, borderWidth: 2 }} />
                              Requesting…
                            </>
                          ) : (
                            <>Request →</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* inline feedback */}
                  {msg && (
                    <div className={`db-card__msg db-card__msg--${msg.type}`}>
                      {msg.text}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
