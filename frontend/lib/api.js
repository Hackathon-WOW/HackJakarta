// Thin client for the API gateway. All calls go through NEXT_PUBLIC_API_URL/api/*
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const TOKEN_KEY = "grow_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!form && body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: form ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// Stream a text/plain response chunk-by-chunk. Calls onChunk(fullText, delta) as it arrives.
async function streamRequest(path, body, onChunk) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const delta = decoder.decode(value, { stream: true });
    full += delta;
    onChunk?.(full, delta);
  }
  return full;
}

export const api = {
  auth: {
    register: (payload) => request("/auth/register", { method: "POST", body: payload }),
    login: (payload) => request("/auth/login", { method: "POST", body: payload }),
    me: () => request("/auth/me"),
  },
  umkm: {
    showcase: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== ""),
      ).toString();
      return request(`/umkm/umkms${qs ? `?${qs}` : ""}`);
    },
    detail: (id) => request(`/umkm/umkms/${id}`),
    mine: () => request("/umkm/my/umkm"),
    updateProfile: (payload) => request("/umkm/my/umkm", { method: "PUT", body: payload }),
    publish: (publish) => request("/umkm/my/umkm/publish", { method: "POST", body: { publish } }),
    interestState: (id) => request(`/umkm/umkms/${id}/interest`),
  },
  interests: {
    list: () => request("/umkm/interests"),
    express: (payload) => request("/umkm/interests", { method: "POST", body: payload }),
    update: (id, payload) => request(`/umkm/interests/${id}`, { method: "PATCH", body: payload }),
    remove: (id) => request(`/umkm/interests/${id}`, { method: "DELETE" }),
  },
  finance: {
    reports: (umkmId) => request(`/finance/reports/${umkmId}`),
    transactions: (umkmId, limit = 50) => request(`/finance/transactions/${umkmId}?limit=${limit}`),
    addTransaction: (payload) => request("/finance/transactions", { method: "POST", body: payload }),
    deleteTransaction: (id) => request(`/finance/transactions/${id}`, { method: "DELETE" }),
    upload: (formData) => request("/finance/upload", { method: "POST", form: formData }),
    documents: (umkmId) => request(`/finance/documents/${umkmId}`),
    generateDocument: (type) => request("/finance/documents/generate", { method: "POST", body: { type } }),
  },
  pos: {
    providers: () => request("/pos/providers"),
    integrations: () => request("/pos/integrations"),
    connect: (provider) => request("/pos/connect", { method: "POST", body: { provider } }),
    disconnect: (provider) => request("/pos/disconnect", { method: "POST", body: { provider } }),
    sync: (provider, days = 14) => request("/pos/sync", { method: "POST", body: { provider, days } }),
  },
  admin: {
    umkms: () => request("/umkm/admin/umkms"),
    approve: (id, approved) => request(`/umkm/admin/umkms/${id}/approve`, { method: "PATCH", body: { approved } }),
    users: () => request("/umkm/admin/users"),
    stats: () => request("/umkm/admin/stats"),
  },
  ai: {
    status: () => request("/ai/status"),
    insights: (umkmId) => request(`/ai/insights/${umkmId}`),
    brief: (umkmId) => request(`/ai/brief/${umkmId}`),
    document: (type) => request("/ai/document", { method: "POST", body: { type } }),
    chat: (messages) => request("/ai/chat", { method: "POST", body: { messages } }),
    chatStream: (messages, onChunk) => streamRequest("/ai/chat/stream", { messages }, onChunk),
    documentStream: (type, onChunk) => streamRequest("/ai/document/stream", { type }, onChunk),
  },
};
