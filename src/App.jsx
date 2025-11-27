import { Routes, Route } from "react-router-dom"

import { TopNav } from "./TopNav"

/* Fake data */
const locationData = [
  { id: 1, location: "location1", distance: 61, noOfEvents: 3 },
  { id: 2, location: "location2", distance: 13, noOfEvents: 4 },
  { id: 3, location: "location3", distance: 71, noOfEvents: 6 },
]

function App() {
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

function Home() {
  return (
    <p className="text-muted-foreground">
      Hello, world!
    </p>
  )
}

function LocationList() {
  return (
    <p className="text-muted-foreground">
      Hello, world!
    </p>
  )
}

function LocationRow({ location, isFavourite, onToggleFavourite }) {
  return (
    <p className="text-muted-foreground">
      Hello, world!
    </p>
  )
}

function EventList() {
  return (
    <p className="text-muted-foreground">
      Hello, world!
    </p>
  )
}

function Map() {
  return (
    <p className="text-muted-foreground">
      Hello, world!
    </p>
  )
}

function FavouriteList() {
  return (
    <p className="text-muted-foreground">
      Hello, world!
    </p>
  )
}

function Suggestions() {
  return (
    <p className="text-muted-foreground">
      Hello, world!
    </p>
  )
}

export default App