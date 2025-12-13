import { LocationListTable } from "@/location/LocationListTable";
import { PageShell } from "@/components/page-shell";

export function FavouriteList() {
  return (
    <PageShell title="Favourite List">
      <LocationListTable isFavourite={true} />
    </PageShell>
  );
}
