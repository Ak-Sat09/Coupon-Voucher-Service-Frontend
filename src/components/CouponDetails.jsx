import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, MessageCircle, Share2, Tag } from "lucide-react";
import {
  createOrGetChatRoom,
  getCouponDetail,
  getBuyerRequests,
  requestCoupon,
} from "./CouponService";
import ChatPanel from "./ChatPanel";

export default function CouponDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([getCouponDetail(id), getBuyerRequests()])
      .then(([detailResult, requestResult]) => {
        if (detailResult.status === "fulfilled") {
          setDetail(detailResult.value);
        } else {
          setError("Failed to load coupon details.");
        }

        if (requestResult.status === "fulfilled") {
          const existing = (requestResult.value || []).find((item) => String(item.couponId) === String(id));
          if (existing && existing.status !== "REJECTED") {
            setRequested(true);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const startChat = useCallback(async () => {
    const room = await createOrGetChatRoom(id);
    setChatRoom(room);
  }, [id]);

  const claimCoupon = useCallback(async () => {
    if (requesting || requested) return;
    setRequesting(true);
    setError("");
    try {
      await requestCoupon(id);
      setRequested(true);
    } catch {
      setError("Could not send request. Please try again.");
    } finally {
      setRequesting(false);
    }
  }, [id, requesting, requested]);

  const copyCode = useCallback(() => {
    if (!detail?.couponCode) return;
    navigator.clipboard?.writeText(detail.couponCode).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [detail]);

  if (loading) {
    return (
      <div className="app-shell">
        <main className="workspace">
          <div className="detail-layout">
            <div className="skeleton-detail" />
            <div className="skeleton-chat" />
          </div>
        </main>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="app-shell">
        <main className="workspace">
          <div className="empty-state">Coupon not found.</div>
          <button className="btn btn--dark" onClick={() => navigate("/coupons")}>Back to deals</button>
        </main>
      </div>
    );
  }

  const expiry = detail.expiryDate ? new Date(detail.expiryDate) : null;

  return (
    <div className="app-shell">
      <header className="topnav">
        <button className="btn btn--ghost" onClick={() => navigate("/coupons")}>
          <ArrowLeft size={16} /> Back to deals
        </button>
        <div className="brand-mark">
          <div className="brand-mark__icon"><Tag size={18} /></div>
          <div>
            <strong>CouponVault</strong>
            <span>Deal details</span>
          </div>
        </div>
      </header>

      <main className="workspace">
        <div className="detail-layout">
          <section className="detail-card">
            <div className="eyebrow">Verified coupon</div>
            <h1>{detail.name}</h1>
            <p>{detail.description || "No description added by seller."}</p>

            {error && <div className="alert alert--error">{error}</div>}
            {requested && <div className="alert alert--success">Request sent to seller.</div>}

            <div className="code-block">
              <div>
                <span>Coupon code</span>
                <strong>{detail.couponCode || "Hidden"}</strong>
              </div>
              <button className="icon-btn icon-btn--light" onClick={copyCode} aria-label="Copy coupon code">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <div className="detail-meta">
              <div><span>Seller</span><strong>#{detail.sellerId || "N/A"}</strong></div>
              <div><span>Expiry</span><strong>{expiry ? expiry.toLocaleDateString() : "N/A"}</strong></div>
              <div><span>Status</span><strong>{detail.expired ? "Expired" : "Active"}</strong></div>
            </div>

            <div className="action-row">
              <button className="btn btn--dark" onClick={claimCoupon} disabled={requesting || requested}>
                {requested ? <Check size={16} /> : null}
                {requesting ? "Sending request..." : requested ? "Requested" : "Request coupon"}
              </button>
              <button className="btn btn--soft" onClick={startChat}>
                <MessageCircle size={16} /> Chat with seller
              </button>
              <button
                className="icon-btn"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                aria-label="Share deal"
              >
                <Share2 size={17} />
              </button>
            </div>
          </section>

          <ChatPanel chatRoom={chatRoom} title="Seller chat" />
        </div>
      </main>
    </div>
  );
}
