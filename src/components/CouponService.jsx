export const API_BASE = "https://couponservice-latest-68dz.onrender.com";

export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }
  return json.data ?? json;
}

export async function getCoupons() {
  const res = await fetch(`${API_BASE}/api/seller/coupons`);
  return readJson(res);
}

export async function getCouponDetail(id) {
  const res = await fetch(`${API_BASE}/api/seller/coupons/${id}`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function requestCoupon(id) {
  const res = await fetch(`${API_BASE}/api/coupon-requests/${id}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getSellerCoupons() {
  const res = await fetch(`${API_BASE}/api/seller/coupons/my`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function createCoupon(payload) {
  const res = await fetch(`${API_BASE}/api/seller/coupons`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return readJson(res);
}

export async function updateCoupon(id, payload) {
  const res = await fetch(`${API_BASE}/api/seller/coupons/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return readJson(res);
}

export async function deleteCoupon(id) {
  const res = await fetch(`${API_BASE}/api/seller/coupons/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete coupon");
}

export async function getSellerRequests() {
  const res = await fetch(`${API_BASE}/api/coupon-requests/seller`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getBuyerRequests() {
  const res = await fetch(`${API_BASE}/api/coupon-requests/buyer`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function acceptCouponRequest(id) {
  const res = await fetch(`${API_BASE}/api/coupon-requests/seller/accept/${id}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function rejectCouponRequest(id) {
  const res = await fetch(`${API_BASE}/api/coupon-requests/seller/reject/${id}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function createOrGetChatRoom(couponId) {
  const res = await fetch(`${API_BASE}/api/chats/coupons/${couponId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getBuyerChats() {
  const res = await fetch(`${API_BASE}/api/chats/buyer`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getSellerChats() {
  const res = await fetch(`${API_BASE}/api/chats/seller`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getChatMessages(chatRoomId) {
  const res = await fetch(`${API_BASE}/api/chats/${chatRoomId}/messages`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function sendChatMessage(chatRoomId, message) {
  const res = await fetch(`${API_BASE}/api/chats/${chatRoomId}/messages`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ message }),
  });
  return readJson(res);
}

export function getChatSocketUrl() {
  return API_BASE.replace(/^http/, "ws") + "/ws/websocket";
}
