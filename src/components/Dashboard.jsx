import { useEffect, useState, useCallback, useRef } from "react";
import { getCoupons } from "./CouponService";
import { useNavigate } from "react-router-dom";

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
  --orange:   #ea580c;
  --orange-g: rgba(234,88,12,0.08);
  --shadow:   0 1px 3px rgba(0,0,0,0.08),0 8px 32px rgba(0,0,0,0.06);
  --shadow2:  0 2px 8px rgba(0,0,0,0.06),0 24px 64px rgba(0,0,0,0.08);
  --fd: 'Cabinet Grotesk', sans-serif;
  --fb: 'Bricolage Grotesque', sans-serif;
}
html,body{min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--fb);-webkit-font-smoothing:antialiased}

/* subtle dot pattern */
.dash-root{
  min-height:100vh;
  position:relative;
}
.dash-root::before{
  content:'';position:fixed;inset:0;
  background-image:radial-gradient(circle, rgba(15,14,11,0.055) 1px, transparent 1px);
  background-size:28px 28px;pointer-events:none;z-index:0;
}

/* ── TOPBAR ── */
.topbar{
  position:sticky;top:0;z-index:100;
  background:rgba(245,244,240,0.88);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid var(--border);
  padding:0 40px;
  display:flex;align-items:center;justify-content:space-between;
  height:64px;
}
.brand{display:flex;align-items:center;gap:12px}
.brand__ic{
  width:40px;height:40px;border-radius:11px;
  background:var(--ink);
  display:flex;align-items:center;justify-content:center;font-size:17px;
  box-shadow:0 4px 16px rgba(15,14,11,0.2);flex-shrink:0;
}
.brand__name{font-family:var(--fd);font-size:17px;font-weight:900;letter-spacing:-0.025em;color:var(--ink)}
.brand__tag{
  font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
  background:var(--lime-g);border:1px solid rgba(101,163,13,0.25);
  color:var(--lime);padding:3px 8px;border-radius:100px;margin-left:2px;
}
.topbar__right{display:flex;align-items:center;gap:12px}
.topbar__badge{
  display:flex;align-items:center;gap:7px;
  padding:7px 14px;border-radius:100px;
  background:var(--white);border:1.5px solid var(--border2);
  font-size:12px;font-weight:600;color:var(--ink3);
  box-shadow:var(--shadow);
}
.topbar__dot{width:7px;height:7px;border-radius:50%;background:var(--lime2);animation:pulse 2s ease infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(1.6)}}
.topbar__avatar{
  width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,var(--violet2),var(--violet3));
  display:flex;align-items:center;justify-content:center;
  font-family:var(--fd);font-size:13px;font-weight:900;color:#fff;
  border:2px solid var(--white);box-shadow:var(--shadow);cursor:pointer;
  transition:transform 200ms,box-shadow 200ms;
}
.topbar__avatar:hover{transform:scale(1.08);box-shadow:var(--shadow2)}

/* ── MAIN ── */
.main{
  position:relative;z-index:1;
  max-width:1280px;margin:0 auto;
  padding:48px 40px 80px;
}

