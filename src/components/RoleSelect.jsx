
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
  --shadow:   0 1px 3px rgba(0,0,0,0.08),0 8px 32px rgba(0,0,0,0.06);
  --shadow2:  0 2px 8px rgba(0,0,0,0.06),0 24px 64px rgba(0,0,0,0.08);
  --shadow3:  0 4px 16px rgba(0,0,0,0.06),0 40px 80px rgba(0,0,0,0.1);
  --fd:'Cabinet Grotesk',sans-serif;
  --fb:'Bricolage Grotesque',sans-serif;
}
html,body{min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--fb);-webkit-font-smoothing:antialiased}

/* ── ROOT ── */
.rs{
  min-height:100vh;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  position:relative;overflow:hidden;
  padding:40px 24px;
}

/* dot grid */
.rs::before{
  content:'';position:fixed;inset:0;
  background-image:radial-gradient(circle,rgba(15,14,11,0.055) 1px,transparent 1px);
  background-size:28px 28px;pointer-events:none;z-index:0;
}

/* violet glow top-left */
.rs::after{
  content:'';position:absolute;
  width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle,rgba(109,40,217,0.07) 0%,transparent 65%);
  top:-200px;left:-200px;pointer-events:none;z-index:0;
}

/* lime glow bottom-right */
.glow2{
  position:absolute;
  width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(101,163,13,0.07) 0%,transparent 65%);
  bottom:-180px;right:-160px;pointer-events:none;z-index:0;
}

/* ── INNER ── */
.rs__in{
  position:relative;z-index:1;
  display:flex;flex-direction:column;align-items:center;
  width:100%;max-width:820px;
}

/* ── BRAND ── */
.brand{
  display:flex;align-items:center;gap:12px;
  margin-bottom:64px;
  animation:fUp .5s cubic-bezier(0.16,1,0.3,1) both;
}
.brand__ic{
  width:46px;height:46px;border-radius:13px;background:var(--ink);
  display:flex;align-items:center;justify-content:center;font-size:20px;
  box-shadow:0 4px 16px rgba(15,14,11,0.2);
}
.brand__name{font-family:var(--fd);font-size:20px;font-weight:900;letter-spacing:-0.025em;color:var(--ink)}
.brand__tag{
  font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
  background:var(--lime-g);border:1px solid rgba(101,163,13,0.25);
  color:var(--lime);padding:3px 8px;border-radius:100px;
}

