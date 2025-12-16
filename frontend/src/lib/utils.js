import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { getToken, getUser } from "@/lib/AuthHelpers";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ?? "http://localhost:4000") + "/api";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function requestToBackend(method, endPoint, jsonData = null) {
  const validMethods = ["POST", "GET", "PUT", "DELETE"];
  const upperMethod = method?.toUpperCase?.();
  if (!validMethods.includes(upperMethod)) {
    return { ok: false, error: `Error: Invalid HTTP method: ${method}` };
  }

  const headers = {
    authorization: `Bearer ${getToken()}`,
    "x-user-id": `${getUser()?.id}`,
  };
  if (jsonData) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(`${API_BASE}/${endPoint}`, {
      method: upperMethod,
      headers,
      body: jsonData ? JSON.stringify(jsonData) : undefined,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      // Do nothing
    }

    if (!res.ok) {
      let errorMsg = "Error: Something went wrong.";
      if (data?.error) {
        errorMsg = `Error: ${data?.error}`;
      }
      return { ok: res.ok, error: errorMsg };
    }
    return { ok: res.ok, data };
  } catch {
    return { ok: false, error: "Network error. Please try again later." };
  }
}

export function getUserLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Geolocation is not supported by this browser.")
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        resolve(coords);
      },
      (err) => {
        console.error(err);
        reject(err);
      }
    );
  });
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const earthRadius = 6371.0087714; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const havTheta =
    0.5 * (1 - Math.cos(dLat)) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 0.5 * (1 - Math.cos(dLon));
  const theta = 2 * Math.atan2(Math.sqrt(havTheta), Math.sqrt(1 - havTheta));
  return Number((earthRadius * theta).toFixed(2));
}
