import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapComponent } from "@/location/map-component";
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

function makeSubsectionTitle(title) {
  return <h3 className="text-md font-semibold mb-2">{title}</h3>;
}

export function CreateNewLocationSheet({ isCreating, onCancel, onCreate }) {
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDistrict, setNewLocationDistrict] = useState("");
  const [newLocationLatitude, setNewLocationLatitude] = useState(22.3);
  const [newLocationLongitude, setNewLocationLongitude] = useState(114.2);

  return (
    <Sheet open={isCreating} onOpenChange={onCancel}>
      <SheetContent side="left" className="w-200 flex flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Create Location (Admin)</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
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
                onChange={(event) => setNewLocationLatitude(event.target.value)}
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
          <Button
            onClick={() => {
              const locationData = {
                nameE: newLocationName,
                district: newLocationDistrict,
                latitude: newLocationLatitude,
                longitude: newLocationLongitude,
              };
              onCreate(locationData);
            }}
          >
            Create location
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
