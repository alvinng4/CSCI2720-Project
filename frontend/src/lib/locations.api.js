const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export async function fetchLocations() {
  const token = localStorage.getItem("authToken");
  try {
    res = await fetch(`${API_BASE}/locations/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      userId: `${getUser()?.id}`,
    });
  } catch {
    throw new Error("Failed to fetch location data from database.");
  }

  if (!res.ok) {
    throw new Error("Failed to load locations");
  }
  return res.json();
}
