import { Button } from "@/components/ui/button";
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
  SheetDescription,
} from "@/components/ui/sheet";
import { useFetchLocations } from "./use-fetch-locations";
import { useEffect, useState } from "react";
import { updateEvent } from "./event.api";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export function EditEventSheet({ isEditing, event, onCancel, refresh }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [presenters, setPresenters] = useState("");

  useEffect(() => {
    if (!event) {
      return;
    }
    setTitle(event?.title ?? event?.titleE ?? "");
    setDescription(event?.descE ?? "");
    setLocation(event?.location?._id ?? "");
    setDate(event?.preDateE ?? "");
    setDuration(event?.progTimeE ?? "");
    setPrice(event?.priceE ?? "");
    setPresenters(event?.presenterOrgE ?? "");
  }, [event]);

  const {
    locations,
    loading,
    message,
    isShowMessage,
    messageType,
    showMessage,
    resetMessage,
  } = useFetchLocations();

  const selectedLocation = locations.find((l) => l.id === location);

  const onSuccess = () => {
    alert("Event updated!");
    onCancel();
    refresh();
  };

  return (
    <Sheet open={isEditing} onOpenChange={onCancel}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Edit Event (Admin)</SheetTitle>
          <SheetDescription id="edit-event-desc">
            Edit the selected event details.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              {/* Feedback */}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Select
                    value={location}
                    onValueChange={(v) => setLocation(v)}
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
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <Input
                    placeholder="Duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <Input
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <Input
                    placeholder="Presenters"
                    value={presenters}
                    onChange={(e) => setPresenters(e.target.value)}
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
                              id: selectedLocation.id,
                              name: selectedLocation.name,
                              latitude: selectedLocation.latitude,
                              longitude: selectedLocation.longitude,
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
                    titleE: title,
                    location,
                    preDateE: date,
                    progTimeE: duration,
                    priceE: price,
                    descE: description,
                    presenterOrgE: presenters,
                  };
                  updateEvent(
                    event.id,
                    eventData,
                    showMessage,
                    resetMessage,
                    onSuccess
                  );
                }}
              >
                Save changes
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
