import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LocationSheet } from "@/location/LocationSheet";
import { LocationSideMenu } from "@/location/location-side-menu";
import { MapComponent } from "@/location/map-component";
import { PageShell } from "@/components/page-shell";
import { useLocationsWithDistance } from "@/location/use-locations-with-distance";
import { useState } from "react";

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
    refresh,
  } = useLocationsWithDistance();

  const filteredLocations = locations.filter((loc) => {
    const [minDistVal, maxDistVal] = distRange;

    const matchName =
      !filterName || loc.name.toLowerCase().includes(filterName.toLowerCase());
    if (!matchName) {
      return false;
    }

    const matchDistrict =
      !filterDistrict ||
      loc.district.toLowerCase() === filterDistrict.toLowerCase();
    if (!matchDistrict) {
      return false;
    }

    const distance = loc.distance;
    if (distance) {
      const matchDistance = distance >= minDistVal && distance <= maxDistVal;
      if (!matchDistance) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <LocationSheet
        location={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      <PageShell title="Map">
        <div className="text-red-500">{errorMsg}</div>
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
              extraComponents={() => {
                return (
                  <Button size="sm" className="ml-auto h-8" onClick={refresh}>
                    Refresh
                  </Button>
                );
              }}
            />
          </aside>
          <div className="w-full">
            <MapComponent
              locations={filteredLocations}
              center={[
                locations[0]?.latitude ?? 22.3,
                locations[0]?.longitude ?? 114.2,
              ]}
              onClick={(loc) => setSelectedLocation(loc)}
              style={{ height: "700px", width: "100%", zIndex: "1" }}
            />
          </div>
        </div>
      </PageShell>
    </>
  );
}
