const API_BASE = "https://couponservice-latest-68dz.onrender.com";

export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

export async function getCoupons() {
  const res = await fetch(`${API_BASE}/api/seller/coupons`);
  const json = await res.json();
  return json.data ?? json;
}

export async function getCouponDetail(id) {
  const res = await fetch(`${API_BASE}/api/seller/coupons/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const json = await res.json();
  return json.data ?? json;
}

export async function requestCoupon(id) {
  const res = await fetch(`${API_BASE}/api/coupon-requests/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  if (!res.ok) throw new Error("Request failed");
  return res.json();
}