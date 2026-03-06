import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

/* ───── Coupon Detail Modal ───── */
function CouponDetailModal({ couponId, onClose, onRequestDone }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!couponId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/seller/coupons/${couponId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(json => setDetail(json.data ?? json))
      .catch(() => setError("Failed to load coupon"))
      .finally(() => setLoading(false));
  }, [couponId]);

  const handleRequest = async () => {
    if (!detail) return;
    setRequesting(true);
    try {
      const res = await fetch(`${API_BASE}/api/coupon-requests/${detail.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Request failed");
      await res.json();
      onRequestDone(detail.id); // notify parent dashboard
    } catch {
      alert("Failed to request coupon. Try again.");
    } finally {
      setRequesting(false);
    }
  };

  const isOwned = detail?.couponCode && detail.couponCode !== "****";
  const isExpired = detail?.expiryDate && new Date(detail.expiryDate) < new Date();

  if (loading) return <div>Loading coupon details...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{
      background: "rgba(0,0,0,0.3)",
      position: "fixed", inset: 0, display: "flex",
      justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ background: "#fff", padding: 20, width: 300, borderRadius: 8 }}>
        <h3>{detail.name}</h3>
        <p>{detail.description}</p>
        <p>Status: {isExpired ? "Expired" : isOwned ? "Owned" : "Available"}</p>
        <p>Code: {isOwned ? detail.couponCode : "••••••"}</p>

        {!isOwned && !isExpired && (
          <button onClick={handleRequest} disabled={requesting}>
            {requesting ? "Requesting..." : "Request Coupon"}
          </button>
        )}

        <button onClick={onClose} style={{ marginLeft: 10 }}>Close</button>
      </div>
    </div>
  );
}

/* ───── Dashboard ───── */
export default function Dashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);
  const [reqDoneId, setReqDoneId] = useState(null);
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/seller/coupons`)
      .then(res => res.json())
      .then(json => setCoupons(json.data ?? json))
      .finally(() => setLoading(false));
  }, []);

  const handleRequest = async (couponId) => {
    setRequestingId(couponId);
    try {
      const res = await fetch(`${API_BASE}/api/coupon-requests/${couponId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Request failed");
      await res.json();
      setReqDoneId(couponId); // mark as requested
    } catch {
      alert("Failed to request coupon. Try again.");
    } finally {
      setRequestingId(null);
    }
  };

  const handleRequestDoneFromModal = (couponId) => {
    setReqDoneId(couponId);
    setDetailId(null); // close modal after success
  };

  if (loading) return <div>Loading coupons...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Coupons Dashboard</h1>

      {coupons.map(c => {
        const isRequested = reqDoneId === c.id;
        const isLoading = requestingId === c.id;

        return (
          <div key={c.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
            <h3>{c.name}</h3>
            <p>{c.description}</p>

            <button onClick={() => setDetailId(c.id)}>View Details</button>

            {/* Request Coupon directly from dashboard */}
            {!isRequested && (
              <button
                onClick={() => handleRequest(c.id)}
                disabled={isLoading}
                style={{ marginLeft: 10 }}
              >
                {isLoading ? "Requesting..." : "Request Coupon"}
              </button>
            )}

            {isRequested && <span style={{ marginLeft: 10 }}>Requested ✓</span>}
          </div>
        );
      })}

      {/* Detail modal */}
      {detailId && (
        <CouponDetailModal
          couponId={detailId}
          onClose={() => setDetailId(null)}
          onRequestDone={handleRequestDoneFromModal}
        />
      )}
    </div>
  );
}