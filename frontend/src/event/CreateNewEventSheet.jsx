import { Button } from "@/components/ui/button";
import { createEvent } from "./event.api";
import { Input } from "@/components/ui/input";
import { MapComponent } from "@/location/map-component";
import { MessageTypeToColor } from "@/hooks/use-message";
import { LoadingScreen } from "@/components/ui/loading-screen";
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
import { useFetchLocations } from "./use-fetch-locations";
import { useState } from "react";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export function CreateNewEventSheet({ isCreating, onCancel, refresh }) {
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventDuration, setNewEventDuration] = useState("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventPresenters, setNewEventPresenters] = useState("");

  const {
    locations,
    loading,
    message,
    isShowMessage,
    messageType,
    showMessage,
    resetMessage,
  } = useFetchLocations();

  const selectedLocation = locations.find((loc) => loc.id === newEventLocation);

  const onSuccess = () => {
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventLocation("");
    setNewEventDate("");
    setNewEventDuration("");
    setNewEventPrice("");
    setNewEventPresenters("");

    alert("Event is created!");
    onCancel();
    refresh();
  };

  return (
    <Sheet open={isCreating} onOpenChange={onCancel}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Create Event (Admin)</SheetTitle>
        </SheetHeader>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
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
              </div>

              {/* Map */}
              <div>
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
              </div>
            </div>
            <SheetFooter>
              <Button
                onClick={() => {
                  const eventData = {
                    titleE: newEventTitle,
                    location: newEventLocation,
                    preDateE: newEventDate,
                    progTimeE: newEventDuration,
                    priceE: newEventPrice,
                    descE: newEventDescription,
                    presenterOrgE: newEventPresenters,
                  };
                  createEvent(eventData, showMessage, resetMessage, onSuccess);
                }}
              >
                Create event
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
