import { getToken, getUser } from "@/lib/AuthHelpers";
import { useEffect, useState } from "react";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export function useFetchEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  async function fetchAllEvents() {
    let res = null;
    try {
      res = await fetch(`${API_BASE}/events/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "x-user-id": `${getUser()?.id}`,
        },
        userId: `${getUser()?.id}`,
      });
    } catch {
      throw new Error("Failed to fetch events data from database.");
    }

    const maybeJson = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (maybeJson && (maybeJson.error || maybeJson.message)) ||
        "Failed to load events";
      throw new Error(msg);
    }
    const list = Array.isArray(maybeJson?.data)
      ? maybeJson.data
      : maybeJson || [];
    return list.map((event) => ({
      id: event._id,
      title: event.titleE,
      location: event.location,
      preDateE: event?.preDateE,
      progTimeE: event?.progTimeE,
      priceE: event?.priceE,
      descE: event?.descE,
      presenterOrgE: event?.presenterOrgE,
    }));
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const events = await fetchAllEvents();
        if (!cancelled) {
          setEvents(events);
          setLastSyncTime(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || "Failed to load locations");
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
  }, [reloadKey]);

  return {
    events,
    loading,
    errorMsg,
    setErrorMsg,
    lastSyncTime,
    refresh,
  };
}
