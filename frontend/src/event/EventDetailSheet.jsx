import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";

import { MapComponent } from "@/location/map-component";
import ToggleLike from "@/components/toggle-like";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export default function EventDetailSheet({
  event,
  setSelectedEvent,
  onIsLikeUpdate,
}) {
  const info = [
    { label: "Title", value: event?.titleE },
    { label: "Location", value: event?.location?.nameE },
    { label: "Description", value: event?.descE },
    { label: "Date", value: event?.preDateE },
    { label: "Duration", value: event?.progTimeE },
    { label: "Price", value: event?.priceE },
    { label: "Presenter", value: event?.presenterOrgE },
  ];

  return (
    <Sheet
      open={!!event}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedEvent(null);
        }
      }}
    >
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Event Details</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {event && (
            <>
              {/* Details */}
              <>
                {makeSubsectionTitle("Details")}
                <div className="border rounded-md">
                  <Table>
                    <TableBody>
                      {info.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell className="font-medium w-40">
                            <div className="whitespace-normal break-words">
                              {item.label}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="whitespace-normal break-words">
                              {item.value ?? "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-medium w-40">
                          Likes
                        </TableCell>
                        <TableCell>
                          <ToggleLike event={event} onUpdate={onIsLikeUpdate} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </>

              {/* Map */}
              <>
                {makeSubsectionTitle("Map")}
                <div className="px-3 py-3 border rounded-md bg-muted/40">
                  <MapComponent
                    locations={
                      event?.location
                        ? [
                            {
                              id: event.location._id,
                              name: event.location.nameE,
                              latitude: event.location.latitude,
                              longitude: event.location.longitude,
                            },
                          ]
                        : []
                    }
                    center={[
                      event?.location?.latitude ?? 22.3,
                      event?.location?.longitude ?? 114.2,
                    ]}
                    style={{ height: "200px", width: "100%", zIndex: "1" }}
                  />
                </div>
              </>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
