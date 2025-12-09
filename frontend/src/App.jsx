// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import { Auth } from "@/Auth";
import { Home } from "@/Home";
import { LocationList } from "@/LocationList";
import { EventList } from "@/EventList";     // this component shows admin UI if isAdmin(user)
import { Map } from "@/Map";
import { FavouriteList } from "@/FavouriteList";
import { Suggestions } from "@/Suggestions";
import { TopNav } from "@/TopNav";
import { LocationDetail } from "@/LocationDetail";

import { UserManager } from "@/UserManager"; // admin-only page
import { RequireAdmin } from "@/lib/RequireAdmin";
import { useState } from "react"
import { useAuth } from "@/lib/AuthContext";

function App() {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth setIsAuthenticated={setIsAuthenticated}/>} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <div>
      <TopNav setIsAuthenticated={setIsAuthenticated}/>

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
          <Route path="/suggestions" element={<Suggestions />} />

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
          <Route path="/admin/*" element={<Navigate to="/eventList" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
