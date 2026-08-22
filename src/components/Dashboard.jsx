import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, MessageCircle, Search, ShoppingBag, Sparkles, Store, Tag } from "lucide-react";
import { createOrGetChatRoom, getBuyerChats, getBuyerRequests, getCoupons } from "./CouponService";
import ChatPanel from "./ChatPanel";

function CouponCard({ coupon, onView, onChat }) {
  const expiry = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
  const expired = expiry ? expiry.getTime() < Date.now() : false;

  return (
    <article className="coupon-card">
      <div className="coupon-card__top">
        <div className="coupon-card__icon"><Tag size={18} /></div>
        <span className={`status ${expired ? "status--muted" : "status--live"}`}>
          {expired ? "Expired" : "Active"}
        </span>
      </div>
      <h3>{coupon.name}</h3>
      <p>{coupon.description || "No description added by seller."}</p>
      <div className="coupon-card__meta">
        <span>Seller #{coupon.sellerId || "N/A"}</span>
        {expiry && <span>{expiry.toLocaleDateString()}</span>}
      </div>
      <div className="coupon-card__actions">
        <button className="btn btn--dark" onClick={() => onView(coupon.id)}>View deal</button>
        <button className="icon-btn" onClick={() => onChat(coupon.id)} aria-label="Chat with seller">
          <MessageCircle size={17} />
        </button>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [chats, setChats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoadingId, setChatLoadingId] = useState(null);

  useEffect(() => {
    Promise.allSettled([getCoupons(), getBuyerChats(), getBuyerRequests()])
      .then(([couponResult, chatResult, requestResult]) => {
        if (couponResult.status === "fulfilled") setCoupons(couponResult.value || []);
        if (chatResult.status === "fulfilled") setChats(chatResult.value || []);
        if (requestResult.status === "fulfilled") setRequests(requestResult.value || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCoupons = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return coupons;
    return coupons.filter((coupon) =>
      [coupon.name, coupon.description, coupon.couponCode]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(clean))
    );
  }, [coupons, query]);

  const startChat = useCallback(async (couponId) => {
    setChatLoadingId(couponId);
    try {
      const room = await createOrGetChatRoom(couponId);
      setActiveChat(room);
      setChats((prev) => {
        const exists = prev.some((item) => item.id === room.id);
        return exists ? prev.map((item) => item.id === room.id ? room : item) : [room, ...prev];
      });
    } finally {
      setChatLoadingId(null);
    }
  }, []);

  return (
    <div className="app-shell">
      <header className="topnav">
        <div className="brand-mark">
          <div className="brand-mark__icon"><ShoppingBag size={18} /></div>
          <div>
            <strong>CouponVault</strong>
            <span>Buyer workspace</span>
          </div>
        </div>
        <button className="btn btn--ghost" onClick={() => navigate("/seller")}>
          <Store size={16} /> Seller portal
        </button>
      </header>

      <main className="workspace workspace--buyer">
        <section className="hero-panel">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> Live marketplace</div>
            <h1>Browse deals and talk to sellers before you request.</h1>
            <p>Find verified coupons, open details, or start a conversation directly from any coupon.</p>
          </div>
          <div className="hero-stats">
            <div><strong>{coupons.length}</strong><span>Total coupons</span></div>
            <div><strong>{chats.length}</strong><span>My chats</span></div>
            <div><strong>{requests.length}</strong><span>Requests</span></div>
          </div>
        </section>

        <section className="content-grid">
          <div className="main-column">
            <div className="toolbar">
              <div className="search-box">
                <Search size={17} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by coupon name, code, or description"
                />
              </div>
              <span className="result-count">{filteredCoupons.length} results</span>
            </div>

            <div className="coupon-grid">
              {loading ? (
                Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index} />)
              ) : filteredCoupons.length === 0 ? (
                <div className="empty-state">No coupons match your search.</div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <CouponCard
                    coupon={coupon}
                    key={coupon.id}
                    onView={(id) => navigate(`/coupon/${id}`)}
                    onChat={startChat}
                    loading={chatLoadingId === coupon.id}
                  />
                ))
              )}
            </div>
          </div>

          <aside className="side-column">
            <section className="inbox-card">
              <div className="section-head">
                <div>
                  <div className="eyebrow"><Clock3 size={14} /> Tracker</div>
                  <h2>My requests</h2>
                </div>
              </div>
              <div className="request-list">
                {requests.length === 0 ? (
                  <p className="muted-copy">Requested coupons will appear here.</p>
                ) : requests.map((request) => (
                  <div className="request-mini" key={request.requestId}>
                    <div>
                      <strong>{request.couponName || `Coupon #${request.couponId}`}</strong>
                      <span>Seller #{request.sellerId}</span>
                    </div>
                    <span className={`status status--${(request.status || "PENDING").toLowerCase()}`}>
                      {request.status || "PENDING"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="inbox-card">
              <div className="section-head">
                <div>
                  <div className="eyebrow">Inbox</div>
                  <h2>My chats</h2>
                </div>
              </div>
              <div className="chat-list">
                {chats.length === 0 ? (
                  <p className="muted-copy">Start a chat from any coupon card.</p>
                ) : chats.map((chat) => (
                  <button
                    className={`chat-row ${activeChat?.id === chat.id ? "chat-row--active" : ""}`}
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                  >
                    <span>{chat.couponName || `Coupon #${chat.couponId}`}</span>
                    <small>{chat.lastMessage || "No messages yet"}</small>
                  </button>
                ))}
              </div>
            </section>

            <ChatPanel chatRoom={activeChat} compact />
          </aside>
        </section>
      </main>
    </div>
  );
}
