import { getToken } from "@/lib/AuthHelpers";
import { requestToBackend } from "@/lib/utils";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export async function getAllLocations() {
  return await requestToBackend("GET", "locations/");
}

export async function createLocation(
  locationData,
  setErrorMsg,
  stopCreating,
  refresh
) {
  setErrorMsg("");
  let res = null;
  try {
    res = await fetch(`${API_BASE}/locations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },

      body: JSON.stringify({
        location: {
          ...locationData,
          latitude: Number(locationData.latitude),
          longitude: Number(locationData.longitude),
        },
      }),
    });
  } catch {
    setErrorMsg(
      `Network error. Failed to create location, Please try again later.`
    );
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setErrorMsg(
      "Create location failed. " + (data?.message || "Some error occurred.")
    );
    return;
  }

  stopCreating();
  refresh();
}

export async function saveEditLocation(
  id,
  locationData,
  setErrorMsg,
  stopEditing,
  refresh
) {
  setErrorMsg("");

  if (!locationData || !id) {
    setErrorMsg("Edit failed. Location data is invalid.");
    return;
  }

  let res = null;
  try {
    res = await fetch(`${API_BASE}/locations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },

      body: JSON.stringify({
        ...locationData,
        latitude: Number(locationData.latitude),
        longitude: Number(locationData.longitude),
      }),
    });
  } catch {
    setErrorMsg(
      `Network error. Failed to update location id ${id}, Please try again later.`
    );
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setErrorMsg("Edit failed. " + (data?.message || "Unknown error occurred."));
    return;
  }

  stopEditing();
  refresh();
}

export async function deleteLocation(id, setErrorMsg, refresh) {
  setErrorMsg("");

  const userConsent = confirm("Delete this location?");
  if (!userConsent) {
    return;
  }

  let res = null;
  try {
    res = await fetch(`${API_BASE}/locations/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getToken()}`,
      },
    });
  } catch {
    setErrorMsg(
      `Network error. Failed to delete location id ${id}, Please try again later.`
    );
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setErrorMsg(data?.message || "Delete failed");
    return;
  }
  refresh();
}
