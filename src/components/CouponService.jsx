export const API_BASE = "https://chronicle-blogs.duckdns.org";

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

export async function getCouponVerification(id) {
  const res = await fetch(`${API_BASE}/api/coupons/${id}/verification`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function voteCouponVerification(id, worked) {
  const res = await fetch(`${API_BASE}/api/coupons/${id}/verification`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ worked }),
  });
  return readJson(res);
}

export async function getSavedState(id) {
  const res = await fetch(`${API_BASE}/api/coupons/${id}/save`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function saveCoupon(id) {
  const res = await fetch(`${API_BASE}/api/coupons/${id}/save`, {
    method: "POST",
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function unsaveCoupon(id) {
  const res = await fetch(`${API_BASE}/api/coupons/${id}/save`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getSavedCoupons() {
  const res = await fetch(`${API_BASE}/api/coupons/saved`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getExpiringSoon(days = 3) {
  const res = await fetch(`${API_BASE}/api/coupons/reminders/expiring-soon?days=${days}`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function askCouponAssistant(query, limit = 5) {
  const res = await fetch(`${API_BASE}/api/coupons/assistant`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ query, limit }),
  });
  return readJson(res);
}

export async function getSellerAnalytics() {
  const res = await fetch(`${API_BASE}/api/seller/analytics`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function getAdminCoupons() {
  const res = await fetch(`${API_BASE}/api/admin/coupons`, {
    headers: authHeaders(),
  });
  return readJson(res);
}

export async function adminDeleteCoupon(id) {
  const res = await fetch(`${API_BASE}/api/admin/coupons/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to remove coupon");
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

export async function uploadChatMedia(chatRoomId, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/chats/${chatRoomId}/media`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  return readJson(res);
}

export function getChatSocketUrl() {
  return API_BASE.replace(/^https:/, "wss:").replace(/^http:/, "ws:") + "/ws/websocket";
}

export function resolveMediaUrl(url) {
  if (!url) return "";
  try {
    return new URL(url, API_BASE).toString();
  } catch {
    return url;
  }
}

