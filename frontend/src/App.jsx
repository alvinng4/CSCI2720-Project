// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { Routes, Route, Navigate } from "react-router-dom";

import { Auth } from "@/Auth";
import { Home } from "@/Home";
import { LocationList } from "@/location/LocationList";
import { EventList } from "@/event/EventList";
import { Map } from "@/location/Map";
import { FavouriteList } from "@/location/FavouriteList";
import { Leaderboard } from "@/event/Leaderboard";
import { TopNav } from "@/TopNav";
import { LocationDetail } from "@/location/LocationDetail";

import { UserManager } from "@/UserManager/UserManager"; // admin-only page
import { RequireAdmin } from "@/lib/RequireAdmin";
import { useState } from "react";
import { isAuthenticated as hasAuth } from "@/lib/AuthHelpers";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAuth());

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/auth"
          element={<Auth setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div>
      <TopNav setIsAuthenticated={setIsAuthenticated} />

      <main>
        <Routes>
          {/* Auth */}
          <Route path="/auth" element={<Navigate to="/" replace />} />

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/locationList" element={<LocationList />} />
          <Route path="/eventList" element={<EventList />} />
          <Route path="/map" element={<Map />} />
          <Route path="/favouriteList" element={<FavouriteList />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route path="/location/:id" element={<LocationDetail />} />

          {/* Admin-only route(s) */}
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UserManager />
              </RequireAdmin>
            }
          />

          {/* Optional: if someone hits the old /admin URL, send them to /eventList */}
          <Route
            path="/admin/*"
            element={<Navigate to="/eventList" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
