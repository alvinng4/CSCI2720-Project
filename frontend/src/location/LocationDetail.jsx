import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import CommentsList from "./comments-list";
import { getLocation } from "./location.api";
import { getUserLocation, haversineDistance } from "@/lib/utils";
import LoadingScreen from "@/components/ui/loading-screen";
import MapComponent from "./map-component";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import PageShell from "@/components/page-shell";
import ToggleFavourite from "@/components/toggle-favourite";
import useAsync from "@/hooks/use-async";

export function LocationDetail() {
  const { id } = useParams();
  const [commentLength, setCommentLength] = useState(0);
  const [location, setLocation] = useState(null);
  const { message, isShowMessage, messageType, showMessage } = useMessage();
  const {
    isForegroundLoading,
    lastSyncTime,
    startForegroundLoading,
    stopForegroundLoading,
  } = useAsync({ initialForegroundLoading: true });

  function onIsFavouriteUpdate(_, isFavourite) {
    setLocation({
      ...location,
      isFavourite: isFavourite,
    });
  }

  const fetchLocation = useCallback(async () => {
    if (!id) {
      showMessage("Error: Missing location ID", MessageTypes.ERROR);
      return;
    }

    startForegroundLoading();
    const result = await getLocation(id);
    stopForegroundLoading();

    if (!result.ok || !result?.data?.location) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }
    const loc = result.data.location;
    const mappedData = {
      ...loc,
      id: loc?._id,
      name: loc?.nameE,
      num_events: loc?.numEvents,
      latitude: Number(loc?.latitude ?? 0),
      longitude: Number(loc?.longitude ?? 0),
      isFavourite: loc?.isFavourite ?? false,
    };

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
      return;
    }

    setLocation({
      ...mappedData,
      distance: haversineDistance(
        userCoords.latitude,
        userCoords.longitude,
        mappedData.latitude,
        mappedData.longitude
      ),
    })
  }, [
    id,
    startForegroundLoading,
    stopForegroundLoading,
    showMessage,
    setLocation,
  ]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const info = [
    { label: "District", value: location?.district },
    { label: "Latitude", value: location?.latitude },
    { label: "Longitude", value: location?.longitude },
    {
      label: "Distance",
      value: location?.distance != null ? `${location?.distance} km` : "N/A",
    },
    { label: "# Events", value: location?.num_events },
  ];

  if (isForegroundLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <PageShell title={location?.name}>
        {location && (
          <div className="px-4">
            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={MessageTypeToColor[messageType]}
            >
              {message}
            </p>

            {/* Sync time indicator */}
            {lastSyncTime && (
              <div className="flex justify-end mb-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Last Updated on{" "}
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : ""}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Information */}
                <div>
                  {makeSubsectionTitle("Information")}
                  <div className="border rounded-md">
                    <Table>
                      <TableBody>
                        {info.map((item) => (
                          <TableRow key={item.label}>
                            <TableCell className="font-medium w-40">
                              {item.label}
                            </TableCell>
                            <TableCell>{item.value}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell className="font-medium w-40">
                            Favourite
                          </TableCell>
                          <TableCell>
                            <ToggleFavourite
                              location={location}
                              onUpdate={onIsFavouriteUpdate}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Map */}
                <div>
                  {makeSubsectionTitle("Map")}
                  <div className="px-3 py-3 border rounded-md bg-muted/40">
                    {!!location &&
                      !!location?.latitude &&
                      !!location?.longitude && (
                        <MapComponent
                          locations={[location]}
                          center={[location?.latitude, location?.longitude]}
                          style={{
                            height: "500px",
                            width: "100%",
                            zIndex: "1",
                          }}
                        />
                      )}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div>
                {/* Comments */}
                <div>
                  {makeSubsectionTitle(`Comments (${commentLength})`)}
                  <CommentsList
                    className="px-3 py-3 border rounded-md bg-muted/40"
                    locationId={id}
                    setCommentLength={setCommentLength}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </>
  );
}

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}
