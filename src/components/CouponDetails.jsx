import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCouponDetail, requestCoupon } from "./CouponService";

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
  --green:    #16a34a;
  --amber:    #d97706;
  --amber-g:  rgba(217,119,6,0.08);
  --shadow:   0 1px 3px rgba(0,0,0,0.08),0 8px 32px rgba(0,0,0,0.06);
  --shadow2:  0 2px 8px rgba(0,0,0,0.06),0 24px 64px rgba(0,0,0,0.08);
  --fd: 'Cabinet Grotesk', sans-serif;
  --fb: 'Bricolage Grotesque', sans-serif;
}
html,body{min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--fb);-webkit-font-smoothing:antialiased}

/* dot pattern */
.pg{
  min-height:100vh;position:relative;
  display:flex;flex-direction:column;
}
.pg::before{
  content:'';position:fixed;inset:0;
  background-image:radial-gradient(circle,rgba(15,14,11,0.055) 1px,transparent 1px);
  background-size:28px 28px;pointer-events:none;z-index:0;
}

/* ── NAV ── */
.nav{
  position:relative;z-index:10;
  background:var(--white);
  border-bottom:1px solid var(--border);
  padding:0 40px;
  display:flex;align-items:center;justify-content:space-between;
  height:64px;
}
.nav::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--violet2) 0%,var(--violet3) 40%,var(--lime-lt) 100%);
}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.brand__ic{
  width:38px;height:38px;border-radius:10px;
  background:var(--ink);
  display:flex;align-items:center;justify-content:center;font-size:16px;
  box-shadow:0 4px 12px rgba(15,14,11,0.2);flex-shrink:0;
}
.brand__name{font-family:var(--fd);font-size:17px;font-weight:900;letter-spacing:-0.025em;color:var(--ink)}
.brand__tag{
  font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
  background:var(--lime-g);border:1px solid rgba(101,163,13,0.25);
  color:var(--lime);padding:3px 8px;border-radius:100px;
}
.nav__back{
  display:flex;align-items:center;gap:8px;
  font-size:13px;font-weight:600;color:var(--muted);
  background:none;border:none;cursor:pointer;
  padding:8px 14px;border-radius:10px;
  border:1.5px solid var(--border2);
  font-family:var(--fb);
  transition:color 150ms,border-color 150ms,background 150ms;
}
.nav__back:hover{color:var(--ink);border-color:var(--violet3);background:var(--violet-g)}

/* ── MAIN ── */
.main{
  position:relative;z-index:1;
  flex:1;
  max-width:900px;width:100%;
  margin:0 auto;
  padding:48px 24px 80px;
}

/* ── SKELETON ── */
.skel{animation:skPulse 1.5s ease infinite}
@keyframes skPulse{0%,100%{opacity:1}50%{opacity:0.45}}
.skel-block{background:var(--bg3);border-radius:10px}

/* ── BREADCRUMB ── */
.crumb{
  display:flex;align-items:center;gap:8px;
  font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;
  color:var(--muted2);margin-bottom:28px;
  animation:fUp .35s ease both;
}
.crumb a{color:var(--muted2);text-decoration:none;transition:color 150ms}
.crumb a:hover{color:var(--violet2)}
.crumb__sep{opacity:0.4}
.crumb__cur{color:var(--ink3)}

/* ── HERO CARD ── */
.hero-card{
  background:var(--white);
  border:1px solid var(--border);
  border-radius:20px;
  overflow:hidden;
  box-shadow:var(--shadow2);
  margin-bottom:24px;
  animation:fUp .4s cubic-bezier(0.16,1,0.3,1) .05s both;
}
/* top gradient bar */
.hero-card__bar{
  height:4px;
  background:linear-gradient(90deg,var(--violet2) 0%,var(--violet3) 40%,var(--lime-lt) 100%);
}
.hero-card__body{padding:36px 40px 40px}
@media(max-width:600px){.hero-card__body{padding:24px 20px 28px}}