/* ── PAGE HEADER ── */
.ph{
  display:flex;align-items:flex-end;justify-content:space-between;
  margin-bottom:40px;flex-wrap:wrap;gap:20px;
}
.ph__l{}
.ph__eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--violet2);margin-bottom:12px;
}
.ph__eyebrow-dot{width:5px;height:5px;border-radius:50%;background:var(--violet2);animation:pulse 2s ease infinite;}
.ph__h1{
  font-family:var(--fd);
  font-size:clamp(36px,4vw,56px);
  font-weight:900;line-height:0.95;letter-spacing:-0.04em;
  color:var(--ink);
}
.ph__h1 span{
  background:linear-gradient(135deg,var(--violet2) 0%,var(--violet3) 50%,#a78bfa 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.ph__sub{font-size:14px;color:var(--muted);font-weight:300;margin-top:10px;line-height:1.7}
.ph__r{display:flex;align-items:center;gap:10px}

/* search bar */
.srch{
  display:flex;align-items:center;gap:10px;
  padding:11px 16px;
  background:var(--white);border:1.5px solid var(--border2);
  border-radius:11px;min-width:240px;
  box-shadow:var(--shadow);
  transition:border-color 200ms,box-shadow 200ms;
}
.srch:focus-within{border-color:var(--violet2);box-shadow:0 0 0 3px rgba(109,40,217,0.1)}
.srch input{border:none;outline:none;background:transparent;font-family:var(--fb);font-size:13px;color:var(--ink);flex:1;}
.srch input::placeholder{color:var(--muted2)}
.srch__ic{color:var(--muted2);flex-shrink:0;transition:color 200ms}
.srch:focus-within .srch__ic{color:var(--violet2)}

/* filter pills */
.filters{display:flex;align-items:center;gap:8px;margin-bottom:32px;flex-wrap:wrap}
.pill{
  padding:7px 16px;border-radius:100px;
  font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
  border:1.5px solid var(--border2);background:var(--white);
  color:var(--muted);cursor:pointer;
  transition:all 160ms;
  box-shadow:var(--shadow);
}
.pill:hover{border-color:var(--violet3);color:var(--violet2)}
.pill--active{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.pill--active:hover{background:var(--ink2);border-color:var(--ink2);color:var(--bg)}

/* ── STAT STRIP ── */
.stats{
  display:grid;grid-template-columns:repeat(4,1fr);gap:12px;
  margin-bottom:40px;
}
@media(max-width:768px){.stats{grid-template-columns:repeat(2,1fr)}}
.stat{
  background:var(--white);border:1px solid var(--border);
  border-radius:16px;padding:20px 18px;
  box-shadow:var(--shadow);
  transition:border-color 200ms,transform 200ms,box-shadow 200ms;
  animation:mIn .5s ease both;
}
.stat:nth-child(1){animation-delay:.05s}
.stat:nth-child(2){animation-delay:.1s}
.stat:nth-child(3){animation-delay:.15s}
.stat:nth-child(4){animation-delay:.2s}
.stat:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:var(--shadow2)}
@keyframes mIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.stat__val{font-family:var(--fd);font-size:30px;font-weight:900;letter-spacing:-0.03em;line-height:1;color:var(--ink);margin-bottom:6px}
.stat__val span{color:var(--violet2)}
.stat__key{font-size:10px;font-weight:600;color:var(--muted2);letter-spacing:0.06em;text-transform:uppercase}
.stat__ic{
  width:36px;height:36px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;font-size:16px;
  margin-bottom:14px;
}
.stat__ic--v{background:var(--violet-g);border:1px solid rgba(109,40,217,0.15)}
.stat__ic--l{background:var(--lime-g);border:1px solid rgba(101,163,13,0.2)}
.stat__ic--o{background:var(--orange-g);border:1px solid rgba(234,88,12,0.15)}
.stat__ic--g{background:rgba(22,163,74,0.07);border:1px solid rgba(22,163,74,0.2)}

/* ── SECTION LABEL ── */
.sec-label{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:20px;
}
.sec-label__t{
  font-family:var(--fd);font-size:18px;font-weight:900;
  letter-spacing:-0.02em;color:var(--ink);
}
.sec-label__c{
  font-size:11px;font-weight:600;color:var(--muted2);
  letter-spacing:0.06em;text-transform:uppercase;
}

/* ── COUPON GRID ── */
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:16px;
}

/* ── COUPON CARD ── */
.card{
  background:var(--white);
  border:1px solid var(--border);
  border-radius:20px;
  overflow:hidden;
  box-shadow:var(--shadow);
  transition:border-color 200ms,transform 200ms,box-shadow 200ms;
  animation:mIn .5s ease both;
  display:flex;flex-direction:column;
}
.card:hover{
  border-color:var(--border2);
  transform:translateY(-3px);
  box-shadow:var(--shadow2);
}

/* card top accent bar */
.card__bar{height:3px;width:100%;background:linear-gradient(90deg,var(--violet2),var(--violet3),var(--lime-lt))}
.card__bar--lime{background:linear-gradient(90deg,var(--lime),var(--lime2),var(--lime-lt))}
.card__bar--orange{background:linear-gradient(90deg,var(--orange),#f97316,#fb923c)}

.card__body{padding:22px 22px 18px;flex:1;display:flex;flex-direction:column;gap:12px}

/* store row */
.card__store{display:flex;align-items:center;gap:10px}
.card__store-ic{
  width:36px;height:36px;border-radius:10px;
  background:var(--bg2);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;
}
.card__store-name{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted)}
.card__badges{margin-left:auto;display:flex;gap:6px}
.badge{
  font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
  padding:3px 8px;border-radius:100px;
}
.badge--hot{background:rgba(234,88,12,0.1);color:var(--orange);border:1px solid rgba(234,88,12,0.2)}
.badge--new{background:var(--lime-g);color:var(--lime);border:1px solid rgba(101,163,13,0.2)}
.badge--excl{background:var(--violet-g);color:var(--violet2);border:1px solid rgba(109,40,217,0.15)}

/* discount strip */
.card__disc{
  display:flex;align-items:baseline;gap:8px;
}
.card__disc-val{
  font-family:var(--fd);font-size:44px;font-weight:900;
  letter-spacing:-0.04em;line-height:1;color:var(--ink);
}
.card__disc-val span{font-size:22px;color:var(--violet2)}
.card__disc-off{
  font-family:var(--fd);font-size:14px;font-weight:700;
  color:var(--muted2);text-transform:uppercase;letter-spacing:0.04em;
}

/* name & desc */
.card__name{
  font-family:var(--fd);font-size:17px;font-weight:800;
  letter-spacing:-0.02em;color:var(--ink);line-height:1.25;
}
.card__desc{
  font-size:13px;color:var(--muted);font-weight:300;line-height:1.7;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}

/* code row */
.card__code-row{
  display:flex;align-items:center;gap:8px;
  padding:10px 14px;
  background:var(--bg);border:1.5px dashed var(--border2);
  border-radius:10px;cursor:pointer;
  transition:border-color 200ms,background 200ms;
}
.card__code-row:hover{border-color:var(--violet3);background:var(--bg2)}
.card__code{
  font-family:var(--fd);font-size:13px;font-weight:800;
  letter-spacing:0.12em;color:var(--violet2);flex:1;
}
.card__copy{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted2)}
.card__copy--done{color:var(--green)}

/* meta row */
.card__meta{display:flex;align-items:center;gap:14px}
.card__exp{
  display:flex;align-items:center;gap:5px;
  font-size:11px;font-weight:600;color:var(--muted2);
}
.card__exp-dot{width:5px;height:5px;border-radius:50%;background:var(--muted2);flex-shrink:0}
.card__exp-dot--soon{background:var(--orange);animation:pulse 1.5s ease infinite}
.card__claimed{
  margin-left:auto;font-size:11px;font-weight:600;color:var(--muted2);
}

/* card footer */
.card__foot{
  padding:14px 22px;
  border-top:1px solid var(--border);
  background:var(--bg);
}
.view-btn{
  width:100%;padding:12px 20px;
  font-family:var(--fd);font-size:13px;font-weight:800;letter-spacing:0.01em;
  background:var(--ink);color:var(--bg);
  border:none;border-radius:9px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:background 200ms,transform 300ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms;
  position:relative;overflow:hidden;
}
.view-btn::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 55%);
  opacity:0;transition:opacity 200ms;
}
.view-btn:hover{
  background:var(--ink2);transform:translateY(-2px);
  box-shadow:0 10px 32px rgba(15,14,11,0.22);
}
.view-btn:hover::before{opacity:1}
.view-btn:active{transform:translateY(0);box-shadow:none}
.arr{font-size:16px;transition:transform 220ms cubic-bezier(0.34,1.56,0.64,1)}
.view-btn:hover .arr{transform:translateX(5px)}

