const TOKEN_KEY = "app:authToken";
const USER_KEY = "app:user";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.log(err);
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.log(err);
  }
}

export function setAuth({ token, user }) {
  setToken(token || null);
  setUser(user || null);
}

export function clearAuth() {
  setToken(null);
  setUser(null);
}

export function isAuthenticated() {
  return !!getToken();
}

export function isAdmin(user) {
  return !!user && user.role === "admin";
}