/* eyebrow row */
.eyerow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.badge{
  display:inline-flex;align-items:center;gap:6px;
  font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;
  padding:5px 12px;border-radius:100px;border:1px solid;
}
.badge--violet{background:var(--violet-g);border-color:rgba(124,58,237,0.2);color:var(--violet2)}
.badge--lime{background:var(--lime-g);border-color:rgba(101,163,13,0.25);color:var(--lime)}
.badge--amber{background:var(--amber-g);border-color:rgba(217,119,6,0.2);color:var(--amber)}
.badge__dot{width:5px;height:5px;border-radius:50%;background:currentColor;animation:pulse 2s ease infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(1.6)}}

.hero-card__title{
  font-family:var(--fd);
  font-size:clamp(28px,4vw,44px);
  font-weight:900;line-height:1.05;letter-spacing:-0.035em;
  color:var(--ink);margin-bottom:14px;
}
.hero-card__desc{
  font-size:15px;line-height:1.75;color:var(--muted);font-weight:300;
  max-width:580px;margin-bottom:32px;
}

/* code block */
.code-section{margin-bottom:32px}
.code-label{
  font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--muted2);margin-bottom:10px;display:flex;align-items:center;gap:8px;
}
.code-label::before{content:'';width:20px;height:2px;background:var(--violet2);border-radius:1px}

.code-box{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  background:var(--ink);
  border-radius:14px;
  padding:20px 24px;
  border:1.5px solid rgba(255,255,255,0.06);
  box-shadow:0 8px 32px rgba(15,14,11,0.18);
}
.code-val{
  font-family:var(--fd);font-size:22px;font-weight:900;letter-spacing:0.12em;
  color:var(--bg);
  background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.7) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.copy-btn{
  display:flex;align-items:center;gap:7px;
  font-family:var(--fb);font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
  padding:9px 18px;border-radius:9px;border:none;cursor:pointer;
  background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.85);
  border:1px solid rgba(255,255,255,0.12);
  transition:background 150ms,color 150ms,transform 150ms;flex-shrink:0;
}
.copy-btn:hover{background:rgba(255,255,255,0.18);color:#fff;transform:translateY(-1px)}
.copy-btn--done{background:rgba(101,163,13,0.2);color:var(--lime-lt);border-color:rgba(101,163,13,0.3)}

/* meta grid */
.meta-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px;
}
@media(max-width:560px){.meta-grid{grid-template-columns:1fr 1fr}}
.meta-card{
  background:var(--bg);border:1px solid var(--border);
  border-radius:14px;padding:16px;
  transition:border-color 200ms,transform 200ms,box-shadow 200ms;
}
.meta-card:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:var(--shadow)}
.meta-card__ico{font-size:18px;margin-bottom:8px}
.meta-card__val{font-family:var(--fd);font-size:18px;font-weight:900;letter-spacing:-0.02em;color:var(--ink);line-height:1;margin-bottom:4px}
.meta-card__val .ac{color:var(--violet2)}
.meta-card__key{font-size:10px;font-weight:600;color:var(--muted2);letter-spacing:0.08em;text-transform:uppercase}

/* CTA */
.cta-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.req-btn{
  display:flex;align-items:center;gap:10px;
  padding:16px 32px;
  font-family:var(--fd);font-size:15px;font-weight:800;letter-spacing:0.01em;
  background:var(--ink);color:var(--bg);
  border:none;border-radius:12px;cursor:pointer;position:relative;overflow:hidden;
  transition:transform 300ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms,background 200ms;
}
.req-btn::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 55%);
  opacity:0;transition:opacity 200ms;
}
.req-btn:hover:not(:disabled){
  background:var(--ink2);transform:translateY(-2px);
  box-shadow:0 12px 40px rgba(15,14,11,0.25);
}
.req-btn:hover::before{opacity:1}
.req-btn:active:not(:disabled){transform:translateY(0);box-shadow:none}
.req-btn:disabled{opacity:0.45;cursor:not-allowed}
.req-btn--done{background:var(--green)!important;transform:none!important}
.arr{font-size:18px;transition:transform 220ms cubic-bezier(0.34,1.56,0.64,1)}
.req-btn:hover:not(:disabled) .arr{transform:translateX(5px)}
.spin{
  width:16px;height:16px;border-radius:50%;
  border:2.5px solid rgba(245,244,240,0.25);border-top-color:var(--bg);
  animation:sp .6s linear infinite;flex-shrink:0;
}
@keyframes sp{to{transform:rotate(360deg)}}

