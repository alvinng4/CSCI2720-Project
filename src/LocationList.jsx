/* Fake data */
const locationData = [
  { id: 1, location: "location1", distance: 61, noOfEvents: 3 },
  { id: 2, location: "location2", distance: 13, noOfEvents: 4 },
  { id: 3, location: "location3", distance: 71, noOfEvents: 6 },
]

export function LocationList() {
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