/* ── EMPTY STATE ── */
.empty{
  grid-column:1/-1;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:80px 40px;text-align:center;
  background:var(--white);border:1px solid var(--border);border-radius:20px;
  box-shadow:var(--shadow);
}
.empty__ic{font-size:52px;margin-bottom:20px}
.empty__t{font-family:var(--fd);font-size:22px;font-weight:900;color:var(--ink);margin-bottom:8px;letter-spacing:-0.03em}
.empty__s{font-size:14px;color:var(--muted);font-weight:300;line-height:1.7}

/* ── SKELETON LOADING ── */
.skel{
  background:var(--white);border:1px solid var(--border);
  border-radius:20px;overflow:hidden;box-shadow:var(--shadow);
  animation:mIn .4s ease both;
}
.skel:nth-child(1){animation-delay:.05s}
.skel:nth-child(2){animation-delay:.1s}
.skel:nth-child(3){animation-delay:.15s}
.skel:nth-child(4){animation-delay:.2s}
.skel:nth-child(5){animation-delay:.25s}
.skel:nth-child(6){animation-delay:.3s}
.skel__bar{height:3px;background:var(--bg3)}
.skel__body{padding:22px}
.sh{border-radius:8px;background:linear-gradient(90deg,var(--bg2) 25%,var(--bg3) 50%,var(--bg2) 75%);background-size:200% 100%;animation:shimmer 1.4s ease infinite}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.sh--sm{height:10px;width:60%;margin-bottom:14px}
.sh--lg{height:40px;width:45%;margin-bottom:10px}
.sh--md{height:14px;width:85%;margin-bottom:6px}
.sh--md2{height:14px;width:60%;margin-bottom:18px}
.sh--code{height:38px;width:100%;margin-bottom:14px;border-radius:10px}
.sh--btn{height:44px;width:100%;border-radius:9px}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(80px);
  background:var(--ink);color:var(--bg);
  padding:12px 22px;border-radius:100px;
  font-family:var(--fd);font-size:13px;font-weight:700;
  box-shadow:0 8px 32px rgba(15,14,11,0.25);
  z-index:999;white-space:nowrap;
  transition:transform 300ms cubic-bezier(0.34,1.56,0.64,1),opacity 200ms;
  display:flex;align-items:center;gap:8px;
  opacity:0;pointer-events:none;
}
.toast--show{transform:translateX(-50%) translateY(0);opacity:1}
.toast__ic{color:var(--lime2)}

