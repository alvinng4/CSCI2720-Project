import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
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
