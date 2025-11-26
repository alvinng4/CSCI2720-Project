import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

/* Fake data */
const locationData = [
  { id: 1, location: "location1", distance: 61, noOfEvents: 3 },
  { id: 2, location: "location2", distance: 13, noOfEvents: 4 },
  { id: 3, location: "location3", distance: 71, noOfEvents: 6 },
]

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <TopNav />

        <main className="container mx-auto flex-1 px-4 py-6">
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
    </BrowserRouter>
  )
}

function TopNav() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/locationList", label: "Location List" },
    { to: "/eventList", label: "Event List" },
    { to: "/map", label: "Map" },
    { to: "/favouriteList", label: "Favourite List" },
    { to: "/suggestions", label: "No idea?" },
  ]

  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold">CSCI2720 Project</span>

        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            {links.map((link) => (
              <NavigationMenuItem key={link.to}>
                <NavigationMenuLink asChild>
                  <Link
                    to={link.to}
                    className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}

function PageShell({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <Separator />
      {children}
    </div>
  )
}

function Home() {
  return (
    <PageShell title="Home">
      <p className="text-muted-foreground">
        Hello, world!
      </p>
    </PageShell>
  )
}

function LocationList() {
  const [favourites, setFavourites] = useState([])

  const toggleFavourite = (id) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <PageShell title="Location List">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Locations</span>
            <Badge variant="secondary">
              {locationData.length} total locations
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[200px]">Location</TableHead>
                <TableHead className="w-[120px]">Distance</TableHead>
                <TableHead className="w-[160px]">Number of Events</TableHead>
                <TableHead className="w-[160px] text-right">
                  Add to favourite
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationData.map((loc) => (
                <LocationRow
                  key={loc.id}
                  location={loc}
                  isFavourite={favourites.includes(loc.id)}
                  onToggleFavourite={() => toggleFavourite(loc.id)}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  )
}

function LocationRow({ location, isFavourite, onToggleFavourite }) {
  return (
    <TableRow>
      <TableCell>{location.id}</TableCell>
      <TableCell>
        <span className="font-medium">{location.location}</span>
      </TableCell>
      <TableCell>{location.distance} km</TableCell>
      <TableCell>{location.noOfEvents}</TableCell>
      <TableCell className="text-right">
        <Button
          variant={isFavourite ? "default" : "outline"}
          size="sm"
          onClick={onToggleFavourite}
        >
          {isFavourite ? "✓ Favourited" : "Add"}
        </Button>
      </TableCell>
    </TableRow>
  )
}

function EventList() {
  return (
    <PageShell title="Event List">
      <p className="text-muted-foreground">
        Hello, world!
      </p>
    </PageShell>
  )
}

function Map() {
  return (
    <PageShell title="Map">
      <p className="text-muted-foreground">
        Hello, world!
      </p>
    </PageShell>
  )
}

function FavouriteList() {
  return (
    <PageShell title="Favourite List">
      <p className="text-muted-foreground">
        Hello, world!
      </p>
    </PageShell>
  )
}

function Suggestions() {
  return (
    <PageShell title="Suggestions">
      <p className="text-muted-foreground">
        Hello, world!
      </p>
    </PageShell>
  )
}

export default App