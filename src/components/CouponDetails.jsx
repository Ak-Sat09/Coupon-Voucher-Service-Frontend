import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Check, Copy, FlaskConical, MessageCircle, ShieldCheck, ThumbsDown, ThumbsUp, Ticket } from "lucide-react";
import {
  createOrGetChatRoom,
  getCouponDetail,
  getCouponVerification,
  getSavedState,
  requestCoupon,
  saveCoupon,
  unsaveCoupon,
  voteCouponVerification,
} from "./CouponService";

const PRIMARY = "#0D9488";
const cx = (...p) => p.filter(Boolean).join(" ");

/**
 * Preview mode: when the backend returns nothing (or fails), show sample data
 * so the page can be designed and tested. Set to false before shipping.
 */
const ENABLE_SAMPLE_FALLBACK = true;

const daysFromNow = (days) => new Date(Date.now() + days * 86_400_000).toISOString();

const SAMPLE_COUPONS = [
  {
    name: "Flat 40% off on your first order",
    description: "Valid on all fashion and lifestyle products above ₹999. One use per customer.",
    couponCode: "WELCOME40",
    expiryDate: daysFromNow(30),
    expired: false,
  },
  {
    name: "Free delivery on grocery orders",
    description: "Get free delivery on grocery orders above ₹499 from selected stores.",
    couponCode: "FREEDEL499",
    expiryDate: daysFromNow(7),
    expired: false,
  },
  {
    name: "Weekend movie combo offer",
    description: "Buy 2 tickets, get a free popcorn and a drink. Valid Friday to Sunday.",
    couponCode: "MOVIEFUN",
    expiryDate: daysFromNow(-5),
    expired: true,
  },
];

