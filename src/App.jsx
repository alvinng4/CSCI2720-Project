import { Routes, Route, Navigate } from "react-router-dom"

import { Auth } from "@/Auth"
import { EventList } from "@/EventList"
import { FavouriteList } from "@/FavouriteList"
import { Home } from "@/Home"
import { LocationList } from "@/LocationList"
import { Map } from "@/Map"
import { Suggestions } from "@/Suggestions"
import { TopNav } from "@/TopNav"

function App() {
  var isAuthenticated = true

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <div>
      <TopNav />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locationList" element={<LocationList />} />
          <Route path="/eventList" element={<EventList />} />
          <Route path="/map" element={<Map />} />
          <Route path="/favouriteList" element={<FavouriteList />} />
          <Route path="/suggestions" element={<Suggestions />} />
        </Routes>
      </main>
    </div>
  )
}

export default App