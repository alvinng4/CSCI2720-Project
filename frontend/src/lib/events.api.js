// src/lib/events.api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders() {
    const t = localStorage.getItem('authToken');
    return t ? { Authorization: `Bearer ${t}` } : {};
}
  
export async function fetchEvents() {
    const res = await fetch(`${API_BASE}/events`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      cache: 'no-store', // avoid 304 confusing things
    });
    if (!res.ok) throw new Error(await res.text());
  
    const json = await res.json();
  
    // Accept array OR wrapped payloads
    const rawList = Array.isArray(json) ? json : (json.events || json.data || []);
  
    // Normalize fields so the table always has what it needs
    return rawList.map(e => ({
      ...e,
      _id: e._id || e.id,
      title: e.title ?? e.name ?? '',
      description: e.description ?? e.desc ?? '',
      dateTime: e.dateTime ?? (e.date && e.time ? `${e.date} ${e.time}` : e.date ?? ''),
      price: e.price ?? e.fee ?? '',
      presenters: e.presenters ?? e.presenter ?? e.presentedBy ?? '',
    }));
}  

export async function createEventAPI(payload) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Create failed (${res.status})`);
  return data;
}

export async function updateEventAPI(id, patch) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Update failed (${res.status})`);
  return data;
}

export async function deleteEventAPI(id) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}