const getSampleCoupon = (id) => {
  const index = Number.isFinite(id) ? Math.abs(id) % SAMPLE_COUPONS.length : 0;
  return { id, ...SAMPLE_COUPONS[index] };
};

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export default function CouponDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const couponId = Number(id);
  const [detail, setDetail] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [saved, setSaved] = useState(false);
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setIsSample(false);

    // allSettled: a failing votes/saved call must not hide a valid coupon.
    Promise.allSettled([getCouponDetail(couponId), getCouponVerification(couponId), getSavedState(couponId)]).then(
      ([couponRes, verificationRes, savedRes]) => {
        if (cancelled) return;

        const coupon = couponRes.status === "fulfilled" ? couponRes.value : null;
        const verification = verificationRes.status === "fulfilled" ? verificationRes.value : null;
        const savedState = savedRes.status === "fulfilled" ? savedRes.value : null;

        if (coupon) {
          setDetail(coupon);
          setMyVote(verification?.myVote ?? null);
          setSaved(Boolean(savedState?.saved));
        } else if (ENABLE_SAMPLE_FALLBACK) {
          setDetail(getSampleCoupon(couponId));
          setMyVote(null);
          setSaved(false);
          setIsSample(true);
        } else {
          setDetail(null);
          setLoadError(true);
        }
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [couponId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5FBFA] font-['Inter']">
        <header className="flex h-16 items-center border-b border-[#DCEFEC] bg-white px-6 sm:px-10" />
        <main className="mx-auto max-w-[980px] px-6 py-10 sm:px-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="h-[420px] animate-pulse rounded-2xl border border-[#DCEFEC] bg-white" />
            <div className="grid gap-3">
              <div className="h-12 animate-pulse rounded-full bg-[#DCEFEC]" />
              <div className="h-12 animate-pulse rounded-full bg-[#DCEFEC]" />
              <div className="h-12 animate-pulse rounded-full bg-[#DCEFEC]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loadError || !detail) {
    return (
      <div className="min-h-screen bg-[#F5FBFA] font-['Inter']">
        <header className="flex h-16 items-center border-b border-[#DCEFEC] bg-white px-6 sm:px-10">
          <button
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#18181B] transition hover:text-[#0D9488]"
            onClick={() => navigate("/coupons")}
            type="button"
          >
            <ArrowLeft size={16} /> Back to deals
          </button>
        </header>
        <main className="mx-auto max-w-[520px] px-6 py-20 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
            <Ticket size={24} />
          </div>
          <h1 className="mt-4 font-['Poppins'] text-[1.3rem] font-bold text-[#18181B]">Coupon not found</h1>
          <p className="mt-2 text-[13.5px] leading-6 text-[#9291A5]">
            This deal may have been removed, expired, or the link is incorrect.
          </p>
          <button
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-[13.5px] font-semibold text-white transition hover:brightness-105"
            style={{ backgroundColor: PRIMARY }}
            onClick={() => navigate("/coupons")}
            type="button"
          >
            Browse deals
          </button>
        </main>
      </div>
    );
  }

  const expiry = new Date(detail.expiryDate);

  const copyCode = () => {
    navigator.clipboard?.writeText(detail.couponCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleVote = async (worked) => {
    if (isSample) {
      setMyVote(worked);
      return;
    }
    try {
      const result = await voteCouponVerification(couponId, worked);
      setMyVote(result?.myVote ?? worked);
    } catch {
      /* keep the previous vote on failure */
    }
  };

  const handleRequest = async () => {
    setRequesting(true);
    try {
      if (isSample) await delay();
      else await requestCoupon(couponId);
      setRequested(true);
    } catch {
      /* allow retry */
    } finally {
      setRequesting(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!isSample) {
        if (saved) await unsaveCoupon(couponId);
        else await saveCoupon(couponId);
      }
      setSaved((s) => !s);
    } catch {
      /* keep the previous state on failure */
    }
  };

  const handleChat = async () => {
    try {
      if (!isSample) await createOrGetChatRoom(couponId);
      navigate(`/chat/coupon/${couponId}`);
    } catch {
      /* stay on the page on failure */
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBFA] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <header className="flex h-16 items-center justify-between border-b border-[#DCEFEC] bg-white px-6 sm:px-10">
        <button
          className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#18181B] transition hover:text-[#0D9488]"
          onClick={() => navigate("/coupons")}
          type="button"
        >
          <ArrowLeft size={16} /> Back to deals
        </button>

        {isSample && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11.5px] font-semibold text-amber-700"
            role="status"
          >
            <FlaskConical size={13} /> Sample data: no response from backend
          </span>
        )}
      </header>

      <main className="mx-auto max-w-[980px] px-6 py-10 sm:px-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* main card */}
          <article className="overflow-hidden rounded-2xl border border-[#DCEFEC] bg-white shadow-[0_20px_50px_-30px_rgba(13,148,136,0.35)]">
            {/* ticket header */}
            <div className="relative px-7 pb-8 pt-7" style={{ background: "linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)" }}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-white">
                  {detail.expired ? "Expired" : "Active deal"}
                </span>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white">
                  <Ticket size={16} />
                </div>
              </div>
              <h1 className="mt-4 font-['Poppins'] text-[1.9rem] font-bold leading-tight text-white sm:text-[2.2rem]">
                {detail.name}
              </h1>
              <p className="mt-2 max-w-[440px] text-[13.5px] leading-6 text-white/80">{detail.description}</p>
            </div>

            {/* code strip, overlaps header like a torn ticket edge */}
            <div className="relative -mt-5 px-7">
              <div className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#B4B2C4]">Coupon code</span>
                  <strong className="mt-0.5 block font-['Poppins'] text-[1.5rem] font-bold tracking-tight text-[#18181B]">
                    {detail.couponCode}
                  </strong>
                </div>
                <button
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition hover:brightness-105"
                  style={{ backgroundColor: PRIMARY }}
                  onClick={copyCode}
                  aria-label="Copy code"
                  type="button"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="px-7 py-7">
              <div className="flex flex-wrap items-center gap-4 rounded-xl bg-[#E7FAF7] px-4 py-3">
                <ShieldCheck size={15} className="text-[#0D9488]" />
                <span className="text-[13px] text-[#5B5966]">
                  {detail.expired ? "Expired on" : "Valid until"}{" "}
                  {expiry.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {/* verification */}
              <div className="mt-6 flex items-center justify-between border-t border-[#E7FAF7] pt-6">
                <span className="text-[13.5px] font-medium text-[#18181B]">Did this coupon work?</span>
                <div className="flex gap-2">
                  <button
                    className={cx(
                      "grid h-10 w-10 place-items-center rounded-full border-2 transition",
                      myVote === true ? "border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]" : "border-[#CFEAE6] text-[#B4B2C4] hover:text-[#0D9488]"
                    )}
                    onClick={() => handleVote(true)}
                    aria-label="Worked"
                    aria-pressed={myVote === true}
                    type="button"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button
                    className={cx(
                      "grid h-10 w-10 place-items-center rounded-full border-2 transition",
                      myVote === false ? "border-red-400 bg-red-50 text-red-500" : "border-[#CFEAE6] text-[#B4B2C4] hover:text-red-500"
                    )}
                    onClick={() => handleVote(false)}
                    aria-label="Didn't work"
                    aria-pressed={myVote === false}
                    type="button"
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* action sidebar */}
          <aside className="grid content-start gap-3 lg:sticky lg:top-10">
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white shadow-[0_14px_28px_-10px_rgba(13,148,136,0.6)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: PRIMARY }}
              onClick={handleRequest}
              disabled={requesting || requested}
              type="button"
            >
              {requesting ? "Sending..." : requested ? "Request pending" : "Request coupon"}
            </button>

            <button
              className={cx(
                "inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 text-[14px] font-semibold transition",
                saved ? "border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]" : "border-[#CFEAE6] text-[#18181B] hover:bg-[#E7FAF7]"
              )}
              onClick={handleSave}
              aria-pressed={saved}
              type="button"
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save for later"}
            </button>

            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#CFEAE6] text-[14px] font-semibold text-[#18181B] transition hover:bg-[#E7FAF7]"
              onClick={handleChat}
              type="button"
            >
              <MessageCircle size={16} /> Chat with seller
            </button>

            <div className="mt-2 rounded-2xl border border-[#DCEFEC] bg-white p-4">
              <p className="text-[12.5px] leading-5 text-[#9291A5]">
                Coupons are verified by buyer feedback. Vote above after you try this
                code to help others in the community.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