.share-btn{
  display:flex;align-items:center;gap:8px;
  padding:14px 22px;font-family:var(--fb);font-size:13px;font-weight:600;
  background:var(--white);color:var(--ink3);
  border:1.5px solid var(--border2);border-radius:12px;cursor:pointer;
  transition:border-color 150ms,background 150ms,transform 150ms,box-shadow 150ms;
}
.share-btn:hover{border-color:var(--violet3);background:var(--violet-g);transform:translateY(-1px);box-shadow:var(--shadow)}

/* ── ALERT ── */
.al{
  display:flex;align-items:flex-start;gap:10px;
  padding:14px 18px;border-radius:14px;
  font-size:13px;line-height:1.55;font-weight:500;
  border:1px solid;margin-bottom:24px;
  animation:aIn .2s ease both;
}
@keyframes aIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.al--success{background:rgba(22,163,74,0.05);border-color:rgba(22,163,74,0.2);color:var(--green)}
.al--error{background:rgba(220,38,38,0.05);border-color:rgba(220,38,38,0.2);color:var(--red)}
.al__ico{font-weight:900;font-size:14px;flex-shrink:0;margin-top:1px}

/* ── TERMS CARD ── */
.terms-card{
  background:var(--white);border:1px solid var(--border);
  border-radius:16px;padding:24px 28px;
  box-shadow:var(--shadow);
  animation:fUp .4s cubic-bezier(0.16,1,0.3,1) .15s both;
}
.terms-card__head{
  font-family:var(--fd);font-size:14px;font-weight:800;letter-spacing:-0.01em;
  color:var(--ink);margin-bottom:16px;
  display:flex;align-items:center;gap:8px;
}
.terms-card__head::before{content:'';width:3px;height:16px;background:var(--violet2);border-radius:2px}
.terms-list{list-style:none;display:flex;flex-direction:column;gap:10px}
.terms-list li{
  display:flex;align-items:flex-start;gap:10px;
  font-size:13px;color:var(--muted);line-height:1.6;
}
.terms-list li::before{
  content:'·';font-size:18px;color:var(--violet3);line-height:1.2;flex-shrink:0;margin-top:1px;
}

/* ── LOADING STATE ── */
.loading-wrap{
  position:relative;z-index:1;
  max-width:900px;width:100%;margin:0 auto;padding:48px 24px;
}
.loading-card{
  background:var(--white);border:1px solid var(--border);
  border-radius:20px;padding:36px 40px;
  box-shadow:var(--shadow2);
}
@media(max-width:600px){.loading-card{padding:24px 20px}}

