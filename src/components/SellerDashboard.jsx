import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Edit3, Inbox, Plus, Store, Tag, Trash2 } from "lucide-react";
import {
  acceptCouponRequest,
  createCoupon,
  deleteCoupon,
  getSellerChats,
  getSellerCoupons,
  getSellerRequests,
  rejectCouponRequest,
  updateCoupon,
} from "./CouponService";
import ChatPanel from "./ChatPanel";

const EMPTY_COUPON = {
  name: "",
  description: "",
  couponCode: "",
  expiryDate: "",
};

function toApiPayload(form) {
  return {
    ...form,
    expiryDate: new Date(form.expiryDate).toISOString(),
  };
}

function CouponForm({ value, onChange, onSubmit, onCancel, submitLabel }) {
  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          <span>Coupon name</span>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} required />
        </label>
        <label>
          <span>Coupon code</span>
          <input value={value.couponCode} onChange={(e) => onChange({ ...value, couponCode: e.target.value })} required />
        </label>
        <label className="form-grid__full">
          <span>Description</span>
          <textarea value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} required />
        </label>
        <label>
          <span>Expiry date</span>
          <input type="date" value={value.expiryDate} onChange={(e) => onChange({ ...value, expiryDate: e.target.value })} required />
        </label>
      </div>
      <div className="action-row">
        <button className="btn btn--dark" type="submit">{submitLabel}</button>
        <button className="btn btn--ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newCoupon, setNewCoupon] = useState(EMPTY_COUPON);
  const [editingId, setEditingId] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(EMPTY_COUPON);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.allSettled([getSellerRequests(), getSellerCoupons(), getSellerChats()])
      .then(([requestResult, couponResult, chatResult]) => {
        if (requestResult.status === "fulfilled") setRequests(requestResult.value || []);
        if (couponResult.status === "fulfilled") setCoupons(couponResult.value || []);
        if (chatResult.status === "fulfilled") setChats(chatResult.value || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => ({
    coupons: coupons.length,
    requests: requests.length,
    chats: chats.length,
  }), [chats.length, coupons.length, requests.length]);

  const handleAccept = useCallback(async (request) => {
    const id = request.id ?? request.requestId;
    if (!id) return;
    setProcessingId(id);
    try {
      await acceptCouponRequest(id);
      await loadData();
    } finally {
      setProcessingId(null);
    }
  }, [loadData]);

  const handleReject = useCallback(async (request) => {
    const id = request.id ?? request.requestId;
    if (!id) return;
    setProcessingId(id);
    try {
      await rejectCouponRequest(id);
      await loadData();
    } finally {
      setProcessingId(null);
    }
  }, [loadData]);

  const handleCreate = useCallback(async (event) => {
    event.preventDefault();
    const saved = await createCoupon(toApiPayload(newCoupon));
    setCoupons((prev) => [saved, ...prev]);
    setNewCoupon(EMPTY_COUPON);
    setShowCreate(false);
  }, [newCoupon]);

  const startEdit = useCallback((coupon) => {
    setEditingId(coupon.id);
    setEditingCoupon({
      name: coupon.name || "",
      description: coupon.description || "",
      couponCode: coupon.couponCode || "",
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
    });
  }, []);

  const handleEdit = useCallback(async (event) => {
    event.preventDefault();
    const saved = await updateCoupon(editingId, toApiPayload(editingCoupon));
    setCoupons((prev) => prev.map((coupon) => coupon.id === editingId ? saved : coupon));
    setEditingId(null);
  }, [editingCoupon, editingId]);

  const handleDelete = useCallback(async (id) => {
    await deleteCoupon(id);
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
  }, []);

  return (
    <div className="app-shell">
      <header className="topnav">
        <div className="brand-mark">
          <div className="brand-mark__icon"><Store size={18} /></div>
          <div>
            <strong>CouponVault</strong>
            <span>Seller workspace</span>
          </div>
        </div>
        <button className="btn btn--ghost" onClick={() => navigate("/coupons")}>Buyer view</button>
      </header>

      <main className="workspace">
        <section className="hero-panel">
          <div>
            <div className="eyebrow"><Store size={14} /> Seller operations</div>
            <h1>Manage coupons, requests, and buyer conversations.</h1>
            <p>A focused workspace for listings, approvals, and real-time buyer chat.</p>
          </div>
          <div className="hero-stats">
            <div><strong>{stats.coupons}</strong><span>Coupons</span></div>
            <div><strong>{stats.requests}</strong><span>Requests</span></div>
            <div><strong>{stats.chats}</strong><span>Chats</span></div>
          </div>
        </section>

        <section className="seller-layout">
          <div className="main-column">
            <section className="panel">
              <div className="section-head">
                <div>
                  <div className="eyebrow"><Inbox size={14} /> Requests</div>
                  <h2>Coupon requests</h2>
                </div>
                <span className="result-count">{requests.length} total</span>
              </div>

              <div className="stack">
                {loading ? (
                  <div className="empty-state">Loading requests...</div>
                ) : requests.length === 0 ? (
                  <div className="empty-state">No buyer requests yet.</div>
                ) : requests.map((request) => {
                  const id = request.id ?? request.requestId;
                  const status = request.status || "PENDING";
                  const isPending = status === "PENDING";
                  return (
                    <div className="request-row" key={id}>
                      <div>
                        <strong>{request.couponName || `Coupon #${request.couponId}`}</strong>
                        <span>Buyer #{request.buyerId || "N/A"}</span>
                      </div>
                      <div className="row-actions">
                        <span className={`status status--${status.toLowerCase()}`}>{status}</span>
                        {isPending && (
                          <>
                            <button className="btn btn--soft" disabled={processingId === id} onClick={() => handleAccept(request)}>
                              <Check size={16} /> {processingId === id ? "Accepting" : "Accept"}
                            </button>
                            <button className="btn btn--danger" disabled={processingId === id} onClick={() => handleReject(request)}>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="panel">
              <div className="section-head">
                <div>
                  <div className="eyebrow"><Tag size={14} /> Inventory</div>
                  <h2>My coupons</h2>
                </div>
                <button className="btn btn--dark" onClick={() => setShowCreate(true)}>
                  <Plus size={16} /> New coupon
                </button>
              </div>

              {showCreate && (
                <CouponForm
                  value={newCoupon}
                  onChange={setNewCoupon}
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreate(false)}
                  submitLabel="Create coupon"
                />
              )}

              <div className="stack">
                {coupons.length === 0 && !showCreate ? (
                  <div className="empty-state">Create your first coupon to start selling.</div>
                ) : coupons.map((coupon) => (
                  <article className="inventory-row" key={coupon.id}>
                    {editingId === coupon.id ? (
                      <CouponForm
                        value={editingCoupon}
                        onChange={setEditingCoupon}
                        onSubmit={handleEdit}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Save changes"
                      />
                    ) : (
                      <>
                        <div>
                          <strong>{coupon.name}</strong>
                          <p>{coupon.description}</p>
                          <span>{coupon.couponCode}</span>
                        </div>
                        <div className="row-actions">
                          <button className="icon-btn" onClick={() => startEdit(coupon)} aria-label="Edit coupon">
                            <Edit3 size={16} />
                          </button>
                          <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(coupon.id)} aria-label="Delete coupon">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="side-column">
            <section className="inbox-card">
              <div className="section-head">
                <div>
                  <div className="eyebrow">Inbox</div>
                  <h2>Buyer chats</h2>
                </div>
              </div>
              <div className="chat-list">
                {chats.length === 0 ? (
                  <p className="muted-copy">Buyer conversations will appear here.</p>
                ) : chats.map((chat) => (
                  <button
                    className={`chat-row ${activeChat?.id === chat.id ? "chat-row--active" : ""}`}
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                  >
                    <span>{chat.couponName || `Coupon #${chat.couponId}`}</span>
                    <small>Buyer #{chat.buyerId}</small>
                  </button>
                ))}
              </div>
            </section>

            <ChatPanel chatRoom={activeChat} title="Buyer chat" compact />
          </aside>
        </section>
      </main>
    </div>
  );
}
