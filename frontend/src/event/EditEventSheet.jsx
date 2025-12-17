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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCallback, useEffect, useState } from "react";

import { updateEvent, getEvent } from "./event.api";
import { getAllLocations } from "../location/location.api";
import MapComponent from "@/location/map-component";
import {
  MessageTypes,
  MessageTypeToColor,
  useMessage,
} from "@/hooks/use-message";
import LoadingScreen from "@/components/ui/loading-screen";
import useAsync from "@/hooks/use-async";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export default function EditEventSheet({
  id,
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

  const [event, setEvent] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [presenters, setPresenters] = useState("");

  function updateFields(eventData) {
    setEvent({ ...eventData, id: eventData._id });
    setTitle(eventData?.titleE ?? "");
    setDescription(eventData?.descE ?? "");
    setLocationId(eventData?.location?._id ?? "");
    setDate(eventData?.preDateE ?? "");
    setDuration(eventData?.progTimeE ?? "");
    setPrice(eventData?.priceE ?? "");
    setPresenters(eventData?.presenterOrgE ?? "");
  }

  /* Fetch event */
  const fetchEvent = useCallback(async () => {
    const result = await getEvent(id);
    if (!result.ok || !result?.data?.event) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }
    const tempEvent = result.data.event;
    updateFields(tempEvent);
  }, [id, showMessage]);

  /* Fetch locations */
  const fetchLocations = useCallback(async () => {
    const result = await getAllLocations();
    if (!result.ok || !result?.data) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }
    const mappedData = result.data.map((loc) => ({
      ...loc,
      id: loc._id,
      name: loc.nameE,
    }));
    setLocations(mappedData);
  }, [showMessage]);

  useEffect(() => {
    (async () => {
      startForegroundLoading();
      await fetchEvent();
      await fetchLocations();
      stopForegroundLoading();
    })();
  }, [
    startForegroundLoading,
    stopForegroundLoading,
    fetchEvent,
    fetchLocations,
  ]);

  const selectedLocation = locations.find((loc) => loc.id === locationId);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) {
      showMessage(
        "Processing. Please wait before submitting!",
        MessageTypes.ERROR
      );
      return;
    }

    // Fill in changed fields
    const eventData = {};
    if (title !== (event?.titleE ?? "")) {
      eventData.titleE = title;
    }
    if (locationId !== (event?.location?._id ?? "")) {
      eventData.location = locationId;
    }
    if (date !== (event?.preDateE ?? "")) {
      eventData.preDateE = date;
    }
    if (duration !== (event?.progTimeE ?? "")) {
      eventData.progTimeE = duration;
    }
    if (price !== (event?.priceE ?? "")) {
      eventData.priceE = price;
    }
    if (description !== (event?.descE ?? "")) {
      eventData.descE = description;
    }
    if (presenters !== (event?.presenterOrgE ?? "")) {
      eventData.presenterOrgE = presenters;
    }

    // Nothing to update
    if (Object.keys(eventData).length === 0) {
      return;
    }

    startBackgroundLoading();
    showMessage("Connecting to database...");
    const result = await updateEvent(id, eventData);
    stopBackgroundLoading();

    if (!result?.ok || !result?.data?.event) {
      showMessage(
        result?.error || "Error: Something went wrong.",
        MessageTypes.ERROR
      );
      return;
    }

    updateFields(result.data.event);
    showMessage("Success! Event is updated.", MessageTypes.SPECIAL);
    refresh();
  };

  return (
    <Sheet open={isEditing} onOpenChange={stopEditing}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 h-full">
          <SheetHeader className="px-4">
            <SheetTitle>Edit Event (Admin)</SheetTitle>
            <SheetDescription id="edit-event-desc">
              Edit the selected event details.
            </SheetDescription>
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
              event && (
                // Main contents
                <>
                  {/* Details */}
                  <>
                    {makeSubsectionTitle("Details")}
                    <div className="space-y-2">
                      <Input
                        placeholder="Event title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                      />
                      <Input
                        placeholder="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                      <Select
                        value={locationId}
                        onValueChange={(value) => setLocationId(value)}
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
                        onChange={(event) => setDate(event.target.value)}
                      />
                      <Input
                        placeholder="Duration"
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                      />
                      <Input
                        placeholder="Price"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                      />
                      <Input
                        placeholder="Presenters"
                        value={presenters}
                        onChange={(event) => setPresenters(event.target.value)}
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
                    <Button type="submit">Save changes</Button>
                  </SheetFooter>
                </>
              )
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