/* ── HEADLINE ── */
.rs__head{
  text-align:center;margin-bottom:16px;
  animation:fUp .5s .08s cubic-bezier(0.16,1,0.3,1) both;
}
.rs__eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--violet2);margin-bottom:18px;
}
.rs__eyebrow-dot{width:5px;height:5px;border-radius:50%;background:var(--violet2);animation:pulse 2s ease infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.6)}}
.rs__h1{
  font-family:var(--fd);
  font-size:clamp(42px,6vw,72px);
  font-weight:900;line-height:.93;letter-spacing:-0.045em;
  color:var(--ink);
}
.rs__h1 .ac{
  display:block;
  background:linear-gradient(135deg,var(--violet2) 0%,var(--violet3) 50%,#a78bfa 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.rs__sub{
  font-size:15px;line-height:1.75;color:var(--muted);
  font-weight:300;max-width:440px;margin:18px auto 0;
  animation:fUp .5s .14s cubic-bezier(0.16,1,0.3,1) both;
}

/* ── CARDS ROW ── */
.rs__cards{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
  width:100%;
  margin-top:52px;
}
@media(max-width:600px){.rs__cards{grid-template-columns:1fr;gap:14px}}

/* ── ROLE CARD ── */
.rc{
  position:relative;overflow:hidden;
  background:var(--white);
  border:1.5px solid var(--border2);
  border-radius:24px;
  padding:36px 32px 28px;
  cursor:pointer;
  display:flex;flex-direction:column;
  box-shadow:var(--shadow);
  transition:transform 350ms cubic-bezier(0.34,1.56,0.64,1),
             border-color 200ms,
             box-shadow 200ms;
  animation:mIn .55s ease both;
  outline:none;
  -webkit-tap-highlight-color:transparent;
}
.rc:nth-child(1){animation-delay:.18s}
.rc:nth-child(2){animation-delay:.26s}
@keyframes mIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.rc:hover{
  transform:translateY(-6px) scale(1.015);
  box-shadow:var(--shadow3);
}
.rc:active{transform:translateY(-2px) scale(1.005)}

/* ── BUY card accent ── */
.rc--buy{border-color:rgba(109,40,217,0.18)}
.rc--buy:hover{border-color:rgba(109,40,217,0.35)}
.rc--buy .rc__glow{
  position:absolute;width:300px;height:300px;border-radius:50%;
  background:radial-gradient(circle,rgba(109,40,217,0.09) 0%,transparent 65%);
  top:-80px;right:-80px;pointer-events:none;
}
.rc--buy .rc__bar{background:linear-gradient(90deg,var(--violet2),var(--violet3),#a78bfa)}

/* ── SELL card accent ── */
.rc--sell{border-color:rgba(101,163,13,0.2)}
.rc--sell:hover{border-color:rgba(101,163,13,0.38)}
.rc--sell .rc__glow{
  position:absolute;width:300px;height:300px;border-radius:50%;
  background:radial-gradient(circle,rgba(101,163,13,0.09) 0%,transparent 65%);
  top:-80px;right:-80px;pointer-events:none;
}
.rc--sell .rc__bar{background:linear-gradient(90deg,var(--lime),var(--lime2),var(--lime-lt))}

/* top accent bar */
.rc__bar{height:3px;position:absolute;top:0;left:0;right:0}

/* icon badge */
.rc__ic{
  width:56px;height:56px;border-radius:16px;
  display:flex;align-items:center;justify-content:center;font-size:26px;
  margin-bottom:20px;flex-shrink:0;
  transition:transform 300ms cubic-bezier(0.34,1.56,0.64,1);
}
.rc:hover .rc__ic{transform:scale(1.12) rotate(-4deg)}
.rc--buy  .rc__ic{background:var(--violet-g);border:1px solid rgba(109,40,217,0.18)}
.rc--sell .rc__ic{background:var(--lime-g);border:1px solid rgba(101,163,13,0.22)}

/* label */
.rc__label{
  font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;
  margin-bottom:10px;
}
.rc--buy  .rc__label{color:var(--violet2)}
.rc--sell .rc__label{color:var(--lime)}

/* title */
.rc__title{
  font-family:var(--fd);font-size:32px;font-weight:900;
  letter-spacing:-0.04em;line-height:.98;color:var(--ink);
  margin-bottom:12px;
}

/* desc */
.rc__desc{
  font-size:13px;color:var(--muted);font-weight:300;
  line-height:1.75;flex:1;
}

/* perks list */
.rc__perks{
  margin-top:20px;display:flex;flex-direction:column;gap:8px;
}
.rc__perk{
  display:flex;align-items:center;gap:9px;
  font-size:12px;font-weight:600;color:var(--ink3);
}
.rc__perk-dot{
  width:18px;height:18px;border-radius:6px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:10px;
}
.rc--buy  .rc__perk-dot{background:var(--violet-g);color:var(--violet2)}
.rc--sell .rc__perk-dot{background:var(--lime-g);color:var(--lime)}

/* CTA row */
.rc__cta{
  margin-top:28px;
  display:flex;align-items:center;justify-content:space-between;
  padding-top:20px;border-top:1px solid var(--border);
}
.rc__cta-btn{
  padding:12px 22px;border-radius:10px;
  font-family:var(--fd);font-size:13px;font-weight:800;letter-spacing:0.01em;
  border:none;cursor:pointer;
  display:flex;align-items:center;gap:8px;
  transition:transform 300ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms,filter 200ms;
}
.rc--buy  .rc__cta-btn{background:var(--ink);color:var(--bg)}
.rc--sell .rc__cta-btn{background:var(--ink);color:var(--bg)}
.rc:hover .rc__cta-btn{transform:translateY(-1px);box-shadow:0 8px 28px rgba(15,14,11,0.22)}
.rc__arr{font-size:16px;transition:transform 220ms cubic-bezier(0.34,1.56,0.64,1)}
.rc:hover .rc__arr{transform:translateX(5px)}

.rc__users{
  display:flex;align-items:center;gap:-4px;
}
.rc__av{
  width:26px;height:26px;border-radius:50%;
  border:2px solid var(--white);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;margin-left:-6px;
}
.rc__av:first-child{margin-left:0}
.rc--buy  .rc__av{background:linear-gradient(135deg,var(--violet2),var(--violet3))}
.rc--sell .rc__av{background:linear-gradient(135deg,var(--lime),var(--lime2))}
.rc__users-label{font-size:10px;font-weight:600;color:var(--muted2);margin-left:6px}

/* ── DIVIDER ── */
.rs__or{
  position:relative;display:flex;align-items:center;justify-content:center;
  margin:0 -9px;
  animation:fUp .5s .3s cubic-bezier(0.16,1,0.3,1) both;
}
.rs__or-pill{
  width:36px;height:36px;border-radius:50%;
  background:var(--white);border:1.5px solid var(--border2);
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
  color:var(--muted2);box-shadow:var(--shadow);
  flex-shrink:0;z-index:1;
}

/* ── FOOTER NOTE ── */
.rs__foot{
  margin-top:40px;
  font-size:11px;color:var(--muted2);letter-spacing:0.05em;
  text-align:center;
  animation:fUp .5s .38s cubic-bezier(0.16,1,0.3,1) both;
}
`;
 
export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <>
      <style>{S}</style>
      <div className="rs">
        <div className="glow2" />

        <div className="rs__in">

          {/* Brand */}
          <div className="brand">
            <div className="brand__ic">🏷️</div>
            <span className="brand__name">CouponVault</span>
          </div>

          {/* Headline */}
          <div className="rs__head">
            <h1 className="rs__h1">
              What brings
              <span className="ac">you here?</span>
            </h1>
          </div>

          {/* Cards */}
          <div className="rs__cards">

            {/* BUY */}
            <div
              className="rc rc--buy"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/coupons")}
              onKeyDown={(e) => e.key === "Enter" && navigate("/coupons")}
            >
              <div className="rc__bar" />
              <div className="rc__glow" />

              <div className="rc__ic">🛒</div>
              <div className="rc__label">For Shoppers</div>
              <div className="rc__title">I want to<br />Buy.</div>

              <p className="rc__desc">
                Browse thousands of verified coupons from top Indian brands.
                Claim deals instantly and save more every day.
              </p>

              <div className="rc__cta">
                <div className="rc__users">
                  {["S", "A", "R"].map((l, i) => (
                    <div className="rc__av" key={i}>{l}</div>
                  ))}
                  <span className="rc__users-label">12K+ buyers</span>
                </div>

                <button className="rc__cta-btn">
                  Browse Deals <span className="rc__arr">→</span>
                </button>
              </div>
            </div>

            {/* SELL */}
            <div
              className="rc rc--sell"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/seller")}
              onKeyDown={(e) => e.key === "Enter" && navigate("/seller")}
            >
              <div className="rc__bar" />
              <div className="rc__glow" />

              <div className="rc__ic">🏪</div>
              <div className="rc__label">For Sellers</div>
              <div className="rc__title">I want to<br />Sell.</div>

              <p className="rc__desc">
                List your coupons, manage buyer requests, and grow your reach
                across India's most active deal community.
              </p>

              <div className="rc__cta">
                <div className="rc__users">
                  {["M", "P", "K"].map((l, i) => (
                    <div className="rc__av" key={i}>{l}</div>
                  ))}
                  <span className="rc__users-label">2K+ sellers</span>
                </div>

                <button className="rc__cta-btn">
                  Start Selling <span className="rc__arr">→</span>
                </button>
              </div>
            </div>

          </div>

          <p className="rs__foot">
            © 2025 CouponVault · All rights reserved · India's #1 Coupon Platform
          </p>

        </div>
      </div>
    </>
  );
}