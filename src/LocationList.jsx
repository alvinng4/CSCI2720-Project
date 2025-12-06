import { LocationListTable } from "@/LocationListTable"
import { PageShell } from "@/components/page-shell"

export function LocationList() {
  return (
    <PageShell title="Location List">
      <LocationListTable isFavourite={false} />
    </PageShell>
  )
}