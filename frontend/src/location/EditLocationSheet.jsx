import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCallback, useEffect, useState } from "react";

import { getLocation, updateLocation } from "./location.api";
import LoadingScreen from "@/components/ui/loading-screen";
import MapComponent from "@/location/map-component";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import {
  newTerritoriesDistricts,
  kowloonDistricts,
  hkIslandDistricts,
} from "@/constants/districts";
import useAsync from "@/hooks/use-async";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export default function EditLocationSheet({
  locationId,
  isEditing,
  stopEditing,
  refresh,
}) {
  const { message, isShowMessage, messageType, showMessage } = useMessage();
  const {
    isLoading,
    isForegroundLoading,
    startForegroundLoading,
    stopForegroundLoading,
    startBackgroundLoading,
    stopBackgroundLoading,
  } = useAsync({ initialForegroundLoading: true });

  const [location, setLocation] = useState(null);
  const [name, setName] = useState(null);
  const [district, setDistrict] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const updateFields = useCallback(
    (locationData) => {
      setLocation({
        ...locationData,
        id: locationData?._id,
        name: locationData?.nameE,
        latitude: Number(locationData?.latitude ?? 0),
        longitude: Number(locationData?.longitude ?? 0),
      });

      setName(locationData?.nameE);
      setDistrict(locationData?.district);
      setLatitude(Number(locationData?.latitude ?? 0));
      setLongitude(Number(locationData?.longitude ?? 0));
    },
    [setLocation, setName, setDistrict, setLatitude, setLongitude]
  );

  const fetchLocation = useCallback(
    async (locationId) => {
      if (!locationId) {
        showMessage("Error: Missing location ID", MessageTypes.ERROR);
        return;
      }

      startForegroundLoading();
      const result = await getLocation(locationId);
      stopForegroundLoading();

      if (!result.ok || !result?.data?.location) {
        showMessage(
          result?.error || "Error: Something went wrong.",
          MessageTypes.ERROR
        );
        return;
      }

      updateFields(result.data.location);
    },
    [startForegroundLoading, stopForegroundLoading, showMessage, updateFields]
  );

  useEffect(() => {
    fetchLocation(locationId);
  }, [fetchLocation, locationId]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Fill in changed fields
    if (!location) {
      showMessage("Location not found!", MessageTypes.ERROR);
      return;
    }

    const locationData = {};
    if (name !== (location?.name ?? "")) {
      locationData.nameE = name;
    }
    if (district !== (location?.district ?? "")) {
      locationData.district = district;
    }
    if (latitude !== (location?.latitude ?? "")) {
      locationData.latitude = latitude;
    }
    if (longitude !== (location?.longitude ?? "")) {
      locationData.longitude = longitude;
    }

    // Nothing to update
    if (Object.keys(locationData).length === 0) {
      return;
    }

    if (isLoading) {
      showMessage(
        "Processing. Please wait before submitting!",
        MessageTypes.ERROR
      );
      return;
    }

    startBackgroundLoading();
    showMessage("Connecting to database...");
    const result = await updateLocation(locationId, locationData);
    stopBackgroundLoading();

    if (!result?.ok || !result?.data?.location) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }

    updateFields(result.data.location);
    showMessage("Success! Location is updated.", MessageTypes.SPECIAL);
    refresh();
  };

  return (
    <Sheet open={isEditing} onOpenChange={stopEditing}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 h-full">
          <SheetHeader className="px-4">
            <SheetTitle>Edit Location (Admin)</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={MessageTypeToColor[messageType]}
            >
              {message}
            </p>

            {isForegroundLoading ? (
              <LoadingScreen />
            ) : (
              <>
                {/* Details */}
                <div>
                  {makeSubsectionTitle("Details")}
                  <div className="space-y-2">
                    <Input
                      placeholder="Location name"
                      value={name ?? ""}
                      onChange={(event) => setName(event.target.value)}
                    />
                    <Select
                      value={district ?? ""}
                      onValueChange={(value) => setDistrict(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Hong Kong Island</SelectLabel>
                          {hkIslandDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Kowloon</SelectLabel>
                          {kowloonDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>New Territories</SelectLabel>
                          {newTerritoriesDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Latitude"
                      value={latitude ?? 0}
                      type="number"
                      onChange={(event) => setLatitude(event.target.value)}
                    />
                    <Input
                      placeholder="Longitude"
                      value={longitude ?? 0}
                      type="number"
                      onChange={(event) => setLongitude(event.target.value)}
                    />
                  </div>
                </div>

                {/* Map */}
                <div>
                  {makeSubsectionTitle("Map")}
                  <div className="px-3 py-3 border rounded-md bg-muted/40">
                    <MapComponent
                      locations={[
                        {
                          id: locationId,
                          name: name ?? "",
                          district: district ?? "",
                          latitude: latitude ?? 0,
                          longitude: longitude ?? 0,
                        },
                      ]}
                      center={[latitude ?? 22.3, longitude ?? 114.2]}
                      style={{ height: "200px", width: "100%", zIndex: "1" }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <SheetFooter>
            <Button type="submit">Save edit</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
