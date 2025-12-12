import {
  getUserLocation,
  haversineDistance
} from "@/lib/utils"
import {
  useEffect,
  useState
} from "react"

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

async function fetchAllLocations() {
  const res = await fetch(`${API_BASE}/locations/`, { method: "GET" });
  const maybeJson = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (maybeJson && (maybeJson.error || maybeJson.message)) ||
      "Failed to load locations";
    throw new Error(msg);
  }
  const list = Array.isArray(maybeJson?.data) ? maybeJson.data : (maybeJson || []);
  return list.map((loc) => ({
    id: String(loc._id ?? loc.id ?? ""),
    name: loc.nameE ?? loc.name ?? "",
    district: loc.district ?? "",
    num_events: loc.num_events ?? 0,
    latitude: Number(loc.latitude) || 0,
    longitude: Number(loc.longitude) || 0,
    isFavourite: !!loc.isFavourite,
  }));
}

async function fetchLocationById(id) {
  const res = await fetch(`${API_BASE}/locations/${id}`, { method: "GET" });
  const maybeJson = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (maybeJson && (maybeJson.error || maybeJson.message)) ||
      "Failed to load location";
    throw new Error(msg);
  }
  const loc = Array.isArray(maybeJson?.data) ? maybeJson.data[0] : (maybeJson || {});
  return {
    id: String(loc._id ?? loc.id ?? ""),
    name: loc.nameE ?? loc.name ?? "",
    district: loc.district ?? "",
    num_events: loc.num_events ?? 0,
    latitude: Number(loc.latitude) || 0,
    longitude: Number(loc.longitude) || 0,
    isFavourite: !!loc.isFavourite,
  };
}

export function useLocationsWithDistance({ isFavouriteOnly = false } = {}) {
  const [haveUserCoords, setHaveUserCoords] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        let userCoords = null;
        try {
          userCoords = await getUserLocation();
          setHaveUserCoords(true);
        } catch {
          if (!cancelled) {
            setErrorMsg("Failed to get user location. Showing data without distance.");
          }
        }

        const base = await fetchAllLocations();
        const filtered = isFavouriteOnly ? base.filter((x) => x.isFavourite) : base;

        const withDistance =
          userCoords
            ? filtered.map((loc) => ({
                ...loc,
                distance: haversineDistance(
                  userCoords.latitude,
                  userCoords.longitude,
                  loc.latitude,
                  loc.longitude
                ),
              }))
            : filtered;

        if (!cancelled) setLocations(withDistance);
      } catch (err) {
        if (!cancelled) setErrorMsg(err.message || "Failed to load locations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isFavouriteOnly, reloadKey]);

  useEffect(() => {
    if (!haveUserCoords) return;
    const distances = locations
      .map((x) => x.distance)
      .filter((d) => typeof d === "number" && !Number.isNaN(d));
    if (distances.length) {
      const m = Math.max(...distances);
      setMaxDist(m);
      setDistRange(([min]) => [min, m]);
    }
  }, [locations, haveUserCoords]);

  return {
    haveUserCoords,
    locations,
    loading,
    errorMsg,
    maxDist,
    distRange,
    setDistRange,
    refresh,
  };
}

export function useLocationWithDistance(id) {
  const [haveUserCoords, setHaveUserCoords] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        let userCoords = null;
        try {
          userCoords = await getUserLocation();
          setHaveUserCoords(true);
        } catch {
          if (!cancelled) setErrorMsg("Failed to get user location. Showing data without distance.");
        }

        const baseLoc = await fetchLocationById(id);
        const withDistance =
          userCoords
            ? {
                ...baseLoc,
                distance: haversineDistance(
                  userCoords.latitude,
                  userCoords.longitude,
                  baseLoc.latitude,
                  baseLoc.longitude
                ),
              }
            : baseLoc;

        if (!cancelled) setLocation(withDistance);
      } catch (err) {
        if (!cancelled) setErrorMsg(err.message || "Failed to load location");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  return { haveUserCoords, location, loading, errorMsg, refresh };
}


async function loadLocationsData(setter) {
  const rows = await fetchAllLocations();
  setter(rows);
}

async function loadLocationData(id) {
  return fetchLocationById(id);
}
