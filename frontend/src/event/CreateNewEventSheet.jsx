import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCallback, useEffect, useState } from "react";

import { createEvent } from "./event.api";
import { getAllLocations } from "../location/location.api";
import { MapComponent } from "@/location/map-component";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import { LoadingScreen } from "@/components/ui/loading-screen";
import useAsync from "@/hooks/use-async";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export default function CreateNewEventSheet({
  isCreating,
  stopCreating,
  refresh,
}) {
  const { message, isShowMessage, messageType, showMessage } = useMessage();
  const { isLoading, showInitialLoading, startLoading, stopLoading } =
    useAsync();

  const [locations, setLocations] = useState([]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventDuration, setNewEventDuration] = useState("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventPresenters, setNewEventPresenters] = useState("");

  const fetchLocations = useCallback(async () => {
    startLoading();
    const result = await getAllLocations();
    if (!result?.ok || !result?.data) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      stopLoading();
      return;
    }
    const mappedData = result.data.map((loc) => ({
      ...loc,
      id: loc._id,
      name: loc.nameE,
      isFavourite: loc?.isFavourite ?? false,
    }));
    setLocations(mappedData);
    stopLoading();
  }, [showMessage, startLoading, stopLoading]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const selectedLocation = locations.find((loc) => loc.id === newEventLocation);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!newEventTitle.trim() || !newEventLocation.trim()) {
      showMessage(
        "Missing fields. Title and location must be provided!",
        MessageTypes.ERROR
      );
      return;
    }

    if (isLoading) {
      showMessage(
        "Processing. Please wait before submitting!",
        MessageTypes.ERROR
      );
      return;
    }

    const eventData = {
      titleE: newEventTitle,
      location: newEventLocation,
      preDateE: newEventDate,
      progTimeE: newEventDuration,
      priceE: newEventPrice,
      descE: newEventDescription,
      presenterOrgE: newEventPresenters,
    };

    startLoading();
    showMessage("Connecting to database...");
    const result = await createEvent(eventData);

    if (!result.ok) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }

    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventLocation("");
    setNewEventDate("");
    setNewEventDuration("");
    setNewEventPrice("");
    setNewEventPresenters("");
    stopLoading();
    showMessage("Success! Event is created.", MessageTypes.SPECIAL);
    refresh();
  };

  return (
    <Sheet open={isCreating} onOpenChange={stopCreating}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 h-full">
          <SheetHeader className="px-4">
            <SheetTitle>Create Event (Admin)</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {/* Feedback message */}
            <p
              hidden={!isShowMessage}
              className={MessageTypeToColor[messageType]}
            >
              {message}
            </p>

            {showInitialLoading ? (
              <LoadingScreen />
            ) : (
              // Main contents
              <>
                {/* Details */}
                <>
                  {makeSubsectionTitle("Details")}
                  <div className="space-y-2">
                    <Input
                      placeholder="Event title"
                      value={newEventTitle}
                      onChange={(event) => setNewEventTitle(event.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={newEventDescription}
                      onChange={(event) =>
                        setNewEventDescription(event.target.value)
                      }
                    />
                    <Select
                      value={newEventLocation}
                      onValueChange={(value) => setNewEventLocation(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Date"
                      value={newEventDate}
                      onChange={(event) => setNewEventDate(event.target.value)}
                    />
                    <Input
                      placeholder="Duration"
                      value={newEventDuration}
                      onChange={(event) =>
                        setNewEventDuration(event.target.value)
                      }
                    />
                    <Input
                      placeholder="Price"
                      value={newEventPrice}
                      onChange={(event) => setNewEventPrice(event.target.value)}
                    />
                    <Input
                      placeholder="Presenters"
                      value={newEventPresenters}
                      onChange={(event) =>
                        setNewEventPresenters(event.target.value)
                      }
                    />
                  </div>
                </>

                {/* Map */}
                <>
                  {makeSubsectionTitle("Map")}
                  <div className="px-3 py-3 border rounded-md bg-muted/40">
                    <MapComponent
                      locations={
                        selectedLocation
                          ? [
                              {
                                id: selectedLocation?.id,
                                name: selectedLocation?.name,
                                latitude: selectedLocation?.latitude,
                                longitude: selectedLocation?.longitude,
                              },
                            ]
                          : []
                      }
                      center={[22.3, 114.2]}
                      style={{ height: "200px", width: "100%", zIndex: "1" }}
                    />
                  </div>
                </>

                <SheetFooter>
                  <Button type="submit">Create event</Button>
                </SheetFooter>
              </>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