@media(max-width:600px){
  .topbar{padding:0 20px}
  .main{padding:32px 20px 60px}
  .ph{flex-direction:column;align-items:flex-start}
  .ph__r{width:100%}.srch{min-width:0;flex:1}
}
`;

// ── tiny helpers ──
const STORES = ["🛒","👗","📱","🏠","✈️","🍕","🎮","💄","📚","🏋️"];
const BARS   = ["","card__bar--lime","card__bar--orange"];
const BADGES = [
  {cls:"badge--hot",  label:"🔥 Hot"},
  {cls:"badge--new",  label:"✦ New"},
  {cls:"badge--excl", label:"★ Exclusive"},
];

function fakeMeta(id) {
  const seed = id % 10;
  return {
    store:    STORES[seed],
    bar:      BARS[id % 3],
    badge:    id % 3 === 0 ? BADGES[id % 3] : null,
    discount: [10,20,30,40,50,60,70,80][id % 8],
    code:     `SAVE${(id * 13 + 7) % 90 + 10}`,
    claimed:  ((id * 173 + 31) % 900) + 50,
    expDays:  (id * 7 + 3) % 30 + 1,
  };
}

function CouponSkeleton() {
  return (
    <div className="skel">
      <div className="skel__bar sh" style={{height:3}}/>
      <div className="skel__body">
        <div className="sh sh--sm"/>
        <div className="sh sh--lg"/>
        <div className="sh sh--md"/>
        <div className="sh sh--md2"/>
        <div className="sh sh--code"/>
        <div className="sh sh--btn"/>
      </div>
    </div>
  );
}

function CouponCard({ c, onView, onCopy, copiedId }) {
  const m    = fakeMeta(c.id);
  const soon = m.expDays <= 5;

  return (
    <div className="card" style={{ animationDelay: `${(c.id % 8) * 0.06}s` }}>
      <div className={`card__bar ${m.bar}`}/>
      <div className="card__body">

        <div className="card__store">
          <div className="card__store-ic">{m.store}</div>
          <span className="card__store-name">{c.name?.split(" ")[0] ?? "Store"}</span>
          {m.badge && (
            <div className="card__badges">
              <span className={`badge ${m.badge.cls}`}>{m.badge.label}</span>
            </div>
          )}
        </div>

        <div className="card__disc">
          <div className="card__disc-val">{m.discount}<span>%</span></div>
          <div className="card__disc-off">OFF</div>
        </div>

        <div className="card__name">{c.name}</div>
        <div className="card__desc">{c.description}</div>

        <div className="card__code-row" onClick={() => onCopy(c.id, m.code)}>
          <span className="card__code">{m.code}</span>
          <span className={`card__copy ${copiedId === c.id ? "card__copy--done" : ""}`}>
            {copiedId === c.id ? "✓ Copied!" : "TAP TO COPY"}
          </span>
        </div>

        <div className="card__meta">
          <div className="card__exp">
            <span className={`card__exp-dot ${soon ? "card__exp-dot--soon" : ""}`}/>
            {soon ? `Expires in ${m.expDays}d` : `Valid ${m.expDays} days`}
          </div>
          <div className="card__claimed">{m.claimed.toLocaleString()} claimed</div>
        </div>
      </div>

      <div className="card__foot">
        <button className="view-btn" onClick={() => onView(c.id)}>
          View Details <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}

const FILTERS = ["All", "Hot Deals", "New", "Exclusive", "Expiring Soon"];

export default function Dashboard() {
  const [coupons, setCoupons]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState("");
  const [activeFilter, setFilter] = useState("All");
  const [copiedId, setCopiedId]   = useState(null);
  const [toastMsg, setToastMsg]   = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastRef                  = useRef(null);
  const navigate                  = useNavigate();

  useEffect(() => {
    getCoupons()
      .then(data => { setCoupons(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const showToastMsg = useCallback((msg) => {
    setToastMsg(msg);
    setShowToast(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setShowToast(false), 2200);
  }, []);

  const handleCopy = useCallback((id, code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(id);
    showToastMsg(`✦ Code "${code}" copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  }, [showToastMsg]);

  const handleView = useCallback((id) => navigate(`/coupon/${id}`), [navigate]);

  const filtered = coupons.filter(c => {
    const q = query.toLowerCase();
    const matchQ = !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    return matchQ;
  });

  const totalSaved  = coupons.length * 847;
  const activeCnt   = coupons.length;
  const avgDiscount = coupons.length ? 35 : 0;

  return (
    <>
      <style>{S}</style>
      <div className="dash-root">

        {/* ── TOPBAR ── */}
        <header className="topbar">
          <div className="brand">
            <div className="brand__ic">🏷️</div>
            <span className="brand__name">CouponVault</span>
            <span className="brand__tag">Live</span>
          </div>
          <div className="topbar__right">
            <div className="topbar__badge">
              <span className="topbar__dot"/>
              {activeCnt} live deals
            </div>
            <div className="topbar__avatar" title="Profile">CV</div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="main">

          {/* Page Header */}
          <div className="ph">
            <div className="ph__l">
              <div className="ph__eyebrow">
                <span className="ph__eyebrow-dot"/>
                Members Dashboard
              </div>
              <h1 className="ph__h1">
                Your <span>Deals.</span>
              </h1>
              <p className="ph__sub">
                Browse {activeCnt} verified coupons — freshly sourced, deeply discounted.
              </p>
            </div>
            <div className="ph__r">
              <div className="srch">
                <svg className="srch__ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="search"
                  placeholder="Search coupons…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Stat Strip */}
          <div className="stats">
            <div className="stat">
              <div className="stat__ic stat__ic--v">🏷️</div>
              <div className="stat__val">{activeCnt}<span>+</span></div>
              <div className="stat__key">Active Coupons</div>
            </div>
            <div className="stat">
              <div className="stat__ic stat__ic--l">💰</div>
              <div className="stat__val">₹{(totalSaved/100000).toFixed(1)}<span>L</span></div>
              <div className="stat__key">Total Saved</div>
            </div>
            <div className="stat">
              <div className="stat__ic stat__ic--o">⚡</div>
              <div className="stat__val">{avgDiscount}<span>%</span></div>
              <div className="stat__key">Avg Discount</div>
            </div>
            <div className="stat">
              <div className="stat__ic stat__ic--g">✦</div>
              <div className="stat__val">12<span>K</span></div>
              <div className="stat__key">Partner Sellers</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`pill ${activeFilter === f ? "pill--active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Section Label */}
          <div className="sec-label">
            <div className="sec-label__t">
              {query ? `Results for "${query}"` : activeFilter === "All" ? "All Deals" : activeFilter}
            </div>
            <div className="sec-label__c">{filtered.length} coupons</div>
          </div>

          {/* Grid */}
          <div className="grid">
            {loading
              ? Array.from({ length: 6 }, (_, i) => <CouponSkeleton key={i} />)
              : filtered.length === 0
              ? (
                <div className="empty">
                  <div className="empty__ic">🔍</div>
                  <div className="empty__t">No coupons found</div>
                  <p className="empty__s">Try a different search term or clear your filters.</p>
                </div>
              )
              : filtered.map(c => (
                <CouponCard
                  key={c.id}
                  c={c}
                  onView={handleView}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))
            }
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