/* ── ANIMATIONS ── */
@keyframes fUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
`;

export default function CouponDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [detail, setDetail]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [done, setDone]           = useState(false);
  const [alert, setAlert]         = useState({ text: "", type: "" });
  const [copied, setCopied]       = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => {
    getCouponDetail(id)
      .then(setDetail)
      .catch(() => setAlert({ text: "Failed to load coupon details.", type: "error" }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = useCallback(() => {
    if (!detail?.couponCode) return;
    navigator.clipboard.writeText(detail.couponCode).catch(() => {});
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [detail]);

  const handleRequest = useCallback(async () => {
    if (requesting || done) return;
    setRequesting(true);
    setAlert({ text: "", type: "" });
    try {
      await requestCoupon(id);
      setDone(true);
      setAlert({ text: "🎉 Coupon successfully claimed! Check your account for details.", type: "success" });
    } catch {
      setAlert({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setRequesting(false);
    }
  }, [id, requesting, done]);

  /* ── SKELETON LOADER ── */
  if (loading) return (
    <>
      <style>{S}</style>
      <div className="pg">
        <nav className="nav">
          <div className="brand">
            <div className="brand__ic">🏷️</div>
            <span className="brand__name">CouponVault</span>
            <span className="brand__tag">Live</span>
          </div>
        </nav>
        <div className="loading-wrap">
          <div className="loading-card skel">
            <div style={{height:4,background:"var(--bg3)",borderRadius:2,marginBottom:28}}/>
            <div className="skel-block" style={{height:12,width:120,marginBottom:20}}/>
            <div className="skel-block" style={{height:40,width:"70%",marginBottom:12}}/>
            <div className="skel-block" style={{height:16,width:"85%",marginBottom:8}}/>
            <div className="skel-block" style={{height:16,width:"60%",marginBottom:32}}/>
            <div className="skel-block" style={{height:64,borderRadius:14,marginBottom:28}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:28}}>
              {[0,1,2].map(i=><div key={i} className="skel-block" style={{height:76,borderRadius:14}}/>)}
            </div>
            <div className="skel-block" style={{height:52,width:200,borderRadius:12}}/>
          </div>
        </div>
      </div>
    </>
  );

  /* ── ERROR STATE ── */
  if (!detail) return (
    <>
      <style>{S}</style>
      <div className="pg">
        <nav className="nav">
          <div className="brand">
            <div className="brand__ic">🏷️</div>
            <span className="brand__name">CouponVault</span>
            <span className="brand__tag">Live</span>
          </div>
        </nav>
        <div className="loading-wrap" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔍</div>
          <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:900,letterSpacing:"-0.03em",color:"var(--ink)",marginBottom:8}}>Coupon Not Found</div>
          <p style={{color:"var(--muted)",marginBottom:24,fontSize:14}}>This coupon may have expired or been removed.</p>
          <button className="req-btn" onClick={() => navigate("/coupons")}>← Back to Coupons</button>
        </div>
      </div>
    </>
  ); 

  return (
    <>
      <style>{S}</style>
      <div className="pg">

        {/* NAV */}
        <nav className="nav">
          <a className="brand" href="/coupons" onClick={e=>{e.preventDefault();navigate("/coupons")}}>
            <div className="brand__ic">🏷️</div>
            <span className="brand__name">CouponVault</span>
            <span className="brand__tag">Live</span>
          </a>
          <button className="nav__back" onClick={() => navigate("/coupons")}>
            ← Back to Deals
          </button>
        </nav>

        {/* MAIN */}
        <main className="main">

          {/* Breadcrumb */}
          <div className="crumb">
            <a href="/coupons" onClick={e=>{e.preventDefault();navigate("/coupons")}}>Coupons</a>
            <span className="crumb__sep">›</span>
            <span className="crumb__cur">{detail.name}</span>
          </div>

          {/* Alert */}
          {alert.text && (
            <div className={`al al--${alert.type}`} role="alert" aria-live="assertive">
              <span className="al__ico">{alert.type === "success" ? "✓" : "✕"}</span>
              <span>{alert.text}</span>
            </div>
          )}

          {/* Hero Card */}
          <div className="hero-card">
            <div className="hero-card__bar"/>
            <div className="hero-card__body">
 

              {/* Title */}
              <h1 className="hero-card__title">{detail.name}</h1>

              {/* Description */}
              <p className="hero-card__desc">{detail.description}</p>

              {/* Coupon Code */}
              <div className="code-section">
                <div className="code-label">Coupon Code</div>
                <div className="code-box">
                  <span className="code-val">{detail.couponCode}</span>
                  <button
                    type="button"
                    className={`copy-btn${copied ? " copy-btn--done" : ""}`}
                    onClick={handleCopy}
                    aria-label="Copy coupon code"
                  >
                    {copied ? "✓ Copied!" : "⎘ Copy"}
                  </button>
                </div>
              </div>
 

              {/* CTA */}
              <div className="cta-row">
                <button
                  type="button"
                  className={`req-btn${done ? " req-btn--done" : ""}`}
                  onClick={handleRequest}
                  disabled={requesting || done}
                  aria-busy={requesting}
                >
                  {requesting
                    ? <><span className="spin"/>Claiming…</>
                    : done
                      ? <>✓ Coupon Claimed</>
                      : <>Claim This Deal <span className="arr">→</span></>
                  }
                </button>
                <button
                  type="button"
                  className="share-btn"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.share
                      ? navigator.share({ title: detail.name, url })
                      : navigator.clipboard.writeText(url);
                  }}
                >
                  ↗ Share Deal
                </button>
              </div>

            </div>
          </div>

          

        </main>
      </div>
    </>
  );
}