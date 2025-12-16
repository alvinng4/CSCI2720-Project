import { getToken, getUser } from "@/lib/AuthHelpers";
import { MessageTypes, useMessage } from "@/hooks/use-message";
import { useEffect, useState } from "react";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export function useFetchLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  async function fetchAllLocations() {
    let res = null;
    try {
      res = await fetch(`${API_BASE}/locations/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "x-user-id": `${getUser()?.id}`,
        },
        userId: `${getUser()?.id}`,
      });
    } catch {
      throw new Error("Failed to fetch location data from database.");
    }

    const maybeJson = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (maybeJson && (maybeJson.error || maybeJson.message)) ||
        "Failed to load locations";
      throw new Error(msg);
    }
    const list = Array.isArray(maybeJson?.data)
      ? maybeJson.data
      : maybeJson || [];
    return list.map((loc) => ({
      id: loc._id,
      name: loc.nameE,
      district: loc.district,
      num_events: loc.numEvents,
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      isFavourite: loc?.isFavourite ?? false,
    }));
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      resetMessage();
      try {
        const locations = await fetchAllLocations();
        if (!cancelled) {
          setLocations(locations);
        }
      } catch (err) {
        if (!cancelled) {
          showMessage(
            err.message || "Failed to load locations",
            MessageTypes.ERROR
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, resetMessage, showMessage]);

  return {
    locations,
    loading,
    message,
    isShowMessage,
    messageType,
    showMessage,
    resetMessage,
    refresh,
  };
}
