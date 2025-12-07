import { LoadingScreen } from "@/components/ui/loading-screen"
import { LocationSheet } from "@/LocationSheet";
import { LocationSideMenu } from "@/components/location-side-menu";
import { MapComponent } from "@/components/map-component";
import { PageShell } from "@/components/page-shell"
import { useLocationsWithDistance } from "@/hooks/use-locations-with-distance";
import { useState } from "react"


export function Map() {
  const [filterName, setFilterName] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const {
    _,
    locations,
    loading,
    errorMsg,
    maxDist,
    distRange,
    setDistRange,
  } = useLocationsWithDistance();

  const filteredLocations = locations.filter((loc) => {
    const [minDistVal, maxDistVal] = distRange;

    const matchName = (
      !filterName ||
      loc.name.toLowerCase().includes(filterName.toLowerCase())
    );
    if (!matchName) { return false }

    const matchDistrict = (
      !filterDistrict ||
      loc.district.toLowerCase() === filterDistrict.toLowerCase()
    );
    if (!matchDistrict) { return false }

    const matchDistance = (loc.distance >= minDistVal && loc.distance <= maxDistVal);
    if (!matchDistance) { return false }

    return true;
  });

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <LocationSheet
        location={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      <div className="text-red-500">{errorMsg}</div>
      <PageShell title="Map">
        <div className="flex flex-col gap-4 lg:flex-row justify-center w-full">
          <aside className="min-w-85">
            <LocationSideMenu
              getFilterName={() => filterName}
              setFilterName={setFilterName}
              getFilterDistrict={() => filterDistrict}
              setFilterDistrict={setFilterDistrict}
              maxDist={maxDist}
              getDistRange={() => distRange}
              setDistRange={setDistRange}
            />
          </aside>
          <div className="w-full">
            <MapComponent
              locations={filteredLocations}
              center={[locations[0]?.latitude, locations[0]?.longitude]}
              onClick={(loc) => setSelectedLocation(loc)}
              style={{ height: "700px", width: "100%", zIndex: "1"}}
            />
          </div>
        </div>
      </PageShell>
    </>
  )
}