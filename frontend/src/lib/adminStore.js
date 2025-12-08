// Simple localStorage-backed store for admin CRUD
//to be replaced to allow for backend calls

const KEY = "adminStore/v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // seed with demo data
  const seed = {
    events: [
      { id: "e1", title: "String Quartet Night", location: "Hong Kong City Hall", date: "2025-12-12" },
    ],
    locations: [
      { id: "l1", name: "Hong Kong City Hall", district: "Central" },
      { id: "l2", name: "Kwai Tsing Theatre", district: "Kwai Chung" },
    ],
    users: [
      { id: "u1", name: "Admin Account", email: "admin@example.com", role: "admin" },
    ],
  };
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36).slice(-4)}`;
}

export const adminStore = {
  getAll() {
    return load();
  },

  //Events
  listEvents() {
    return load().events;
  },
  createEvent(data) {
    const db = load();
    const item = { id: uid("e"), ...data };
    db.events.unshift(item);
    save(db);
    return item;
  },
  updateEvent(id, patch) {
    const db = load();
    db.events = db.events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    save(db);
  },
  deleteEvent(id) {
    const db = load();
    db.events = db.events.filter((e) => e.id !== id);
    save(db);
  },

  //Locations
  listLocations() {
    return load().locations;
  },
  createLocation(data) {
    const db = load();
    const item = { id: uid("l"), ...data };
    db.locations.unshift(item);
    save(db);
    return item;
  },
  updateLocation(id, patch) {
    const db = load();
    db.locations = db.locations.map((x) => (x.id === id ? { ...x, ...patch } : x));
    save(db);
  },
  deleteLocation(id) {
    const db = load();
    db.locations = db.locations.filter((x) => x.id !== id);
    save(db);
  },

  //Users
  listUsers() {
    return load().users;
  },
  createUser(data) {
    const db = load();
    const item = { id: uid("u"), ...data };
    db.users.unshift(item);
    save(db);
    return item;
  },
  updateUser(id, patch) {
    const db = load();
    db.users = db.users.map((x) => (x.id === id ? { ...x, ...patch } : x));
    save(db);
  },
  deleteUser(id) {
    const db = load();
    db.users = db.users.filter((x) => x.id !== id);
    save(db);
  },
};
