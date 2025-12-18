// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { LocationListTable } from "@/location/LocationListTable";
import PageShell from "@/components/page-shell";

export function FavouriteList() {
  return (
    <PageShell title="Favourite List">
      <LocationListTable isFavourite={true} />
    </PageShell>
  );
}
