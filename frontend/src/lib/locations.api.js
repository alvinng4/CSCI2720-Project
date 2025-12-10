const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function fetchLocations() {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}/locations`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch locations (${res.status})`);
  return res.json(); // expect array of locations
}
