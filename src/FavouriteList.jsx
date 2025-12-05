import { LocationListComponent } from "@/components/location-list-component"
import { PageShell } from "@/components/page-shell"

export function FavouriteList() {
  return (
    <PageShell title="Favourite List">
      <LocationListComponent isFavourite={true} />
    </PageShell>
  )
}