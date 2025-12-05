import { LocationListComponent } from "@/components/location-list-component"
import { PageShell } from "@/components/page-shell"

export function LocationList() {
  return (
    <PageShell title="Location List">
      <LocationListComponent isFavourite={false} />
    </PageShell>
  )
}