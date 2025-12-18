// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

import { getAllLocations } from "./location.api";
import { getUserLocation, haversineDistance } from "@/lib/utils";
import LoadingScreen from "@/components/ui/loading-screen";
import LocationSheet from "@/location/LocationSheet";
import LocationSideMenu from "@/location/location-side-menu";
import MapComponent from "@/location/map-component";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import PageShell from "@/components/page-shell";
import useAsync from "@/hooks/use-async";

export function Map() {
  const [locations, setLocations] = useState([]);
  const [maxDist, setMaxDist] = useState(0);
  const [distRange, setDistRange] = useState([0, 0]);
  const [filterName, setFilterName] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const {
    isForegroundLoading,
    lastSyncTime,
    startForegroundLoading,
    stopForegroundLoading,
  } = useAsync({ initialForegroundLoading: true });

  const fetchLocations = useCallback(async () => {
    startForegroundLoading();
    const result = await getAllLocations();
    if (!result.ok || !result?.data) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      stopForegroundLoading();
      return;
    }

    const mappedData = result.data.map((loc) => ({
      ...loc,
      id: loc._id,
      name: loc.nameE,
      district: loc.district,
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      num_events: loc.numEvents,
    }));

    /* Compute distance */
    let userCoords = null;
    try {
      userCoords = await getUserLocation();
    } catch {
      showMessage(
        "Failed to get user location. Showing data without distance.",
        MessageTypes.ERROR
      );
      setLocations(mappedData);
      stopForegroundLoading();
      return;
    }

    const locationsWithDist = mappedData.map((loc) => ({
      ...loc,
      distance: haversineDistance(
        userCoords.latitude,
        userCoords.longitude,
        loc.latitude,
        loc.longitude
      ),
    }));

    const distances = locationsWithDist
      .map((x) => x.distance)
      .filter((d) => typeof d === "number" && !Number.isNaN(d));
    if (distances.length) {
      const m = Math.max(...distances);
      setMaxDist(m);
      setDistRange(([min]) => [min, m]);
    }

    setLocations(locationsWithDist);
    stopForegroundLoading();
  }, [showMessage, startForegroundLoading, stopForegroundLoading]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const refresh = useCallback(() => {
    resetMessage();
    fetchLocations();
  }, [fetchLocations, resetMessage]);

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

  return (
    <>
      <LocationSheet
        location={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
      <PageShell title="Map">
        {/* Feedback message */}
        <p hidden={!isShowMessage} className={MessageTypeToColor[messageType]}>
          {message}
        </p>
        {isForegroundLoading ? (
          <LoadingScreen />
        ) : (
          <>
            {/* Sync time indicator */}
            {lastSyncTime && (
              <div className="flex justify-end mb-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Last Updated on{" "}
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : ""}
                </span>
              </div>
            )}
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
                      <Button
                        size="sm"
                        className="ml-auto h-8"
                        onClick={refresh}
                      >
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
          </>
        )}
      </PageShell>
    </>
  );
}
