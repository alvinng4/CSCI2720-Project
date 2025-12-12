const KEY = "favourites/v1"; // stores { [locationId]: true }

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function save(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

let state = load();
const listeners = new Set();

export function getFavouritesMap() {
  return state;
}
export function isFavourite(id) {
  return !!state[id];
}
export function setFavourite(id, val) {
  const next = { ...state, [id]: !!val };
  if (!val) delete next[id];
  state = next;
  save(state);
  listeners.forEach((fn) => fn(state));
}
export function toggleFavourite(id) {
  setFavourite(id, !isFavourite(id));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// React hook
import { useEffect, useState } from "react";
export function useFavourites() {
  const [map, setMap] = useState(() => getFavouritesMap());
  useEffect(() => subscribe(setMap), []);
  return {
    map,
    isFav: (id) => !!map[id],
    setFav: setFavourite,
    toggle: toggleFavourite,
  };
}
