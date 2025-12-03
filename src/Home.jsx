import { Link } from "react-router-dom";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function Home() {
  return (
    <>         
    {/* Banner */}
      <div className="w-full">
        <img
          src="/home-pic.jpg"
          alt="Hong Kong skyline"
          className="block w-full h-48 md:h-64 lg:h-80 object-cover"
        />
      </div>
      
      <PageShell>
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl border dark:border-black bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-600 p-8 shadow-sm">
          <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(800px_circle_at_0%_0%,rgba(99,102,241,0.18),transparent_40%),radial-gradient(700px_circle_at_100%_100%,rgba(236,72,153,0.18),transparent_40%)]" />
          <p className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-300">HK Cultural Programmes</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-300 dark:to-pink-200 bg-clip-text text-transparent">
              Find your favourite events!
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Browse venues, see them on a map, save favourites, and view event details.
          </p>
        </div>

        <Separator className="my-8" />

        {/* FEATURE GRID */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card className="rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">📋</span>
                Locations list
              </CardTitle>
              <CardDescription>Sort & filter venues to quickly find what you want.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Sort by name, distance, and #events</li>
                <li>Filter by keyword / area / distance</li>
                <li>Open a venue to see events & comments</li>
              </ul>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link to="/locationList">Go to locations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">🗺️</span>
                Map view
              </CardTitle>
              <CardDescription>See venues geographically and inspect details via markers.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Markers for venues</li>
                <li>Click to open a venue page</li>
                <li>Filter-sync ready</li>
              </ul>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link to="/map">Open map</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-700">⭐</span>
                Favourites + Suggestions
              </CardTitle>
              <CardDescription>Save venues you like, or explore extra features.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Add / remove favourites</li>
                <li>Dedicated favourites page</li>
                <li>Try recommendations flow</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to="/favouriteList">My favourites</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/suggestions">Open suggestions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QUICK LINKS */}
        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Link
            to="/locationList"
            className="group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="text-sm font-medium">All Locations</div>
            <div className="text-xs text-muted-foreground">
              Browse the full table of venues.
            </div>
          </Link>
          <Link
            to="/map"
            className="group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="text-sm font-medium">Map</div>
            <div className="text-xs text-muted-foreground">
              Explore nearby venues visually.
            </div>
          </Link>
          <Link
            to="/favouriteList"
            className="group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="text-sm font-medium">Favourites</div>
            <div className="text-xs text-muted-foreground">
              Quickly access saved venues.
            </div>
          </Link>
          <Link
            to="/auth"
            className="group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="text-sm font-medium">Login</div>
            <div className="text-xs text-muted-foreground">
              Admin & user sign-in.
            </div>
          </Link>
        </div>
      </PageShell>
    </>
  );
}
