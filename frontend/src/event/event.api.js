import { getToken, getUser } from "@/lib/AuthHelpers";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export async function deleteEvent(id, setErrorMsg, refresh) {
  const userConsent = confirm("Delete this event?");
  if (!userConsent) {
    return;
  }

  let res = null;
  try {
    res = await fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },
    });
  } catch {
    setErrorMsg("Network error. Please try again later.");
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setErrorMsg(data?.message || "Delete failed");
    return;
  }
  refresh();
}
