import { Button } from "@/components/ui/button";
import { CommentsList } from "@/components/comments-list";
import { MapComponent } from "@/components/map-component";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ToggleFavourite } from "@/components/toggle-favourite";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function LocationSheet({ location, setSelectedLocation }) {
  const navigate = useNavigate();
  const [commentLength, setCommentLength] = useState(null);

  if (!location) return null;

  const info = [
    { label: "District", value: location.district },
    {
      label: "Distance",
      value: location.distance != null ? `${location.distance} km` : "N/A",
    },
    { label: "# Events", value: location.num_events },
  ];

  return (
    <Sheet
      open={!!location}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedLocation(null);
        }
      }}
    >
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>{location?.name}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
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
                      <ToggleFavourite isFavourite={location.isFavourite} />
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
              <MapComponent
                locations={[location]}
                center={[location?.latitude, location?.longitude]}
                style={{ height: "200px", width: "100%", zIndex: "1" }}
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            {makeSubsectionTitle(`Comments (${commentLength})`)}
            <CommentsList
              className="px-3 py-3 border rounded-md bg-muted/40"
              location={location}
              setCommentLength={setCommentLength}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={() => navigate(`/location/${location.id}`)}>
            See details
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}
