import { Input } from "@/components/ui/input";
import MapComponent from "@/location/map-component";
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
import {
  newTerritoriesDistricts,
  kowloonDistricts,
  hkIslandDistricts,
} from "@/constants/districts";
import { Button } from "@/components/ui/button";

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export function EditLocationSheet({ isEditing, location, onCancel, onSave }) {
  const [editLocationName, setEditLocationName] = useState(
    location.name ?? location.nameE ?? ""
  );
  const [editLocationDistrict, setEditLocationDistrict] = useState(
    location.district
  );
  const [editLocationLatitude, setEditLocationLatitude] = useState(
    location.latitude
  );
  const [editLocationLongitude, setEditLocationLongitude] = useState(
    location.longitude
  );

  if (!location) {
    return (
      <Sheet open={isEditing} onOpenChange={onCancel}>
        <SheetContent side="left" className="w-200 flex flex-col">
          Error: Location data not found
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isEditing} onOpenChange={onCancel}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Edit Location (Admin)</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* Details */}
          <div>
            {makeSubsectionTitle("Details")}
            <div className="space-y-2">
              <Input
                placeholder="Location name"
                value={editLocationName}
                onChange={(event) => setEditLocationName(event.target.value)}
              />
              <Select
                value={editLocationDistrict}
                onValueChange={(value) => setEditLocationDistrict(value)}
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
                value={editLocationLatitude}
                type="number"
                onChange={(event) =>
                  setEditLocationLatitude(event.target.value)
                }
              />
              <Input
                placeholder="Longitude"
                value={editLocationLongitude}
                type="number"
                onChange={(event) =>
                  setEditLocationLongitude(event.target.value)
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
                    id: location.id,
                    name: editLocationName,
                    district: editLocationDistrict,
                    latitude: editLocationLatitude,
                    longitude: editLocationLongitude,
                  },
                ]}
                center={[editLocationLatitude, editLocationLongitude]}
                style={{ height: "200px", width: "100%", zIndex: "1" }}
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={() => {
              const locationData = {
                nameE: editLocationName,
                district: editLocationDistrict,
                latitude: editLocationLatitude,
                longitude: editLocationLongitude,
              };

              onSave(location.id, locationData);
            }}
          >
            Save edit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
