import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Bookmark, MessageCircle, Search, Ticket } from "lucide-react";
import { getCoupons, getExpiringSoon, getSavedCoupons, saveCoupon, unsaveCoupon } from "./CouponService";

const PRIMARY = "#0D9488";
const cx = (...p) => p.filter(Boolean).join(" ");

function CouponCard({ coupon, saved, onToggleSave, onView }) {
  const expiry = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
  const expired = coupon.expired;

  return (
    <article className="group rounded-xl border border-[#DCEFEC] bg-white p-5 transition hover:border-[#0D9488]/30 hover:shadow-[0_10px_28px_-16px_rgba(13,148,136,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0D9488]/10 text-[#0D9488]">
          <Ticket size={16} />
        </div>
        <button
          className={cx("text-[#CFE7E3] transition hover:text-[#0D9488]", saved && "text-[#0D9488]")}
          onClick={() => onToggleSave(coupon)}
          aria-label={saved ? "Unsave" : "Save"}
          type="button"
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <h3 className="mt-3 line-clamp-2 font-['Poppins'] text-[1.05rem] font-bold leading-snug text-[#18181B]">
        {coupon.name}
      </h3>

      <div className="mt-4 flex items-center justify-between border-t border-[#E7FAF7] pt-3">
        <span className={cx("text-[11.5px] font-medium", expired ? "text-[#CFE7E3]" : "text-[#9291A5]")}>
          {expired ? "Expired" : expiry ? `Until ${expiry.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}
        </span>
        <button
          className="inline-flex h-8 items-center rounded-full px-3.5 text-[12.5px] font-semibold text-white transition group-hover:brightness-105"
          style={{ backgroundColor: PRIMARY }}
          type="button"
          onClick={() => onView(coupon.id)}
        >
          View deal
        </button>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [query, setQuery] = useState("");
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getCoupons(), getSavedCoupons(), getExpiringSoon(3)])
      .then(([couponResult, savedResult, expiringResult]) => {
        if (couponResult.status === "fulfilled") setCoupons(couponResult.value || []);
        if (savedResult.status === "fulfilled") {
          setSavedIds(new Set((savedResult.value || []).map((row) => row.coupon?.id).filter(Boolean)));
        }
        if (expiringResult.status === "fulfilled") setExpiringCount((expiringResult.value || []).length);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return coupons;
    return coupons.filter((c) => c.name.toLowerCase().includes(clean));
  }, [coupons, query]);

  const toggleSave = useCallback(async (coupon) => {
    const wasSaved = savedIds.has(coupon.id);
    if (wasSaved) await unsaveCoupon(coupon.id);
    else await saveCoupon(coupon.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(coupon.id) : next.add(coupon.id);
      return next;
    });
  }, [savedIds]);

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <header className="flex h-16 items-center justify-between border-b border-[#DCEFEC] bg-white px-6 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ backgroundColor: PRIMARY }}>
            <Ticket size={16} />
          </div>
          <span className="font-['Poppins'] text-[16px] font-bold text-[#18181B]">CouponVault</span>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full text-[#9291A5] transition hover:bg-[#E7FAF7] hover:text-[#0D9488]"
          aria-label="Chat"
          onClick={() => navigate("/chat")}
        >
          <MessageCircle size={18} />
        </button>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-10 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-['Poppins'] text-[1.7rem] font-bold text-[#18181B]">Your deals</h1>
          <label className="flex h-11 w-full max-w-[280px] items-center gap-2 rounded-full border border-[#CFEAE6] bg-white px-4 transition focus-within:border-[#0D9488] focus-within:ring-4 focus-within:ring-[#0D9488]/10">
            <Search size={15} className="text-[#B4B2C4]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deals"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#18181B] outline-none placeholder:text-[#B4B2C4]"
            />
          </label>
        </div>

        {expiringCount > 0 && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#0D9488]/8 px-4 py-2.5 text-[13px] font-medium text-[#0D9488]">
            <Bell size={14} />
            {expiringCount} saved coupon{expiringCount > 1 ? "s" : ""} expiring soon
          </div>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-[150px] animate-pulse rounded-xl border border-[#DCEFEC] bg-[#F5FBFA]" />
            ))
          ) : filtered.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="rounded-xl border border-dashed border-[#CFEAE6] bg-white py-14 text-center text-[13.5px] text-[#9291A5]">
                No deals match your search.
              </p>
            </div>
          ) : (
            filtered.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                saved={savedIds.has(coupon.id)}
                onToggleSave={toggleSave}
                onView={(id) => navigate(`/coupon/${id}`)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
