// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

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
import { useState } from "react";

import { createLocation } from "./location.api";
import MapComponent from "@/location/map-component";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import useAsync from "@/hooks/use-async";
import {
  newTerritoriesDistricts,
  kowloonDistricts,
  hkIslandDistricts,
} from "@/constants/districts";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export default function CreateNewLocationSheet({
  isCreating,
  stopCreating,
  refresh,
}) {
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDistrict, setNewLocationDistrict] = useState("");
  const [newLocationLatitude, setNewLocationLatitude] = useState(22.3);
  const [newLocationLongitude, setNewLocationLongitude] = useState(114.2);

  const { message, isShowMessage, messageType, showMessage, resetMessage } =
    useMessage();
  const { isLoading, startBackgroundLoading, stopBackgroundLoading } =
    useAsync();

  const onSubmit = async (e) => {
    e.preventDefault();
    resetMessage();

    if (newLocationName === "") {
      showMessage("Error: location name must be provided", MessageTypes.ERROR);
      return;
    }
    if (newLocationDistrict === "") {
      showMessage("Error: district must be provided", MessageTypes.ERROR);
      return;
    }
    if (newLocationLatitude === null) {
      showMessage("Error: latitude must be provided", MessageTypes.ERROR);
      return;
    }

    if (newLocationLongitude === null) {
      showMessage("Error: longitude must be provided", MessageTypes.ERROR);
      return;
    }

    if (isLoading) {
      showMessage(
        "Processing. Please wait before submitting!",
        MessageTypes.ERROR
      );
      return;
    }

    const locationData = {
      nameE: newLocationName,
      district: newLocationDistrict,
      latitude: newLocationLatitude,
      longitude: newLocationLongitude,
    };

    startBackgroundLoading();
    showMessage("Connecting to database...");
    const result = await createLocation(locationData);
    stopBackgroundLoading();

    if (!result.ok) {
      showMessage(
        "Error: " + result?.error || "Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }

    setNewLocationName("");
    showMessage("Success! Location is created.", MessageTypes.SPECIAL);
    refresh();
  };

  return (
    <Sheet open={isCreating} onOpenChange={stopCreating}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 h-full">
          <SheetHeader className="px-4">
            <SheetTitle>Create Location (Admin)</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={MessageTypeToColor[messageType]}
            >
              {message}
            </p>

            {/* Details */}
            <div>
              {makeSubsectionTitle("Details")}
              <div className="space-y-2">
                <Input
                  placeholder="Location name"
                  value={newLocationName}
                  onChange={(event) => setNewLocationName(event.target.value)}
                />
                <Select
                  value={newLocationDistrict}
                  onValueChange={(value) => setNewLocationDistrict(value)}
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
                  value={newLocationLatitude}
                  type="number"
                  onChange={(event) =>
                    setNewLocationLatitude(event.target.value)
                  }
                />
                <Input
                  placeholder="Longitude"
                  value={newLocationLongitude}
                  type="number"
                  onChange={(event) =>
                    setNewLocationLongitude(event.target.value)
                  }
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
                      id: 0,
                      name: newLocationName,
                      latitude: newLocationLatitude,
                      longitude: newLocationLongitude,
                    },
                  ]}
                  center={[newLocationLatitude, newLocationLongitude]}
                  style={{ height: "200px", width: "100%", zIndex: "1" }}
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={onsubmit}>Create location</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
